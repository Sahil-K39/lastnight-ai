import express, { NextFunction, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const app = express();
const REQUEST_JSON_LIMIT = process.env.REQUEST_JSON_LIMIT || "35mb";
app.use(express.json({ limit: REQUEST_JSON_LIMIT }));

app.use((error: any, _req: Request, res: Response, next: NextFunction) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Upload payload is too large. Keep files under 10MB each and 20MB total.",
    });
  }
  next(error);
});

const configuredPort = Number(process.env.PORT || 3000);
const PORT = Number.isFinite(configuredPort) ? configuredPort : 3000;
const HOST = process.env.HOST || "127.0.0.1";
const allowedAiProviders = new Set(["gemini", "ollama"]);
const AI_PROVIDER = normalizeAiProvider(process.env.AI_PROVIDER);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
const MAX_MATERIALS = 8;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_CHARS = 12000;
const MAX_SUBJECT_CHARS = 140;
const API_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const configuredRateLimit = Number(process.env.API_RATE_LIMIT_MAX || 30);
const API_RATE_LIMIT_MAX = Number.isFinite(configuredRateLimit) ? configuredRateLimit : 30;
const allowedTimeLeft = new Set(["3 hours", "6 hours", "1 night", "2 days"]);

type AiProvider = "gemini" | "ollama";

type UploadedMaterial = {
  name?: string;
  fileName?: string;
  type?: string;
  fileType?: string;
  sourceKind?: string;
  size?: number;
  fileSize?: string;
  text?: string;
  fileContent?: string;
  dataUrl?: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function normalizeAiProvider(value: unknown): AiProvider {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return allowedAiProviders.has(normalized) ? normalized as AiProvider : "gemini";
}

function safeText(value: unknown, fallback = "", maxLength = 4000) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function safeSubject(value: unknown, fallback = "General Engineering Study Kit") {
  return safeText(value, fallback, MAX_SUBJECT_CHARS) || fallback;
}

function safeTimeLeft(value: unknown) {
  const normalized = safeText(value, "1 night", 24).toLowerCase();
  return allowedTimeLeft.has(normalized) ? normalized : "1 night";
}

function bytesFromDataUrl(dataUrl?: string) {
  if (!dataUrl) return 0;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return 0;
  const base64Payload = match[2].replace(/\s/g, "");
  return Math.floor((base64Payload.length * 3) / 4);
}

function normalizeFileName(name: unknown, fallback: string) {
  const cleaned = safeText(name, fallback, 180).replace(/[^\w.\- ()]/g, "_");
  return cleaned || fallback;
}

function getClientKey(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "local";
}

function rateLimitApiRequests(req: Request, res: Response, next: NextFunction) {
  if (API_RATE_LIMIT_MAX <= 0) return next();

  const now = Date.now();
  const key = getClientKey(req);
  const current = rateLimitBuckets.get(key);
  const bucket = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + API_RATE_LIMIT_WINDOW_MS };

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);

  if (bucket.count > API_RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  return next();
}

function requireConfiguredAppSecret(req: Request, res: Response, next: NextFunction) {
  const sharedSecret = process.env.APP_SHARED_SECRET;
  if (!sharedSecret) return next();

  const bearer = req.headers.authorization === `Bearer ${sharedSecret}`;
  const headerSecret = req.headers["x-lastnight-app-secret"] === sharedSecret;
  if (!bearer && !headerSecret) {
    return res.status(401).json({ error: "Unauthorized request." });
  }

  return next();
}

function getAiModel() {
  return AI_PROVIDER === "gemini" ? GEMINI_MODEL : OLLAMA_MODEL;
}

function isAiProviderConfigured(provider: AiProvider = AI_PROVIDER) {
  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key !== "MY_GEMINI_API_KEY");
  }
  return Boolean(OLLAMA_BASE_URL && OLLAMA_MODEL);
}

function normalizeMaterials(rawMaterials: unknown): UploadedMaterial[] {
  if (!Array.isArray(rawMaterials)) return [];
  let totalBytes = 0;

  return rawMaterials
    .slice(0, MAX_MATERIALS)
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          name: safeText(item, `Material ${index + 1}`, 120),
          type: "source-tag",
        };
      }
      if (item && typeof item === "object") {
        const material = item as UploadedMaterial;
        const dataUrl = safeText(material.dataUrl, "", 32 * 1024 * 1024);
        const dataBytes = bytesFromDataUrl(dataUrl);
        const canKeepBinary = dataUrl && dataBytes > 0 && dataBytes <= MAX_FILE_BYTES && totalBytes + dataBytes <= MAX_TOTAL_FILE_BYTES;
        if (canKeepBinary) totalBytes += dataBytes;

        return {
          name: normalizeFileName(material.name || material.fileName, `Material ${index + 1}`),
          type: safeText(material.type || material.fileType, "application/octet-stream", 140),
          sourceKind: safeText(material.sourceKind, "other", 40),
          size: typeof material.size === "number" ? material.size : dataBytes || undefined,
          fileSize: safeText(material.fileSize, "", 40),
          text: safeText(material.text || material.fileContent, "", MAX_TEXT_CHARS),
          dataUrl: canKeepBinary ? dataUrl : undefined,
        };
      }
      return null;
    })
    .filter(Boolean) as UploadedMaterial[];
}

function describeMaterials(materials: UploadedMaterial[]): string {
  if (!materials.length) return "No custom documents were provided.";
  return materials
    .map((material, index) => {
      const label = material.name || `Material ${index + 1}`;
      const size = material.size ? `, ${Math.round(material.size / 1024)} KB` : "";
      const type = material.type ? `, ${material.type}` : "";
      const sourceKind = material.sourceKind ? `, source: ${material.sourceKind}` : "";
      const excerpt = material.text
        ? `\nExcerpt:\n${material.text.slice(0, 5000)}`
        : "";
      return `- ${label}${type}${sourceKind}${size}${excerpt}`;
    })
    .join("\n\n");
}

const textArraySchema = {
  type: "array",
  items: { type: "string" },
};

const predictionResponseSchema = {
  type: "object",
  properties: {
    courseName: { type: "string" },
    description: { type: "string" },
    examStrategy: { type: "string" },
    confidenceLevel: { type: "string" },
    pyqPatternAnalysis: {
      type: "object",
      properties: {
        summary: { type: "string" },
        repeatedPatterns: textArraySchema,
        sourceCoverage: { type: "string" },
      },
      required: ["summary", "repeatedPatterns", "sourceCoverage"],
    },
    unitWiseImportance: {
      type: "array",
      items: {
        type: "object",
        properties: {
          unit: { type: "string" },
          importance: { type: "string" },
          reason: { type: "string" },
          topics: textArraySchema,
        },
        required: ["unit", "importance", "reason", "topics"],
      },
    },
    highPriorityTopics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          topic: { type: "string" },
          importance: { type: "string" },
          reason: { type: "string" },
          subtopics: textArraySchema,
        },
        required: ["id", "topic", "importance", "reason", "subtopics"],
      },
    },
    importantQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          likelihood: { type: "string" },
          percentage: { type: "integer" },
          marks: { type: "string" },
          explanation: { type: "string" },
          tags: textArraySchema,
        },
        required: ["id", "question", "likelihood", "percentage", "marks", "explanation", "tags"],
      },
    },
    revisionNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          summary: { type: "string" },
          keyPoints: textArraySchema,
          formulaOrDiagramPrompt: { type: "string" },
        },
        required: ["id", "title", "summary", "keyPoints"],
      },
    },
    vivaQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          answer: { type: "string" },
          examinerAngle: { type: "string" },
        },
        required: ["id", "question", "answer", "examinerAngle"],
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          options: textArraySchema,
          correctAnswerIndex: { type: "integer" },
          explanation: { type: "string" },
        },
        required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
      },
    },
    summary: { type: "string" },
    studyPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          time: { type: "string" },
          task: { type: "string" },
          detail: { type: "string" },
          active: { type: "boolean" },
        },
        required: ["id", "time", "task", "detail", "active"],
      },
    },
    heatmapTags: textArraySchema,
  },
  required: [
    "courseName",
    "description",
    "examStrategy",
    "confidenceLevel",
    "pyqPatternAnalysis",
    "unitWiseImportance",
    "highPriorityTopics",
    "importantQuestions",
    "revisionNotes",
    "vivaQuestions",
    "quiz",
    "summary",
    "studyPlan",
  ],
};

function parseResponseJson(textOutput: string) {
  const trimmed = textOutput.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("AI response did not contain valid JSON.");
  }
}

function stringList(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => safeText(item, "", 120)).filter(Boolean);
}

function normalizePyqPatternAnalysis(value: unknown, fallback: any) {
  const source = value && typeof value === "object" ? value as any : {};
  return {
    summary: safeText(source.summary, "PYQ pattern analysis is inferred from uploaded files, source labels, and common exam repetition signals.", 700),
    repeatedPatterns: stringList(
      source.repeatedPatterns,
      (fallback.highPriorityTopics || []).slice(0, 4).map((topic: any) => `${topic.topic} appears high-yield`)
    ).slice(0, 8),
    sourceCoverage: safeText(source.sourceCoverage, "Uses uploaded text excerpts when available and falls back to subject-level exam patterns when file text is unavailable.", 420),
  };
}

function normalizeUnitWiseImportance(value: unknown, fallback: any) {
  const source = Array.isArray(value) ? value : [];
  const units = source.slice(0, 8).map((unit: any, index: number) => ({
    unit: safeText(unit?.unit, `Unit ${index + 1}`, 140),
    importance: ["Critical", "High", "Medium", "Low"].includes(unit?.importance) ? unit.importance : "High",
    reason: safeText(unit?.reason, "Important because it overlaps with high-priority topics and likely written questions.", 360),
    topics: stringList(unit?.topics, []).slice(0, 8),
  }));

  if (units.length) return units;

  return (fallback.highPriorityTopics || []).slice(0, 5).map((topic: any, index: number) => ({
    unit: `Unit ${index + 1}`,
    importance: topic.importance || "High",
    reason: topic.reason || "High-yield topic for the selected exam window.",
    topics: [topic.topic, ...(topic.subtopics || [])].slice(0, 6),
  }));
}

function ensurePredictionData(rawPrediction: any, subject: string, selectedTime: string) {
  const fallback = generateLocalPredictions(subject, selectedTime);
  const prediction = rawPrediction && typeof rawPrediction === "object" ? rawPrediction : {};

  const highPriorityTopics = Array.isArray(prediction.highPriorityTopics)
    ? prediction.highPriorityTopics.slice(0, 8).map((topic: any, index: number) => ({
        id: safeText(topic?.id, `t-${index + 1}`, 80),
        topic: safeText(topic?.topic, fallback.highPriorityTopics[index]?.topic || `Priority Topic ${index + 1}`, 180),
        importance: ["Critical", "High", "Medium"].includes(topic?.importance) ? topic.importance : "High",
        reason: safeText(topic?.reason, "High-yield topic based on uploaded material and common exam patterns.", 420),
        subtopics: stringList(topic?.subtopics, fallback.highPriorityTopics[index]?.subtopics || []).slice(0, 6),
      }))
    : [];

  const rawQuestions = Array.isArray(prediction.importantQuestions) ? prediction.importantQuestions : prediction.questions;
  const questions = Array.isArray(rawQuestions)
    ? rawQuestions.slice(0, 8).map((question: any, index: number) => ({
        id: safeText(question?.id, `q-${index + 1}`, 80),
        question: safeText(question?.question, fallback.questions[index]?.question || `Important question ${index + 1}`, 500),
        likelihood: question?.likelihood === "Medium" ? "Medium" : "High",
        percentage: Math.min(99, Math.max(1, Number(question?.percentage) || fallback.questions[index]?.percentage || 80)),
        marks: safeText(question?.marks, fallback.questions[index]?.marks || "10 Marks", 40),
        explanation: safeText(question?.explanation, fallback.questions[index]?.explanation || "Write a structured answer with definitions, diagrams, and examples.", 2200),
        tags: stringList(question?.tags, fallback.questions[index]?.tags || []).slice(0, 5),
      }))
    : [];

  const rawRevisionNotes = Array.isArray(prediction.revisionNotes) ? prediction.revisionNotes : prediction.quickRevisionNotes;
  const quickRevisionNotes = Array.isArray(rawRevisionNotes)
    ? rawRevisionNotes.slice(0, 8).map((note: any, index: number) => ({
        id: safeText(note?.id, `rn-${index + 1}`, 80),
        title: safeText(note?.title, fallback.quickRevisionNotes[index]?.title || `Revision Card ${index + 1}`, 160),
        summary: safeText(note?.summary, fallback.quickRevisionNotes[index]?.summary || "", 600),
        keyPoints: stringList(note?.keyPoints, fallback.quickRevisionNotes[index]?.keyPoints || []).slice(0, 8),
        formulaOrDiagramPrompt: safeText(note?.formulaOrDiagramPrompt, "", 500) || undefined,
      }))
    : [];

  const vivaQuestions = Array.isArray(prediction.vivaQuestions)
    ? prediction.vivaQuestions.slice(0, 8).map((question: any, index: number) => ({
        id: safeText(question?.id, `vq-${index + 1}`, 80),
        question: safeText(question?.question, fallback.vivaQuestions[index]?.question || `Viva question ${index + 1}`, 300),
        answer: safeText(question?.answer, fallback.vivaQuestions[index]?.answer || "Answer directly with key terms first.", 900),
        examinerAngle: safeText(question?.examinerAngle, fallback.vivaQuestions[index]?.examinerAngle || "Checks whether you understand the core concept.", 320),
      }))
    : [];

  const quiz = Array.isArray(prediction.quiz)
    ? prediction.quiz.slice(0, 8).map((question: any, index: number) => {
        const options = stringList(question?.options).slice(0, 6);
        const safeOptions = options.length ? options : fallback.quiz[index]?.options || ["Option A", "Option B", "Option C", "Option D"];
        return {
          id: safeText(question?.id, `qz-${index + 1}`, 80),
          question: safeText(question?.question, fallback.quiz[index]?.question || `Quiz question ${index + 1}`, 300),
          options: safeOptions,
          correctAnswerIndex: Math.min(safeOptions.length - 1, Math.max(0, Number(question?.correctAnswerIndex) || 0)),
          explanation: safeText(question?.explanation, fallback.quiz[index]?.explanation || "", 800),
        };
      })
    : [];

  const studyPlan = Array.isArray(prediction.studyPlan)
    ? prediction.studyPlan.slice(0, 8).map((plan: any, index: number) => ({
        id: safeText(plan?.id, `p-${index + 1}`, 80),
        time: safeText(plan?.time, fallback.studyPlan[index]?.time || `Phase ${index + 1}`, 100),
        task: safeText(plan?.task, fallback.studyPlan[index]?.task || "Focused revision", 180),
        detail: safeText(plan?.detail, fallback.studyPlan[index]?.detail || "Work through the highest-yield material first.", 600),
        active: Boolean(plan?.active ?? index === 0),
      }))
    : [];

  const confidence = safeText(prediction.confidenceLevel || prediction.confidence, fallback.confidence, 80);
  const pyqPatternAnalysis = normalizePyqPatternAnalysis(prediction.pyqPatternAnalysis, fallback);
  const unitWiseImportance = normalizeUnitWiseImportance(prediction.unitWiseImportance, fallback);
  const normalizedQuestions = questions.length ? questions : fallback.questions;
  const normalizedRevisionNotes = quickRevisionNotes.length ? quickRevisionNotes : fallback.quickRevisionNotes;
  const normalizedHighPriorityTopics = highPriorityTopics.length ? highPriorityTopics : fallback.highPriorityTopics;
  const normalizedStudyPlan = studyPlan.length ? studyPlan : fallback.studyPlan;

  return {
    courseName: safeText(prediction.courseName, fallback.courseName, 160),
    description: safeText(prediction.description, fallback.description, 500),
    confidence,
    confidenceLevel: confidence,
    accuracy: safeText(prediction.accuracy, "AI confidence estimate, not a guaranteed historic accuracy claim", 160),
    examStrategy: safeText(prediction.examStrategy, fallback.examStrategy, 1500),
    pyqPatternAnalysis,
    unitWiseImportance,
    highPriorityTopics: normalizedHighPriorityTopics,
    importantQuestions: normalizedQuestions,
    questions: normalizedQuestions,
    revisionNotes: normalizedRevisionNotes,
    quickRevisionNotes: normalizedRevisionNotes,
    vivaQuestions: vivaQuestions.length ? vivaQuestions : fallback.vivaQuestions,
    quiz: quiz.length ? quiz : fallback.quiz,
    summary: safeText(prediction.summary, fallback.summary, 900),
    studyPlan: normalizedStudyPlan,
    heatmapTags: stringList(prediction.heatmapTags, fallback.heatmapTags).slice(0, 12),
  };
}

async function runPrediction(subject: string, materials: UploadedMaterial[], selectedTime: string) {
  if (!isAiProviderConfigured()) {
    console.log(`AI provider "${AI_PROVIDER}" is not configured. Injecting local predictions for demo continuity.`);
    return ensurePredictionData(generateLocalPredictions(subject, selectedTime), subject, selectedTime);
  }

  try {
    const rawPrediction = AI_PROVIDER === "gemini"
      ? await runGeminiPrediction(subject, materials, selectedTime)
      : await runOllamaPrediction(subject, materials, selectedTime);
    return ensurePredictionData(rawPrediction, subject, selectedTime);
  } catch (error) {
    console.error(`${AI_PROVIDER} prediction API error:`, error);
    return ensurePredictionData(generateLocalPredictions(subject, selectedTime), subject, selectedTime);
  }
}

function toMobileAnalysisResponse(prediction: any, timeLeft: string) {
  return {
    subjectName: prediction.courseName,
    timeLeft,
    summary: prediction.summary,
    examStrategy: {
      title: "AI Triage Directive",
      rating: prediction.confidence === "Very High" ? "CRITICAL" : "URGENT",
      description: prediction.examStrategy,
      keyHacks: prediction.heatmapTags?.slice(0, 4) || [],
    },
    highPriorityTopics: (prediction.highPriorityTopics || []).map((topic: any) => ({
      topicName: topic.topic,
      weightage: topic.importance === "Critical" ? "35%" : "20%",
      importance: topic.importance,
      subtopics: topic.subtopics || [],
    })),
    importantQuestions: (prediction.questions || []).map((question: any) => ({
      id: question.id,
      question: question.question,
      frequency: `${question.percentage || 80}% likelihood`,
      expectedAnswer: question.explanation,
    })),
    quickRevisionNotes: (prediction.quickRevisionNotes || []).map((note: any) => ({
      heading: note.title,
      points: note.keyPoints || [],
      formulaCode: note.formulaOrDiagramPrompt || null,
    })),
    vivaQuestions: (prediction.vivaQuestions || []).map((question: any) => ({
      question: question.question,
      instantAnswer: question.answer,
    })),
    quizQuestions: prediction.quiz || [],
    panicModeStudyPlan: (prediction.studyPlan || []).map((plan: any) => ({
      timeSlot: plan.time,
      taskTitle: plan.task,
      taskDescription: plan.detail,
      focusArea: plan.active ? "Start here" : "Next",
    })),
  };
}

function parseDataUrlPayload(dataUrl?: string) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    base64Payload: match[2].replace(/\s/g, ""),
  };
}

function canSendGeminiInlineData(mimeType: string) {
  return mimeType === "application/pdf" || mimeType.startsWith("image/") || mimeType.startsWith("text/");
}

function buildGeminiParts(prompt: string, materials: UploadedMaterial[]) {
  const parts: any[] = [{ text: prompt }];

  for (const material of materials) {
    const parsed = parseDataUrlPayload(material.dataUrl);
    if (!parsed || !canSendGeminiInlineData(parsed.mimeType)) continue;
    const approxBytes = Math.floor((parsed.base64Payload.length * 3) / 4);
    if (approxBytes > MAX_FILE_BYTES) continue;

    parts.push({
      inlineData: {
        mimeType: parsed.mimeType,
        data: parsed.base64Payload,
      },
    });
  }

  return parts;
}

async function fetchJsonWithTimeout(url: string, init: RequestInit) {
  const timeoutMs = Math.max(5000, Number(process.env.AI_TIMEOUT_MS || 45000));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 700)}`);
    }
    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(timer);
  }
}

function extractGeminiText(response: any) {
  const parts = response?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((part: any) => safeText(part?.text, "", 100000)).filter(Boolean).join("\n");
}

async function callGeminiGenerate(parts: any[], structured = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const modelPath = GEMINI_MODEL.startsWith("models/") ? GEMINI_MODEL : `models/${GEMINI_MODEL}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`;
  const generationConfig = structured
    ? {
        temperature: 0.25,
        maxOutputTokens: 8192,
        responseFormat: {
          text: {
            mimeType: "application/json",
            schema: predictionResponseSchema,
          },
        },
      }
    : {
        temperature: 0.35,
        maxOutputTokens: 1200,
      };

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig,
  };

  try {
    return await fetchJsonWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (error: any) {
    if (!structured || !String(error?.message || "").includes("HTTP 400")) {
      throw error;
    }

    const legacyBody = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: predictionResponseSchema,
      },
    };

    return fetchJsonWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(legacyBody),
    });
  }
}

async function runGeminiPrediction(subject: string, materials: UploadedMaterial[], selectedTime: string) {
  const prompt = buildPredictionPrompt(subject, materials, selectedTime);
  const response = await callGeminiGenerate(buildGeminiParts(prompt, materials), true);
  return parseResponseJson(extractGeminiText(response));
}

async function runOllamaPrediction(subject: string, materials: UploadedMaterial[], selectedTime: string) {
  const prompt = buildPredictionPrompt(subject, materials, selectedTime);
  const url = `${OLLAMA_BASE_URL}/api/generate`;
  const baseBody = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: { temperature: 0.25 },
  };

  try {
    const response = await fetchJsonWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, format: predictionResponseSchema }),
    });
    return parseResponseJson(response?.response || "");
  } catch (error: any) {
    if (!String(error?.message || "").includes("HTTP 400")) {
      throw error;
    }
    const response = await fetchJsonWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, format: "json" }),
    });
    return parseResponseJson(response?.response || "");
  }
}

async function runAiText(prompt: string) {
  if (!isAiProviderConfigured()) return null;

  if (AI_PROVIDER === "gemini") {
    const response = await callGeminiGenerate([{ text: prompt }]);
    return extractGeminiText(response);
  }

  const response = await fetchJsonWithTimeout(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.35 },
    }),
  });

  return safeText(response?.response, "", 8000);
}

function buildPredictionPrompt(subject: string, materials: UploadedMaterial[], selectedTime: string) {
  return `You are LastNight AI, an AI-powered exam survival agent built for a shipping-focused AI builders hackathon.

Mission: help a student convert messy syllabus notes, lecture snippets, and PYQs into a study kit they can actually use with "${selectedTime}" left before the exam.

Subject: "${subject}"
Time left: "${selectedTime}"
Uploaded material inventory and text excerpts:
${describeMaterials(materials)}

Generate evidence-aware recommendations:
- Prefer details found in the uploaded materials or excerpts.
- If only metadata is available for a file, say less confidently and infer from the subject.
- Build a practical, time-boxed plan for the exact deadline.
- Optimize for a working product: concise, actionable, student-ready output.

Return JSON only, matching this exact product schema and key names:
{
  "courseName": "Dynamic parsed title based on subject",
  "description": "Short explanation of the exam prep kit optimized for the time left and uploaded files",
  "examStrategy": "Direct answer to what the student should study first and why",
  "confidenceLevel": "High or Very High",
  "pyqPatternAnalysis": {
    "summary": "What repeated PYQ or syllabus pattern is visible",
    "repeatedPatterns": ["Repeated unit/question pattern 1", "Repeated unit/question pattern 2"],
    "sourceCoverage": "Say whether this is based on uploaded text/files or inferred from subject metadata"
  },
  "unitWiseImportance": [
    {
      "unit": "Unit 1 or syllabus section name",
      "importance": "Critical",
      "reason": "Why this unit should be prioritized",
      "topics": ["Topic 1", "Topic 2"]
    }
  ],
  "highPriorityTopics": [
    {
      "id": "t-1",
      "topic": "Name of highest-priority syllabus topic",
      "importance": "Critical",
      "reason": "Why this matters based on materials or common examiner patterns",
      "subtopics": ["Subtopic 1", "Subtopic 2"]
    }
  ],
  "importantQuestions": [
    {
      "id": "q-1",
      "question": "Predicted exam question prompt",
      "likelihood": "High",
      "percentage": 90,
      "marks": "15 Marks",
      "explanation": "Detailed outline answer the student can write in an exam",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "revisionNotes": [
    {
      "id": "rn-1",
      "title": "Short high-yield concept title",
      "summary": "Core summary",
      "keyPoints": ["Crucial bullet 1", "Crucial bullet 2"]
    }
  ],
  "vivaQuestions": [
    {
      "id": "vq-1",
      "question": "Oral/viva question",
      "answer": "Polished response",
      "examinerAngle": "Keyword or trap the examiner is scanning for"
    }
  ],
  "quiz": [
    {
      "id": "qz-1",
      "question": "Multiple choice prompt",
      "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
      "correctAnswerIndex": 0,
      "explanation": "Why the answer is correct"
    }
  ],
  "summary": "Overall crunch-time guidance",
  "studyPlan": [
    {
      "id": "p-1",
      "time": "Specific timeframe",
      "task": "Action step",
      "detail": "Exactly what to memorize, solve, sketch, or test",
      "active": true
    }
  ],
  "heatmapTags": ["Keyword 1", "Keyword 2", "Keyword 3"]
}`;
}

// Helper to generate dynamic Panic-Mode Study Timelines
function getPanicStudyPlan(timeLeft: string) {
  const norm = (timeLeft || "1 night").toLowerCase();
  if (norm.includes("3 hour")) {
    return [
      {
        id: "p-panic-1",
        time: "First 45 Mins",
        task: "Immersive Topic Triage",
        detail: "Focus 100% on critical priority topics. Memorize definitions and basic architectural block layouts immediately.",
        active: true
      },
      {
        id: "p-panic-2",
        time: "Next 60 Mins",
        task: "Trace Key Predicted Questions",
        detail: "Concentrate on the standard answer summaries of top predicted questions. Memorize crucial core mathematical steps.",
        active: false
      },
      {
        id: "p-panic-3",
        time: "Next 45 Mins",
        task: "Diagnostic Quizzes & Trivia",
        detail: "Take the multiple-choice quiz repeatedly. Skim through tricky viva cards to avoid simple trap details.",
        active: false
      },
      {
        id: "p-panic-4",
        time: "Last 30 Mins",
        task: "Formula Sweep & Grounding",
        detail: "Review quick revision notes. Briefly study formula sheets then rest your eyes. Breathe calmly as you cross the panic line.",
        active: false
      }
    ];
  } else if (norm.includes("6 hour")) {
    return [
      {
        id: "p-panic-1",
        time: "Hour 1-2",
        task: "Syllabus Triage mapping",
        detail: "Speed-read through priority topic blocks and sub-topic divisions. Draft a 1-page reference cheat-sheet.",
        active: true
      },
      {
        id: "p-panic-2",
        time: "Hour 3-4",
        task: "Trace Standard Derivations",
        detail: "Re-sketch CNN block layouts, write down Dijkstra proofs, or trace AVL tree rotational sequences repeatedly on scrap papers.",
        active: false
      },
      {
        id: "p-panic-3",
        time: "Hour 5",
        task: "Predicted Answers study",
        detail: "Carefully study top predicted question keys. Formulate summaries and explain concepts out loud to test memory recall.",
        active: false
      },
      {
        id: "p-panic-4",
        time: "Hour 6",
        task: "Testing & Diagnostic Sync",
        detail: "Self-test with the multiple-choice quiz. Read examiner oral viva tricks. Query the AI Assistant chat for final difficult formulas.",
        active: false
      }
    ];
  } else if (norm.includes("2 day") || norm.includes("48 hour")) {
    return [
      {
        id: "p-panic-1",
        time: "Day 1 Shifts",
        task: "High Priority Theory Mapping",
        detail: "Study critical and high priority topics in detail. Review summary sheets, map complex architectures, and clarify basic theories.",
        active: true
      },
      {
        id: "p-panic-2",
        time: "Day 1 Night",
        task: "Mathematical core validations",
        detail: "Trace heavy formulas and calculations (backpropagation matrices, collision table offsets, Bankers state rows) on scratch pages.",
        active: false
      },
      {
        id: "p-panic-3",
        time: "Day 2 Morning",
        task: "Predicted Exam sheets",
        detail: "Study predicted questions thoroughly. Click 'Start Revision Mode' to use active recall flashcard modules.",
        active: false
      },
      {
        id: "p-panic-4",
        time: "Day 2 Night",
        task: "Interactive MCQ Testing & Viva",
        detail: "Run the MCQ test to clarify remaining blindspots. Read viva trap guidelines and ask the AI Assistant to review edge-cases.",
        active: false
      }
    ];
  } else {
    // Default 1 night / 8-12 hours
    return [
      {
        id: "p-panic-1",
        time: "07:30 PM",
        task: "Learn Critical Concepts First",
        detail: "Focus first on 1st tier critical and high-priority topics. Read summaries, draw core architectural frames, and write down formulas.",
        active: true
      },
      {
        id: "p-panic-2",
        time: "10:00 PM",
        task: "Trace Key Predicted Questions",
        detail: "Work through predicted high likelihood examination sheets. Practice writing structural explanations clearly on paper.",
        active: false
      },
      {
        id: "p-panic-3",
        time: "12:30 AM",
        task: "Diagnostic Quizzes & Flashcards",
        detail: "Run the interactive multiple choice tests. Engage the flashcards panel for active recalls. Skim viva oral examiner guides.",
        active: false
      },
      {
        id: "p-panic-4",
        time: "01:30 AM",
        task: "Formula Sweep & Final Sleep",
        detail: "Review revision summary blocks. Quick scan equations and balance keys, then secure a full night's restful recovery before morning.",
        active: false
      }
    ];
  }
}

// Fallback high-yield content generator for key academic subjects
function generateLocalPredictions(subject: string, timeLeft: string = "1 night"): any {
  const norm = subject.toLowerCase();
  let basePrediction: any;
  
  if (norm.includes("machine") || norm.includes("ml") || norm.includes("ai") || norm.includes("intelligence")) {
    basePrediction = {
      courseName: "Advanced Machine Learning",
      description: "Exam Prep Kit generated on Oct 24. Confidence level: High.",
      confidence: "High",
      accuracy: "AI confidence estimate based on uploaded material and common exam patterns",
      examStrategy: "Focus primarily on Convolutional neural mechanisms and learning regularization tradeoffs (L1 vs L2 limits). Expect a major 15-mark math derivation of backpropagation gradients.",
      highPriorityTopics: [
        {
          id: "t-ml-1",
          topic: "Deep Representation Networks",
          importance: "Critical",
          reason: "Convolutional arithmetic (stride/pooling dimensions) represents 25% of final exam numerical indices.",
          subtopics: ["Stride & padding sizing", "Max pooling downsampling ratio", "Vanishing gradients"]
        },
        {
          id: "t-ml-2",
          topic: "Kernel Decision Boundaries",
          importance: "High",
          reason: "SVM separating margins and RBF kernel formulations are standard Section B choices.",
          subtopics: ["Linear separation boundaries", "RBF kernel scaling parameter", "Hinge loss math"]
        }
      ],
      questions: [
        {
          id: "q-ml-1",
          question: "Explain the architecture of a Convolutional Neural Network (CNN) and describe the function of pooling layers.",
          likelihood: "High",
          percentage: 92,
          marks: "15 Marks",
          explanation: "Explain: (1) Convolutional layers (feature extraction via kernels, stride, padding), (2) Activation functions (specifically ReLU to introduce non-linearity), and (3) Pooling layers (Max pooling vs Average pooling for spatial downsampling, translation invariance, and parameters reduction). Be prepared to draw a simple layout illustrating transition from input tensor to fully connected layer.",
          tags: ["Deep Learning", "Computer Vision"]
        },
        {
          id: "q-ml-2",
          question: "Compare and contrast Support Vector Machines (SVM) with Decision Trees, providing clear use cases for both.",
          likelihood: "Medium",
          percentage: 75,
          marks: "10 Marks",
          explanation: "SVM maps data to high-dimensional space using kernel trick (linear, rbf, poly) to construct optimal separating hyperplanes, works well on complex, small/medium structured data. Decision Trees recursively partition feature space based on entropy/Gini index, highly interpretable but prone to overfitting without pruning. Use SVM for text/bioinformatics; use Decision Trees/Random Forests for tabular business analytics.",
          tags: ["Supervised Learning", "Classifiers"]
        },
        {
          id: "q-ml-3",
          question: "Derive the mathematical formulation of backpropagation in a 3-layer feedforward neural network and explain the vanishing gradient problem.",
          likelihood: "High",
          percentage: 88,
          marks: "20 Marks",
          explanation: "requires computing partial derivatives of the loss function with respect to weights using the chain rule. Vanishing gradient occurs when multiple small derivatives (like sigmoid/tanh activations) are multiplied together during backprop, causing early layer weights to change extremely slowly during training.",
          tags: ["Neural Networks", "Calculus"]
        }
      ],
      quickRevisionNotes: [
        {
          id: "rn-ml-1",
          title: "CNN Kernels & Pooling",
          summary: "Weights sharing enables translation invariance. Features are computed locally over receptive grids.",
          keyPoints: [
            "Output size = ((W - K + 2P)/S) + 1 where W is input, K is kernel, P is padding, S is stride.",
            "Max pooling collects maximum activation over stride area, reducing noise and computational load.",
            "Standard structure: CONV -> RELU -> POOL -> FULLY_CONNECTED"
          ]
        },
        {
          id: "rn-ml-2",
          title: "L1 vs L2 Regularization",
          summary: "Regularization limits weight magnitudes to avoid extreme overfitting behavior.",
          keyPoints: [
            "L1 Regularization (Lasso) adds absolute weight values as penalty, driving non-essential weights to exactly 0.",
            "L2 Regularization (Ridge) adds squared weight values as penalty, uniformly distributing small weights without zero sparsification."
          ]
        }
      ],
      vivaQuestions: [
        {
          id: "vq-ml-1",
          question: "Why does the gradient vanish when using Sigmoid in very deep networks?",
          answer: "The derivative of Sigmoid peaks at 0.25. Multiplications of derivatives below 0.25 across 10+ hidden layers mathematically compound to near-zero values, meaning weights in the early layers receive virtually no weight shifts.",
          examinerAngle: "Point out that ReLU keeps gradient at 1.0 for positive inputs, avoiding multiplier decays."
        },
        {
          id: "vq-ml-2",
          question: "What are Support Vectors in SVM algorithms?",
          answer: "Support Vectors are the specific coordinate points of the data coordinates that lie closest to the separating hyperplane. They define the boundaries and determine the position and margin of the splitting plane; removing other points doesn't affect it.",
          examinerAngle: "Expects you to point out they are the only points defining the separating margin."
        }
      ],
      quiz: [
        {
          id: "qz-ml-1",
          question: "Which of the following activation functions is mathematically defined as max(0, x)?",
          options: ["Sigmoid", "Hyperbolic Tangent", "Softmax", "Rectified Linear Unit (ReLU)"],
          correctAnswerIndex: 3,
          explanation: "ReLU outputs x for positive x and zero for negative x, making it max(0, x)."
        },
        {
          id: "qz-ml-2",
          question: "What model penalty type is also referred to as Lasso regularization which encourages weight sparsity?",
          options: ["L2 Regularization", "L1 Regularization", "Dropout", "Elastic Net"],
          correctAnswerIndex: 1,
          explanation: "L1 adds the absolute values of the coefficients as a penalty and drives some indices to exactly 0, creating sparse weights."
        }
      ],
      summary: "Advanced Machine Learning requires balancing structural CNN drawings with linear SVM mathematical constraints. Focus your exam revision on drawing clear blocks and deriving gradients using the mathematical Chain Rule.",
      studyPlan: [],
      heatmapTags: ["Backpropagation", "Transformers", "Regularization", "K-Means", "PCA", "Gradient descent", "SVM", "Random Forests"]
    };
  } else if (norm.includes("data structure") || norm.includes("cs-201") || norm.includes("algorithm") || norm.includes("coding")) {
    basePrediction = {
      courseName: "Data Structures & Algorithms",
      description: "Exam Prep Kit generated recently. Confidence level: Very High.",
      confidence: "Very High",
      accuracy: "AI confidence estimate based on uploaded material and common exam patterns",
      examStrategy: "Target Balanced Trees (AVL BF rotation equations) and Shortest-Path proof constraints for Section B. These topics represent more than 40% of the past papers numeric trends.",
      highPriorityTopics: [
        {
          id: "t-ds-1",
          topic: "Balanced BST Bounds",
          importance: "Critical",
          reason: "AVL height balancing checks are standard questions worth 15 marks.",
          subtopics: ["AVL rotations", "Red-black trees balancing", "Worst-case bounds"]
        },
        {
          id: "t-ds-2",
          topic: "Graph Routing Failures",
          importance: "High",
          reason: "Demonstrating why Dijkstra fails on negative edge weights is a recurring proof question.",
          subtopics: ["Dijkstra fail-proof", "Bellman Ford relax cycles", "Priority queue updates"]
        }
      ],
      questions: [
        {
          id: "q-ds-1",
          question: "Detailed comparison of AVL Trees vs Red-Black Trees. Analyze the insertion complexity and maximum height bounds of both.",
          likelihood: "High",
          percentage: 94,
          marks: "15 Marks",
          explanation: "AVL Trees are more strictly balanced: height factor difference is at most 1, leading to faster lookups but potentially more rotations on inserts/deletes. Red-Black trees are loosely balanced (longest path is at most twice the shortest path), requiring fewer rotations on inserts/deletes, making them optimal for general map/set implementations (eg. std::map in C++).",
          tags: ["Balanced Trees", "Complexity Analysis"]
        },
        {
          id: "q-ds-2",
          question: "Design and implement a Hash Map that handles collisions using Quadratic Probing and state-by-state resizing criteria.",
          likelihood: "High",
          percentage: 86,
          marks: "10 Marks",
          explanation: "Quadratic Probing avoids primary clustering by choosing slots via (hash(k) + c1*i + c2*i^2) % table_size. Be ready to explain load factor criteria (usually threshold = 0.7 or 0.5) and why table size should be a prime number.",
          tags: ["Hashing", "Collision Resolution"]
        },
        {
          id: "q-ds-3",
          question: "Prove why Dijkstra's algorithm fails with negative edge weights and compare its complexity with Bellman-Ford.",
          likelihood: "Medium",
          percentage: 72,
          marks: "15 Marks",
          explanation: "Dijkstra is a greedy algorithm assuming that once a node is visited, its shortest path is finalized. Negative edge weights can yield shorter paths later which Dijkstra will never re-evaluate. Bellman-Ford checks all edges repeatedly (V-1 times) so it handles negative edges correctly and detects negative cycles.",
          tags: ["Graph Algorithms", "Network Optimization"]
        }
      ],
      quickRevisionNotes: [
        {
          id: "rn-ds-1",
          title: "AVL Tree Rotations Rules",
          summary: "Keeps heights logarithmic. Trigger rotations whenever element height difference exceeds 1.",
          keyPoints: [
            "Balance Factor BF = height(Left) - height(Right) must remain in {-1, 0, 1}.",
            "LL insertion triggers right rotation on violator parent.",
            "LR insertion triggers left rotation on child and then right rotation on violator parent."
          ]
        },
        {
          id: "rn-ds-2",
          title: "Dijkstra Edge Relaxations",
          summary: "Greedily updates nodes based on shortest currently known distance.",
          keyPoints: [
            "Requires positive constraints. Runs at O((V+E) log V) using priority min-heaps.",
            "Fails on negative weight arcs because visited status prevents further distance reduction audits."
          ]
        }
      ],
      vivaQuestions: [
        {
          id: "vq-ds-1",
          question: "What is the primary operational advantage of Red-Black Trees over AVL trees?",
          answer: "Red-Black Trees require significantly fewer rotations during values insertions and deletions (maximum of 2 for insert, 3 for delete) because they run on looser balance principles, making them much faster in write-heavy maps.",
          examinerAngle: "Focuses on write speeds compared to AVL search efficiency."
        },
        {
          id: "vq-ds-2",
          question: "Why should hash table arrays utilize prime dimensions?",
          answer: "Prime numbers minimize mathematical pattern matching and collision clusters when hash functions modulo indices into slots, especially for patterns of inputs sharing common coefficients or differences.",
          examinerAngle: "Expects you to call out pattern exclusion and divisor offsets."
        }
      ],
      quiz: [
        {
          id: "qz-ds-1",
          question: "What is the worst-case search complexity in a Hash Table when collision resolution is poorly handled?",
          options: ["O(log N)", "O(1)", "O(N)", "O(N log N)"],
          correctAnswerIndex: 2,
          explanation: "If all elements hash to the same bucket (forming one long chain), search decays entirely to a standard linear scan of O(N)."
        },
        {
          id: "qz-ds-2",
          question: "Which of the following tree structures guarantees that the longest leaf node path is at most twice the length of the shortest path?",
          options: ["AVL Tree", "Binary Search Tree", "Expression Tree", "Red-Black Tree"],
          correctAnswerIndex: 3,
          explanation: "Red-Black Trees use coloring constraints ensuring the black-height is consistent and no two red nodes are consecutive, making paths differ by at most a factor of 2."
        }
      ],
      summary: "Practice sketching tree structures on scratchpaper. Ensure you understand AVL rotations and how to trace Dijkstra paths manually.",
      studyPlan: [],
      heatmapTags: ["AVL Trees", "Red-Black Trees", "Dijkstra", "Quadratic Probing", "Hash Collision", "Dynamic Programming", "Heap Sort", "BFS/DFS"]
    };
  } else {
    // Default fallback (e.g., Operating Systems or generic study kit)
    basePrediction = {
      courseName: subject || "System Architecture & Operating Systems",
      description: "Exam Prep Kit generated for review. Confidence level: High.",
      confidence: "High",
      accuracy: "AI confidence estimate based on uploaded material and common exam patterns",
      examStrategy: "Focus completely on circular deadlock checks (15 marks) and page fault replacement traces (12 marks). Paging algorithms represent the most recurrent numericals in standard OS papers.",
      highPriorityTopics: [
        {
          id: "t-os-1",
          topic: "Deadlock Mutual Exclusions",
          importance: "Critical",
          reason: "Proving system safety using Banker's calculations is a guaranteed 15-mark Section C choice.",
          subtopics: ["Mutual exclusion rule", "Hold and wait sequence", "Banker's resource matrix"]
        },
        {
          id: "t-os-2",
          topic: "Virtual Storage Paging",
          importance: "High",
          reason: "Tracing page frame requests under FIFO page replacement to show Belady's Anomaly.",
          subtopics: ["Paging mechanisms", "FIFO vs LRU fault logs", "Belady's proof pattern"]
        }
      ],
      questions: [
        {
          id: "q-os-1",
          question: "Explain the four necessary conditions for Deadlock occurrence and outline prevention vs avoidance strategies.",
          likelihood: "High",
          percentage: 95,
          marks: "15 Marks",
          explanation: "The four conditions are: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption, and (4) Circular Wait. Prevention eliminates one of these design patterns structurally. Avoidance dynamically checks resource status using algorithms like Dijkstra's Banker's Algorithm to verify safety.",
          tags: ["Deadlocks", "Process Sync"]
        },
        {
          id: "q-os-2",
          question: "Explain the virtual memory paging system, analyzing Internal vs External fragmentation and Page Replacement Algorithms.",
          likelihood: "High",
          percentage: 89,
          marks: "12 Marks",
          explanation: "Paging divides memory into fixed-size physical frames, eliminating external fragmentation completely. However, internal fragmentation can occur if requested allocation is not a multiple of page size. Study FIFO, LRU, and Optimal Replacement (Belady's Anomaly proof).",
          tags: ["Virtual Memory", "Operating Systems"]
        },
        {
          id: "q-os-3",
          question: "Analyze the difference between User Threads and Kernel Threads. Sketch user space vs kernel space maps.",
          likelihood: "Medium",
          percentage: 67,
          marks: "8 Marks",
          explanation: "User Threads are managed completely in user space without kernel awareness, making thread creation extremely fast but mapping blocked system calls to blocking the entire process. Kernel Threads are scheduled directly by the OS, meaning multi-core systems can run thread instances in true parallel.",
          tags: ["Multithreading", "Scheduling"]
        }
      ],
      quickRevisionNotes: [
        {
          id: "rn-os-1",
          title: "The 4 Deadlock Conditions",
          summary: "Sustained lock loops can form only if ALL 4 rules overlap. Removing even 1 breaks deadlock states.",
          keyPoints: [
            "Mutual Exclusion: Resource must be single-assignable only.",
            "Hold & Wait: Process locks reference while requesting free blocks.",
            "No Preemption: Only holding process can release blocks.",
            "Circular Wait: Process ring pattern where terminal process waits on root resource."
          ]
        },
        {
          id: "rn-os-2",
          title: "Page Fault mechanics",
          summary: "How OS manages memory request traps dynamically.",
          keyPoints: [
            "Reference triggers interrupt if page validity bit is set to 0 in CPU address translations.",
            "OS pauses operations, fetches target blocks from disk sector arrays, and logs frame mappings."
          ]
        }
      ],
      vivaQuestions: [
        {
          id: "vq-os-1",
          question: "Why does FIFO paging fail with Belady's Anomaly?",
          answer: "Because FIFO does not take into account the locality of resource usage. It strictly removes elements in queued sequence, occasionally ejecting heavily used index pages which triggers consecutive page faults.",
          examinerAngle: "Point out that LRU does not exhibit this because it belongs to Stack Paging models."
        },
        {
          id: "vq-os-2",
          question: "What is context switching overhead?",
          answer: "It is the time delay CPU cores cost storing process registers, execution pointer blocks, and Page Tables inside memory, before loading the replacement threads. It adds non-productive queue processing seconds.",
          examinerAngle: "Ask how switching speed differs between thread objects and process registers."
        }
      ],
      quiz: [
        {
          id: "qz-os-1",
          question: "Which necessary condition of deadlock is targeted when we execute spooling systems?",
          options: ["Hold and Wait", "No Preemption", "Mutual Exclusion", "Circular Wait"],
          correctAnswerIndex: 2,
          explanation: "Spooling manages single locks through printer queues, converting isolated blocks into non-exclusive items to remove Mutual Exclusion."
        },
        {
          id: "qz-os-2",
          question: "What condition holds if safe execution queues trace out to completion within the Banker's Safety Matrix?",
          options: ["Deadlock is unavoidable", "System is in a Safe State", "Thrashing has occurred", "Internal fragmentation is zero"],
          correctAnswerIndex: 1,
          explanation: "A safe sequence proves that even under worse-case resource allocations, at least one thread ordering completes safely, avoiding deadlocks completely."
        }
      ],
      summary: "Operating Systems focus on resource locking models and virtual mappings. Practice Banker safety matrices and page fault frame tracking logs on scratchpads before tomorrow.",
      studyPlan: [],
      heatmapTags: ["Deadlocks", "Mutex/Semaphores", "Banker's Algorithm", "Paging", "Belady's Anomaly", "LRU/FIFO", "Round Robin", "Context Switching"]
    };
  }

  // Inject computed Panic studyTimeline
  basePrediction.studyPlan = getPanicStudyPlan(timeLeft);
  basePrediction.description = `Exam Prep Kit optimized for absolute ${timeLeft} crunch threshold. Confidence level: High.`;

  // Custom tune strategy for extremely short times
  if (timeLeft.includes("3 hour")) {
    basePrediction.examStrategy = `DEEP PANIC MODE (3 Hours left): Focus immediately on high priority topics: ${basePrediction.highPriorityTopics.map(t => t.topic).join(", ")}. Study predicted questions: ${basePrediction.questions.slice(0, 2).map(q => q.question.substring(0, 30) + "...").join(", ")} directly. Run the multiple-choice diagnostic tests right now to spot fatal gaps.`;
  } else if (timeLeft.includes("6 hour")) {
    basePrediction.examStrategy = `CRUNCH MODE (6 Hours left): Allocate the first 2 hours exclusively to our list of priority topics, 2 hours to tracing predicted derivations, and 2 hours strictly running active diagnostic flashcards and quizzes.`;
  }

  return basePrediction;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    provider: AI_PROVIDER,
    model: getAiModel(),
    aiConfigured: isAiProviderConfigured(),
    geminiConfigured: isAiProviderConfigured("gemini"),
    ollamaConfigured: isAiProviderConfigured("ollama"),
    authRequired: Boolean(process.env.APP_SHARED_SECRET),
    uploadLimits: {
      maxMaterials: MAX_MATERIALS,
      maxFileMB: Math.round(MAX_FILE_BYTES / 1024 / 1024),
      maxTotalMB: Math.round(MAX_TOTAL_FILE_BYTES / 1024 / 1024),
      requestJsonLimit: REQUEST_JSON_LIMIT,
    },
  });
});

// REST API Endpoints
app.post("/api/predict", rateLimitApiRequests, requireConfiguredAppSecret, async (req, res) => {
  try {
    const { subject, materials, timeLeft } = req.body;
    const selectedSubject = safeSubject(subject);
    const selectedTime = safeTimeLeft(timeLeft);
    const normalizedMaterials = normalizeMaterials(materials);
    
    if (!selectedSubject) {
      return res.status(400).json({ error: "Subject parameter is required" });
    }

    const prediction = await runPrediction(selectedSubject, normalizedMaterials, selectedTime);
    res.json(prediction);
  } catch (error: any) {
    console.error("Prediction route error:", error);
    const subject = safeSubject(req.body?.subject);
    const selectedTime = safeTimeLeft(req.body?.timeLeft);
    const prediction = ensurePredictionData(generateLocalPredictions(subject, selectedTime), subject, selectedTime);
    res.json(prediction);
  }
});

app.post("/api/analyze", rateLimitApiRequests, requireConfiguredAppSecret, async (req, res) => {
  try {
    const { subjectName, timeLeft, files } = req.body;
    const subject = safeSubject(subjectName, "General Engineering");
    const selectedTime = safeTimeLeft(timeLeft);
    const materials = normalizeMaterials(files);
    const prediction = await runPrediction(subject, materials, selectedTime);

    res.json(toMobileAnalysisResponse(prediction, selectedTime));
  } catch (error) {
    console.error("Mobile analyze route error:", error);
    const selectedTime = safeTimeLeft(req.body?.timeLeft);
    const subject = safeSubject(req.body?.subjectName, "General Engineering");
    const prediction = ensurePredictionData(generateLocalPredictions(subject, selectedTime), subject, selectedTime);
    res.json(toMobileAnalysisResponse(prediction, selectedTime));
  }
});

// Prompt query helper API
app.post("/api/ask", rateLimitApiRequests, requireConfiguredAppSecret, async (req, res) => {
  try {
    const { question, tagContext, currentCourse } = req.body;
    const selectedQuestion = safeText(question, "", 600);
    const course = safeText(currentCourse, "General Course", 160);
    if (!selectedQuestion) {
      return res.status(400).json({ error: "Question query is required" });
    }

    const prompt = `You are LastNight AI study-assistant. A student is studying for an exam in the course "${course}".
They are asking for a quick revision summary or answer to: "${selectedQuestion}"
Keep the tone helpful, structured, clear, and high-yield. Break the explanation into short bullets so they can digest it in 2 minutes the night before their exam. Ensure all equations are clear. Limit response to around 300 words.`;

    const answer = await runAiText(prompt);
    if (!answer) {
      // Graceful chatbot answering without keys
      return res.json({
        answer: `### High-Yield Explanation: ${selectedQuestion}

Here is the essential quick revision context for **${selectedQuestion}** under the **${course}** track:

1. **Core Concept**: This constitutes a recurring high-probability baseline standard topic. Always define key parameters first before deriving formulas or algorithms.
2. **Key High-Yield Focus**:
   - Write out complete step-by-step algorithms.
   - Draw simple visual block layout sheets representing operational pipelines.
   - Contrast this explicitly with alternative paradigms (e.g. comparing complexity limits) to secure max conceptual marks.
3. **Short-Answer Triage**:
   - Focus on memorizing exact terminology.
   - Practice writing condensed 2-sentence summaries for the active-recall phase.

*(Note: Configure ${AI_PROVIDER === "gemini" ? "GEMINI_API_KEY" : "Ollama"} to unlock personalized model answers from the live reasoning endpoint.)*`
      });
    }

    res.json({ answer });
  } catch (error: any) {
    console.error("Chat explanation API error:", error);
    res.json({
      answer: "Unable to contact LastNight AI reasoning engine. Quick tips: Focus on defining core components, active-recall diagrams, and analyzing resource/state tables for maximum marks."
    });
  }
});

// Configure Vite integration for dev vs prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Prod static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    const hostLabel = HOST === "0.0.0.0" ? "localhost" : HOST;
    console.log(`Express Server running on http://${hostLabel}:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
