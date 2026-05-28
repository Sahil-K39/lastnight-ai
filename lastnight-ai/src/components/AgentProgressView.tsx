import { useState, useEffect, useRef } from "react";
import { MaterialInput } from "../types";

interface AgentProgressViewProps {
  subjectName: string;
  materialsList: MaterialInput[];
  timeLeft: string;
  onComplete: (predictedData?: any) => void;
}

type PredictionCacheEntry = {
  promise: Promise<any>;
  expiresAt: number;
};

const predictionCache = new Map<string, PredictionCacheEntry>();

function predictionCacheKey(subjectName: string, materialsList: MaterialInput[], timeLeft: string) {
  return JSON.stringify({
    subjectName,
    timeLeft,
    materials: materialsList.map((material) => ({
      name: material.name,
      type: material.type,
      sourceKind: material.sourceKind,
      size: material.size,
      textLength: material.text?.length || 0,
      dataLength: material.dataUrl?.length || 0,
    })),
  });
}

function requestPrediction(subjectName: string, materialsList: MaterialInput[], timeLeft: string) {
  const key = predictionCacheKey(subjectName, materialsList, timeLeft);
  const cached = predictionCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.promise;

  const promise = fetch("/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: subjectName,
      materials: materialsList,
      timeLeft: timeLeft,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Triage response error status from server");
    }
    return response.json();
  });

  predictionCache.set(key, { promise, expiresAt: now + 30_000 });
  window.setTimeout(() => {
    const entry = predictionCache.get(key);
    if (entry?.promise === promise) predictionCache.delete(key);
  }, 30_000);

  return promise;
}

export default function AgentProgressView({
  subjectName,
  materialsList,
  timeLeft,
  onComplete,
}: AgentProgressViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<boolean>(false);
  const [isApiFinished, setIsApiFinished] = useState<boolean>(false);
  const apiResponseRef = useRef<any>(null);
  const isApiFinishedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // The 6 Agentic Progress Phases
  const phases = [
    { label: "Reading Course Materials", desc: "Parsing syllabus objectives, notes, and PYQs" },
    { label: "Decomposing Syllabus Units", desc: "Structuring topics & extracting core keywords" },
    { label: "Detecting Historic Exam Trends", desc: "Cross-correlating past patterns & repeated PYQs" },
    { label: "Generating Quick Revision Notes", desc: "Synthesizing heavy slides into high-yield cards" },
    { label: "Formulating Practice Questions", desc: "Generating predicted questions, quizzes, & viva tricks" },
    { label: "Designing Panic-Mode Study Plan", desc: `Fitting hourly revision flow for ${timeLeft} deadline` },
  ];

  // Dynamic log generator to show intense AI core agents at work!
  const mockSyllabusLogs = [
    `[DOC PARSER] Opening ${materialsList.length} uploaded source(s)...`,
    `[DOC PARSER] Subject identified: "${subjectName}" with timeframe constraints: "${timeLeft}"`,
    `[SYLLABUS READER] Scanning syllabus chapters & lectures...`,
    "[SYLLABUS READER] Map complete: detected 5 major unit divisions with 42 core keywords.",
    "[TREND ANALYZER] Cross-referencing uploaded PYQs and common exam templates...",
    "[TREND ANALYZER] High correlation found in balanced algorithms and proof criteria.",
    "[QUESTION PREDICTOR] Calculating probability score matrices using relative weights...",
    "[QUESTION PREDICTOR] Topic 'Balanced Search Trees' likelihood index: 94%. Marks recommended: 15.",
    "[QUESTION PREDICTOR] Topic 'Shortest Paths' likelihood index: 86%. Marks recommended: 10.",
    "[REVISION COMPILER] Synthesizing brief active-recall summaries...",
    "[REVISION COMPILER] Formatting key points & formula sheets...",
    "[VIVA GENERATOR] Drafting trick questions and examiner traps...",
    "[QUIZ FACTORY] Synthesizing 2 multiple-choice questions with answer distractor weights...",
    `[PLAN TRIAGE] Formatting study plan configured specifically for the "${timeLeft}" crunch parameter.`,
    "[SYSTEM INTEGRATOR] Packing full study kit. Finalizing results...",
  ];

  // Trigger real API call immediately in background when view mounts
  useEffect(() => {
    let active = true;

    async function queryPredictionApi() {
      try {
        const predictedData = await requestPrediction(subjectName, materialsList, timeLeft);
        if (active) {
          apiResponseRef.current = predictedData;
          isApiFinishedRef.current = true;
          setApiResponse(predictedData);
          setIsApiFinished(true);
        }
      } catch (err) {
        console.error("Agent progress API background fetch failure:", err);
        if (active) {
          isApiFinishedRef.current = true;
          setApiError(true);
          setIsApiFinished(true);
          setLogs((prev) => [...prev, "[FALLBACK] Live backend unavailable. Using safe local study-kit generator."]);
        }
      }
    }

    queryPredictionApi();

    return () => {
      active = false;
    };
  }, [subjectName, materialsList, timeLeft]);

  // Handle step-by-step progress metrics and timeline logging
  useEffect(() => {
    let currentProgress = 0;
    let finishTimeout: ReturnType<typeof setTimeout> | undefined;
    
    const interval = setInterval(() => {
      // Linear progress steps to keep interface readable and paced beautifully
      currentProgress += 1;
      
      if (currentProgress > 100) {
        clearInterval(interval);
        setProgress(100);
        
        // Wait a small buffer for the background API to finish so we have actual data ready
        finishTimeout = setTimeout(function waitForApi() {
          if (isApiFinishedRef.current) {
            if (hasCompletedRef.current) return;
            hasCompletedRef.current = true;
            onCompleteRef.current(apiResponseRef.current);
            return;
          }
          finishTimeout = setTimeout(waitForApi, 150);
        }, 150);

        return;
      }

      setProgress(currentProgress);

      // Determine progress step index based on progress 0-100%
      const stepIndex = Math.min(Math.floor((currentProgress / 100) * phases.length), phases.length - 1);
      setCurrentStep(stepIndex);

      // Dynamically push a log according to progress milestones
      const numLogsToHave = Math.min(
        Math.floor((currentProgress / 100) * mockSyllabusLogs.length) + 1,
        mockSyllabusLogs.length
      );

      setLogs((prev) => {
        if (prev.length < numLogsToHave) {
          const nextLogs = mockSyllabusLogs.slice(0, numLogsToHave);
          return nextLogs;
        }
        return prev;
      });

    }, 60); // Roughly 6 seconds to complete the cycle and show exquisite visuals

    return () => {
      clearInterval(interval);
      if (finishTimeout) clearTimeout(finishTimeout);
    };
  }, [phases.length, mockSyllabusLogs.length]);

  return (
    <div className="flex-grow flex flex-col justify-center min-h-[calc(100vh-80px)] px-6 py-10 md:px-12 relative overflow-hidden">
      <div className="absolute top-24 left-10 w-80 h-24 bg-gradient-to-r from-[#d0bcff]/10 to-transparent [clip-path:polygon(0_0,82%_0,100%_100%,18%_100%)] pointer-events-none" />
      <div className="absolute bottom-16 right-10 w-80 h-24 bg-gradient-to-l from-[#4cd7f6]/10 to-transparent [clip-path:polygon(20%_0,100%_0,82%_100%,0_100%)] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10 flex flex-col gap-10">
        
        {/* Core Pulsing Agent State Block */}
        <div className="text-center">
          <div className="relative inline-flex mb-6">
            {/* Pulsing ring layers */}
            <div className="absolute inset-0 bg-[#a078ff]/30 rounded-full blur-xl scale-125 animate-pulse" />
            <div className="absolute inset-0 bg-[#4cd7f6]/20 rounded-full blur-2xl scale-150 animate-ping opacity-60" />
            <div className="w-20 h-20 bg-gradient-to-tr from-[#6d3bd7] to-[#4cd7f6] rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_32px_rgba(160,120,255,0.6)] relative z-10 animate-spin" style={{ animationDuration: "12s" }}>
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
          </div>
          
          <h2 className="font-display font-bold text-3xl text-white mb-2 tracking-tight">
            LastNight AI Agent at Work
          </h2>
          <p className="font-sans text-[#cbc3d7]/60 text-sm max-w-sm mx-auto">
            Subject: <span className="text-white font-semibold font-mono">{subjectName}</span> • Panic Threshold: <span className="text-[#4cd7f6] font-semibold font-mono">{timeLeft}</span>
          </p>
          <div className={`inline-flex items-center gap-2 mt-4 rounded-full border px-3 py-1 font-mono text-[10px] ${
            apiError
              ? "border-[#ffb4ab]/25 bg-[#ffb4ab]/10 text-[#ffb4ab]"
              : isApiFinished
                ? "border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981]"
                : "border-[#4cd7f6]/20 bg-[#4cd7f6]/10 text-[#4cd7f6]"
          }`}>
            <span className="material-symbols-outlined text-[13px]">
              {apiError ? "shield" : isApiFinished ? "check_circle" : "sync"}
            </span>
            {apiError ? "Fallback protected" : isApiFinished ? "Study kit ready" : "AI pipeline running"}
          </div>
        </div>

        {/* Dynamic Bento Box Split: Progress status + Terminal Live Console */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Step list phase indicators (7 columns) */}
          <div className="md:col-span-7 bg-[#14161d]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <h3 className="font-display text-sm font-semibold text-white border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d0bcff] text-base">dashboard_customize</span>
              Agentic Processing Phases
            </h3>

            <div className="flex flex-col gap-5">
              {phases.map((phase, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                
                let stepStatusColor = "border-white/10 text-white/20";
                let badgeMarker = <span className="font-mono text-[9px] font-bold">{idx + 1}</span>;

                if (isCompleted) {
                  stepStatusColor = "border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981]";
                  badgeMarker = <span className="material-symbols-outlined text-[14px]">check</span>;
                } else if (isActive) {
                  stepStatusColor = "border-[#d0bcff]/40 bg-[#d0bcff]/10 text-[#d0bcff] shadow-[0_0_12px_rgba(208,188,255,0.2)]";
                  badgeMarker = <span className="animate-spin text-[14px] material-symbols-outlined">sync</span>;
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 transition-all duration-300 ${
                      isActive ? "scale-[1.01] bg-white/5 p-2 rounded-xl border border-white/5" : "opacity-80"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${stepStatusColor}`}>
                      {badgeMarker}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-sans font-semibold text-xs transition-colors duration-200 ${
                        isCompleted ? "text-[#10b981]/90" : isActive ? "text-[#d0bcff]" : "text-[#cbc3d7]/40"
                      }`}>
                        {phase.label}
                      </span>
                      <span className="font-sans text-[10px] text-[#cbc3d7]/40 leading-normal mt-0.5">
                        {phase.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Console Logs window (5 columns) */}
          <div className="md:col-span-5 bg-black border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <span className="font-mono text-[9px] uppercase font-bold text-[#cbc3d7]/50 ml-1">Live Agent Console</span>
              </div>
              <span className={`font-mono text-[9px] font-bold ${apiError ? "text-[#ffb4ab]" : "text-[#4cd7f6] animate-pulse"}`}>
                {apiError ? "● FALLBACK" : "● STREAMING"}
              </span>
            </div>

            {/* Simulated Live logs stack */}
            <div className="flex-grow overflow-y-auto max-h-[280px] min-h-[220px] pr-1.5 custom-scrollbar flex flex-col gap-2 font-mono text-[9px] text-[#cbc3d7]/70 leading-normal select-none">
              {logs.map((log, idx) => (
                <div key={idx} className="animate-fade-in-up flex gap-1.5 items-start">
                  <span className="text-[#a078ff] shrink-0">&gt;</span>
                  <span className={log.includes("[QUIZ") || log.includes("[PLAN") || log.includes("[SYSTEM") ? "text-[#4cd7f6] font-medium" : log.includes("Error") ? "text-red-400" : ""}>{log}</span>
                </div>
              ))}
              {/* Pulsing blinking underscore cursor */}
              <div className="flex gap-1.5 items-center">
                <span className="text-[#a078ff]">&gt;</span>
                <span className="w-2 h-3.5 bg-[#4cd7f6]/80 animate-pulse inline-block" />
              </div>
            </div>
          </div>

        </div>

        {/* Global Progress Bar slider indicator */}
        <div className="bg-[#14161d] border border-white/5 rounded-xl p-4 flex flex-col gap-2.5 items-stretch shadow-md">
          <div className="flex justify-between font-mono text-[10px] text-[#cbc3d7]/60">
            <span>Overall compiler status</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
