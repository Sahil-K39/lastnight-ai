export interface PredictedQuestion {
  id: string;
  question: string;
  likelihood: "High" | "Medium";
  percentage: number;
  marks: string;
  explanation: string;
  tags: string[];
}

export interface StudyPlanItem {
  id: string;
  time: string;
  task: string;
  detail: string;
  active?: boolean;
}

export interface HighPriorityTopic {
  id: string;
  topic: string;
  importance: "Critical" | "High" | "Medium";
  reason: string;
  subtopics: string[];
}

export interface QuickRevisionNote {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  formulaOrDiagramPrompt?: string;
}

export interface VivaQuestion {
  id: string;
  question: string;
  answer: string;
  examinerAngle: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface PredictionData {
  courseName: string;
  description: string;
  confidence: string;
  confidenceLevel?: string;
  accuracy: string;
  examStrategy: string; // The core recommendation: "What should I study first if my exam is tomorrow?"
  pyqPatternAnalysis?: {
    summary: string;
    repeatedPatterns: string[];
    sourceCoverage: string;
  };
  unitWiseImportance?: {
    unit: string;
    importance: string;
    reason: string;
    topics: string[];
  }[];
  highPriorityTopics: HighPriorityTopic[];
  importantQuestions?: PredictedQuestion[];
  questions: PredictedQuestion[];
  revisionNotes?: QuickRevisionNote[];
  quickRevisionNotes: QuickRevisionNote[];
  vivaQuestions: VivaQuestion[];
  quiz: QuizQuestion[];
  summary: string;
  studyPlan: StudyPlanItem[];
  heatmapTags: string[];
}

export interface StudyKit {
  id: string;
  courseName: string;
  code: string;
  term: string;
  timestamp: string;
  progress: number;
  data: PredictionData;
}

export interface MaterialInput {
  name: string;
  type: string;
  sourceKind?: "syllabus" | "notes" | "pyq" | "slides" | "other";
  size?: number;
  text?: string;
  dataUrl?: string;
}

export type MarketingPage = "product" | "features" | "pricing" | "enterprise";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  avatarDataUrl?: string;
  collegeName: string;
  degree: string;
  branch: string;
  semester: string;
  rollNumber?: string;
  targetExam?: string;
}

export type TabState =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "upload"
  | "progress"
  | "results"
  | "profile"
  | "settings"
  | "analytics";
