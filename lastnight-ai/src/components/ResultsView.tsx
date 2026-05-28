import React, { useEffect, useState } from "react";
import { PredictionData, PredictedQuestion } from "../types";

interface ResultsViewProps {
  data: PredictionData;
  onRefresh: () => void;
}

type TabState = "strategy" | "topics" | "notes" | "interactive";

export default function ResultsView({ data, onRefresh }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<TabState>("strategy");
  const [selectedQuestion, setSelectedQuestion] = useState<PredictedQuestion | null>(
    data.questions[0] || null
  );

  // Conversational AI Assistant
  const [chatQuery, setChatQuery] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Active Recall Flashcards Drawer
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Practice Quiz responses mapping state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  
  // Tricky Viva Revealed questions mapping state
  const [revealedVivas, setRevealedVivas] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setActiveTab("strategy");
    setSelectedQuestion(data.questions[0] || null);
    setChatQuery("");
    setChatAnswer(null);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setQuizAnswers({});
    setRevealedVivas({});
  }, [data]);

  const startTriageChat = async (questionText: string) => {
    setIsChatLoading(true);
    setChatAnswer(null);
    setChatQuery(`Explain: ${questionText}`);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          currentCourse: data.courseName,
        }),
      });
      if (!response.ok) {
        throw new Error("Assistant response was not successful");
      }
      const resData = await response.json();
      setChatAnswer(resData.answer);
    } catch (e) {
      setChatAnswer("Oops, unable to reach the triage model. Remember: Write down diagrams, compute edge maps, and define parameters for maximum points!");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    setIsChatLoading(true);
    setChatAnswer(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: chatQuery,
          currentCourse: data.courseName,
        }),
      });
      if (!response.ok) {
        throw new Error("Assistant response was not successful");
      }
      const resData = await response.json();
      setChatAnswer(resData.answer);
    } catch (err) {
      setChatAnswer("Triage server on standby. Tip: check your connection or AI_PROVIDER configuration, then try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const toggleVivaReveal = (id: string) => {
    setRevealedVivas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeFlashcard = data.questions[currentCardIndex];

  const tabsList = [
    { id: "strategy", label: "Core Strategy", icon: "flash_on" },
    { id: "topics", label: "Priority Topics", icon: "local_fire_department" },
    { id: "notes", label: "Revision Notes", icon: "edit_note" },
    { id: "interactive", label: "Interactive Recalls", icon: "school" }
  ];

  return (
    <div className="flex-grow min-h-screen px-6 py-8 md:px-12 flex flex-col gap-8 relative pb-20 overflow-x-hidden">
      
      <div className="absolute top-16 right-8 w-96 h-24 bg-gradient-to-l from-[#d0bcff]/8 to-transparent [clip-path:polygon(20%_0,100%_0,82%_100%,0_100%)] pointer-events-none" />
      <div className="absolute bottom-16 left-8 w-96 h-24 bg-gradient-to-r from-[#4cd7f6]/8 to-transparent [clip-path:polygon(0_0,82%_0,100%_100%,18%_100%)] pointer-events-none" />

      {/* Header bar titles */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10 relative border-b border-white/5 pb-5 shrink-0">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
            {data.courseName} <span className="text-gradient drop-shadow-[0_0_15px_rgba(76,215,246,0.3)]">Study Kit</span>
          </h1>
          <p className="font-sans text-[#cbc3d7]/80 text-sm md:text-base mt-1.5 flex flex-wrap items-center gap-2">
            <span>{data.description}</span>
            <span className="text-white">•</span>
            <span>Prediction confidence: <span className="text-[#4cd7f6] font-mono font-bold">{data.accuracy}</span></span>
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none px-5 py-2.5 border border-white/10 bg-zinc-900/30 rounded-xl text-white font-mono text-xs hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-md duration-200"
          >
            Export PDF / Print
          </button>
          <button 
            onClick={() => {
              setIsRevisionMode(true);
              setCurrentCardIndex(0);
              setIsCardFlipped(false);
            }}
            className="flex-grow md:flex-none px-6 py-2.5 premium-btn rounded-xl text-white font-mono text-xs font-semibold cursor-pointer transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            Active Recall Flashcards
          </button>
        </div>
      </header>

      {/* Segmented Horizon Custom Header Tabs */}
      <div className="bg-[#14161d] p-1.5 rounded-2xl border border-white/5 flex flex-wrap md:flex-nowrap gap-1 z-10 relative">
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabState)}
              className={`flex-grow md:flex-1 py-3 px-4 rounded-xl font-display font-medium text-xs transition-all duration-300 outline-none flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-zinc-800 text-white border-b border-[#d0bcff]/30 shadow-inner"
                  : "text-[#cbc3d7]/40 hover:text-[#cbc3d7]"
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isActive ? "text-[#d0bcff] icon-glow-primary animate-pulse" : ""}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Views Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative flex-1">
        
        {/* TAB 1: STRATEGY & DYNAMIC PANIC STUDY TIMELINE */}
        {activeTab === "strategy" && (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in items-start">
            
            {/* Strategy Statement Banner Card (7 cols) */}
            <div className="lg:col-span-7 bg-[#14161d] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden glowing-border-bottom active">
              <div className="absolute top-0 right-0 w-36 h-20 bg-gradient-to-l from-[#4cd7f6]/10 to-transparent [clip-path:polygon(22%_0,100%_0,76%_100%,0_100%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-20 bg-gradient-to-r from-[#ff5f7e]/8 to-transparent [clip-path:polygon(0_0,76%_0,100%_100%,22%_100%)] pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="p-2 rounded-xl bg-[#4cd7f6]/10 border border-[#4cd7f6]/20">
                  <span className="material-symbols-outlined text-[#4cd7f6]" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_awareness</span>
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Ultimate Exam Strategy</h2>
                  <p className="font-sans text-[10px] text-[#cbc3d7]/40 uppercase tracking-widest font-semibold mt-0.5">Primary study priority & exam hacks</p>
                </div>
              </div>

              {/* Big Typography for crucial recommendation */}
              <div className="bg-[#111318]/60 border border-white/5 rounded-xl p-6 relative">
                <span className="absolute -top-3 left-4 px-2 bg-zinc-950 rounded text-[9px] font-mono text-[#d0bcff] uppercase tracking-widest border border-white/5 font-semibold">Triage Order Recommendation</span>
                <p className="font-sans text-sm text-white font-medium leading-relaxed">
                  {data.examStrategy || "Analyze the highest probability predicted questions and focus on standard structures first to lock down your baseline metrics."}
                </p>
              </div>

              {/* Course summary outline */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-mono text-[10px] uppercase font-bold text-[#cbc3d7]/50 tracking-wider">Concept crunch summary</h4>
                <p className="font-sans text-xs text-[#cbc3d7]/80 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {data.summary || "This subject focuses on standard design patterns, theoretical limitations comparisons, and resource matrices derivations. Skim our detailed notes and quizzes."}
                </p>
              </div>
            </div>

            {/* Hourly Panic Timeline Studylist (5 cols) */}
            <div className="lg:col-span-5 bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d0bcff] text-xs">schedule</span>
                  Panic Study Plan Timeline
                </h2>
                <span className="font-mono text-[9px] text-[#4cd7f6] uppercase font-bold bg-[#4cd7f6]/10 px-2 rounded-full border border-[#4cd7f6]/20">
                  Targeted triage
                </span>
              </div>

              <div className="relative pl-5 border-l border-white/10 flex flex-col gap-6 mt-1 ml-2">
                {data.studyPlan.map((plan) => (
                  <div key={plan.id} className="relative group">
                    {/* Timeline bullet element */}
                    <div className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-zinc-950 z-10 transition-transform duration-300 ${
                      plan.active 
                        ? "bg-[#d0bcff] shadow-[0_0_12px_rgba(208,188,255,0.8)]" 
                        : "bg-[#494454] group-hover:bg-white"
                    }`} />
                    
                    <div className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      plan.active 
                        ? "bg-zinc-900/60 border-[#d0bcff]/25 shadow-lg" 
                        : "bg-[#111318]/40 border-transparent hover:border-white/5"
                    }`}
                    onClick={() => startTriageChat(`Can you explain that task part in detail? Task: ${plan.task} - Detail: ${plan.detail}`)}
                    >
                      <h4 className="font-mono text-xs text-[#d0bcff] font-bold mb-0.5">
                        {plan.time}
                      </h4>
                      <p className="font-sans font-semibold text-white text-xs mb-1 group-hover:text-[#4cd7f6] duration-200">
                        {plan.task}
                      </p>
                      <p className="font-sans text-[11px] text-[#cbc3d7]/60 leading-normal">
                        {plan.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: HIGH-PRIORITY TOPICS & HEATMAP CLOUD */}
        {activeTab === "topics" && (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in items-start">
            
            {/* Topics structured list (8 cols) */}
            <div className="lg:col-span-8 bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="font-display text-sm font-semibold text-white border-b border-white/5 pb-3 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb4ab] text-base">local_fire_department</span>
                Syllabus High-Priority Topics
              </h2>

              <div className="flex flex-col gap-4">
                {data.highPriorityTopics.map((topic, index) => {
                  const isCritical = topic.importance === "Critical";
                  
                  return (
                    <div key={topic.id || index} className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 hover:border-white/10 duration-200">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <h3 className="font-sans font-bold text-base text-white">
                          {topic.topic}
                        </h3>
                        <span className={`font-mono text-[9px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                          isCritical 
                            ? "bg-red-500/10 text-red-300 border-red-500/20" 
                            : "bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/20"
                        }`}>
                          {topic.importance} Priority
                        </span>
                      </div>

                      <p className="font-sans text-xs text-[#cbc3d7]/80 leading-relaxed mb-4">
                        <span className="font-semibold text-white mr-1">Examiner Focus:</span> {topic.reason}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        {topic.subtopics.map((sub, sIdx) => (
                          <span 
                            key={sIdx}
                            onClick={() => startTriageChat(`Can you explain the subtopic ${sub} under topic ${topic.topic}?`)}
                            className="bg-white/5 border border-white/5 hover:border-[#a078ff]/30 text-[#cbc3d7] font-mono text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heatmap tag cloud (4 cols) */}
            <div className="lg:col-span-4 bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <h2 className="font-display text-xs uppercase text-[#cbc3d7]/60 tracking-wider font-bold mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">fireplace</span>
                Topic Heatmap Matrix
              </h2>
              <p className="font-sans text-[11px] text-[#cbc3d7]/50 leading-relaxed mb-1">
                Keywords detected most frequently inside past exam templates. Click any keyword to prompt real-time AI clarification.
              </p>

              <div className="flex flex-wrap gap-2 p-1">
                {data.heatmapTags.map((tag, idx) => {
                  const isHigh = idx % 3 === 0;
                  const isMedium = idx % 3 === 1;
                  
                  let tagClass = "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30 error-glow hover:bg-[#ffb4ab]/20";
                  if (isMedium) {
                    tagClass = "bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30 hover:bg-[#4cd7f6]/20";
                  } else if (!isHigh) {
                    tagClass = "bg-white/5 text-[#cbc3d7] border-white/5 hover:bg-white/10";
                  }

                  return (
                    <span
                      key={tag}
                      onClick={() => startTriageChat(`Can you explain the baseline concept and definition of ${tag} in engineering?`)}
                      className={`border font-mono text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${tagClass}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: QUICK REVISION NOTES */}
        {activeTab === "notes" && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in items-start">
            {data.quickRevisionNotes.length > 0 ? (
              data.quickRevisionNotes.map((note) => (
                <div key={note.id} className="bg-[#14161d] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-5 text-left glow-hover">
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <h3 className="font-display text-lg font-semibold text-white group-hover:text-[#d0bcff] duration-200">
                      {note.title}
                    </h3>
                    <div className="p-1 px-1.5 rounded-md bg-[#a078ff]/15 border border-[#a078ff]/25 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-[#d0bcff]">article</span>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-white font-medium leading-relaxed italic bg-white/5 px-4 py-3 rounded-lg border-l-2 border-[#d0bcff] bg-zinc-950/20">
                    "{note.summary}"
                  </p>

                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-[#cbc3d7]/50">High-yield revision checklists</span>
                    <ul className="flex flex-col gap-2">
                      {note.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="shrink-0 w-1.5 h-1.5 bg-[#4cd7f6] rounded-full mt-1.5 shadow-[0_0_8px_#4cd7f6]"></span>
                          <span className="font-sans text-xs text-[#cbc3d7]/90 leading-relaxed font-normal">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {note.formulaOrDiagramPrompt && (
                    <div className="bg-zinc-950/60 rounded-xl p-4 border border-white/5 flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#d0bcff]">
                        <span className="material-symbols-outlined text-xs">edit_note</span>
                        <span>FORMULA DERIVATION GUIDE</span>
                      </div>
                      <p className="font-mono text-xs text-white leading-relaxed whitespace-pre-line bg-black/40 p-2 rounded">
                        {note.formulaOrDiagramPrompt}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => startTriageChat(`Can you give me a comprehensive numerical explanation and derivation sheet for ${note.title}?`)}
                      className="px-4 py-1.5 rounded-lg border border-white/5 bg-zinc-900/40 hover:bg-zinc-900 duration-200 text-[#cbc3d7] font-mono text-[10px] uppercase cursor-pointer"
                    >
                      Derive equations
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 glass-panel rounded-2xl">
                <p className="font-sans text-[#cbc3d7]/60 text-sm">No revision summary note sheets returned. Ask questions to our chatbot below!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INTERACTIVE RECALLS & SIMULATION (QUIZ, VIVA, WRITTEN EXAMS) */}
        {activeTab === "interactive" && (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
            
            {/* LEFT BLOCK: WRITTEN EXAMS & VIVA (7 columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Collapsible Predicted written questions list */}
              <div className="bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h2 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#a078ff] text-base">target</span>
                    Predicted Written Questions ({data.questions.length})
                  </h2>
                  <span className="font-mono text-[9px] text-[#cbc3d7]/50 uppercase">click to reveal layout</span>
                </div>

                <div className="flex flex-col gap-3">
                  {data.questions.map((q) => {
                    const isSelected = selectedQuestion?.id === q.id;
                    const isHigh = q.likelihood === "High";
                    const verticalIndicator = isHigh 
                      ? "bg-red-500 shadow-[0_0_10px_rgba(255,180,171,0.5)]" 
                      : "bg-[#4cd7f6] shadow-[0_0_10px_rgba(76,215,246,0.3)]";

                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuestion(isSelected ? null : q)}
                        className={`bg-zinc-900/30 rounded-xl p-4.5 border border-white/5 hover:border-[#a078ff]/30 transition-all cursor-pointer relative overflow-hidden ${
                          isSelected ? "border-[#a078ff]/40 bg-zinc-900/70" : ""
                        }`}
                      >
                        {/* Vertical Likelihood color line */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${verticalIndicator}`} />

                        <div className="flex justify-between items-start mb-2 ml-2.5">
                          <span className={`text-[10px] font-mono font-bold flex items-center gap-1 uppercase ${
                            isHigh ? "text-red-400" : "text-[#4cd7f6]"
                          }`}>
                            {q.likelihood} Likelihood ({q.percentage}%)
                          </span>
                          <span className="text-[#cbc3d7]/60 font-mono text-[10px] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                            {q.marks}
                          </span>
                        </div>

                        <h3 className="font-sans font-semibold text-sm text-white ml-2.5 leading-relaxed">
                          {q.question}
                        </h3>

                        {isSelected && (
                          <div className="ml-2.5 mt-4 pt-3.5 border-t border-white/5 text-xs text-[#cbc3d7]/90 leading-relaxed font-sans flex flex-col gap-4 animate-fade-in text-left">
                            <p className="whitespace-pre-line bg-zinc-950/40 p-4.5 rounded-xl border border-white/5 text-xs">
                              {q.explanation}
                            </p>
                            
                            <div className="flex justify-end gap-2.5">
                              {/* Trigger direct assistant prompt */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startTriageChat(`Can you explain and give a complete markdown outline answer for this predicted written question: "${q.question}"?`);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-[#a078ff]/10 hover:bg-[#a078ff]/20 text-[#d0bcff] font-mono text-[9px] uppercase border border-[#d0bcff]/20 flex items-center gap-1.5 duration-200 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[12px]">chat</span>
                                Explain with LastNight AI
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tricky Viva simulation cards */}
              <div className="bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-base">record_voice_over</span>
                    Oral / Viva Simulator Triggers
                  </h2>
                </div>

                <div className="flex flex-col gap-3.5 mt-1">
                  {data.vivaQuestions.map((viva, index) => {
                    const isRevealed = revealedVivas[viva.id || index];
                    return (
                      <div key={viva.id || index} className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3 text-left">
                        <div className="flex justify-between items-start gap-4">
                          <p className="font-sans text-xs text-white font-semibold leading-relaxed">
                            "{viva.question}"
                          </p>
                          <button
                            onClick={() => toggleVivaReveal(viva.id || index.toString())}
                            className="bg-white/5 border border-white/5 text-[#d0bcff] hover:text-white px-2.5 py-1 text-[9px] font-mono uppercase tracking-wide rounded-md transition-colors shrink-0 cursor-pointer"
                          >
                            {isRevealed ? "Hide Answer" : "Reveal Answer"}
                          </button>
                        </div>
                        
                        {isRevealed && (
                          <div className="mt-2 text-xs border-t border-white/5 pt-3 flex flex-col gap-3 font-sans leading-relaxed animate-fade-in">
                            <p className="text-[#cbc3d7]/90 bg-black/30 p-3 rounded-lg border border-white/5 font-normal">
                              <span className="font-mono text-[9px] uppercase tracking-wide text-cyan-400 block mb-1">Recommended Response</span>
                              {viva.answer}
                            </p>
                            <p className="text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10 font-normal">
                              <span className="font-mono text-[9px] uppercase tracking-wide text-red-400 block mb-1">Examiner's Favorite Trick Angle</span>
                              {viva.examinerAngle}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT BLOCK: PRACTICE MCQ QUIZ ENGINE (5 columns) */}
            <div className="lg:col-span-5 bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4cd7f6] text-base">quiz</span>
                  Diagnostic MCQ Quiz
                </h2>
                <span className="font-mono text-[9px] text-[#cbc3d7]/50 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                  Self testing
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {data.quiz.map((qz, idx) => {
                  const selectedIdx = quizAnswers[qz.id || idx];
                  const isAnswered = selectedIdx !== undefined;
                  const isCorrect = isAnswered && selectedIdx === qz.correctAnswerIndex;
                  
                  return (
                    <div key={qz.id || idx} className="bg-zinc-950/40 rounded-xl p-4.5 border border-white/5 flex flex-col gap-4 text-left">
                      <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-wider font-bold text-[#cbc3d7]/40">
                        <span>Question {idx+1} of {data.quiz.length}</span>
                        {isAnswered && (
                          <span className={isCorrect ? "text-[#10b981]" : "text-[#ffb4ab]"}>
                            {isCorrect ? "● CORRECT" : "❌ INCORRECT"}
                          </span>
                        )}
                      </div>
                      
                      <p className="font-sans font-semibold text-xs text-white leading-relaxed">
                        {qz.question}
                      </p>

                      <div className="flex flex-col gap-2.5">
                        {qz.options.map((opt, oIdx) => {
                          const isOptSelected = selectedIdx === oIdx;
                          const isCurrentCorrect = oIdx === qz.correctAnswerIndex;
                          
                          let optStyle = "border-white/5 bg-zinc-900/40 hover:bg-white/5 hover:border-white/10 text-[#cbc3d7]/80";
                          if (isAnswered) {
                            if (isCurrentCorrect) {
                              optStyle = "border-emerald-500/40 bg-emerald-500/10 text-[#10b981] font-semibold";
                            } else if (isOptSelected) {
                              optStyle = "border-red-500/40 bg-red-500/10 text-red-400 font-semibold";
                            } else {
                              optStyle = "border-white/5 opacity-30 text-[#cbc3d7]/35";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isAnswered}
                              onClick={() => {
                                setQuizAnswers(prev => ({ ...prev, [qz.id || idx]: oIdx }));
                              }}
                              className={`text-left px-3.5 py-2.5 rounded-lg font-sans text-xs transition duration-200 border cursor-pointer ${optStyle}`}
                            >
                              <span className="font-mono text-[10px] mr-1.5 opacity-40">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className="bg-black/30 p-3.5 rounded-lg border border-white/5 text-[11px] text-[#cbc3d7] font-sans leading-relaxed animate-fade-in text-left">
                          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-400 mb-1">Answer Analysis</p>
                          {qz.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Persistent conversational chatbot at bottom of results views */}
      <section className="mt-8 bg-[#14161d] border border-white/5 rounded-2xl p-6 relative z-10 text-left">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6d3bd7] to-[#4cd7f6] flex items-center justify-center shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-white text-lg">psychology</span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-white">
              LastNight AI Conversational Assistant
            </h3>
            <p className="font-sans text-[11px] text-[#cbc3d7]/60">
              Query predicted question criteria, derive equations, or ask step-by-step revision answers.
            </p>
          </div>
        </div>

        {/* Chat answer box */}
        {(chatAnswer || isChatLoading) && (
          <div className="bg-zinc-950/70 border border-white/5 rounded-xl p-4 mb-4 text-xs font-sans text-white/90 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
            {isChatLoading ? (
              <div className="flex items-center gap-2.5 text-[#cbc3d7]/60 py-2 font-mono">
                <span className="animate-spin text-[#d0bcff] material-symbols-outlined">restart_alt</span>
                <span>Triage engine parsing reference files...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap select-text selection:bg-[#a078ff]/30">
                {chatAnswer}
              </div>
            )}
          </div>
        )}

        {/* Query Input */}
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-grow bg-[#07080a] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#cbc3d7]/30 outline-none focus:border-[#a078ff]"
            placeholder="Ask a question about this study kit (e.g. Derive AVL Double LL Rotations equations)..."
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-[#a078ff] text-white font-mono text-xs hover:bg-[#a078ff]/85 transition-colors cursor-pointer font-bold"
          >
            Ask AI
          </button>
        </form>
      </section>

      {/* Active Recall flashcards modal dialog */}
      {isRevisionMode && activeFlashcard && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative flex flex-col gap-6 select-none text-left" style={{ minHeight: "360px" }}>
            
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-mono text-[10px] text-[#a078ff] uppercase font-bold tracking-widest leading-none">
                Card {currentCardIndex + 1} of {data.questions.length} • Active Recall Mode
              </span>
              <button 
                onClick={() => setIsRevisionMode(false)}
                className="text-[#cbc3d7]/60 hover:text-white transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Flashcard container */}
            <div 
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="flex-grow flex flex-col items-center justify-center p-8 bg-zinc-950/60 rounded-xl cursor-pointer min-h-[160px] text-center relative border border-white/5 hover:border-[#4cd7f6]/40 select-text duration-300"
            >
              {!isCardFlipped ? (
                <div className="animate-fade-in">
                  <span className="font-mono text-[9px] text-[#ffb4ab] font-bold uppercase tracking-wider mb-2 block">
                    {activeFlashcard.marks} exam question prompt
                  </span>
                  <p className="font-sans font-bold text-center text-sm md:text-base text-white hover:text-[#4cd7f6] duration-200 leading-normal">
                    {activeFlashcard.question}
                  </p>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-[#cbc3d7]/30 font-mono pointer-events-none w-full text-center">
                    [ Click card body to reveal examiner response keys ]
                  </span>
                </div>
              ) : (
                <div className="animate-fade-in text-left max-h-[180px] overflow-y-auto custom-scrollbar pr-1 text-xs">
                  <span className="font-mono text-[9px] text-cyan-400 font-semibold uppercase tracking-wider mb-2 block text-center">
                    Correct Scoring Keys Definition
                  </span>
                  <p className="font-sans text-xs text-[#cbc3d7] whitespace-pre-line leading-relaxed">
                    {activeFlashcard.explanation}
                  </p>
                  <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[9px] text-[#cbc3d7]/30 font-mono pointer-events-none w-full text-center">
                    [ Click card body to return to question prompt ]
                  </span>
                </div>
              )}
            </div>

            {/* Modal action buttons */}
            <div className="flex justify-between items-center mt-2.5">
              <button 
                onClick={() => {
                  if (currentCardIndex > 0) {
                    setCurrentCardIndex(currentCardIndex - 1);
                    setIsCardFlipped(false);
                  }
                }}
                disabled={currentCardIndex === 0}
                className="font-mono text-[10px] text-white hover:text-[#d0bcff] disabled:opacity-30 disabled:pointer-events-none cursor-pointer duration-200"
              >
                ◀ Previous Card
              </button>

              <button
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="px-5 py-2.5 rounded-lg border border-white/5 bg-zinc-950/70 hover:bg-zinc-900 text-white font-mono text-[10px] font-bold cursor-pointer"
              >
                Flip card
              </button>

              <button 
                onClick={() => {
                  if (currentCardIndex < data.questions.length - 1) {
                    setCurrentCardIndex(currentCardIndex + 1);
                    setIsCardFlipped(false);
                  } else {
                    setIsRevisionMode(false);
                  }
                }}
                className="font-mono text-[10px] text-white hover:text-[#4cd7f6] cursor-pointer duration-200 font-bold"
              >
                {currentCardIndex === data.questions.length - 1 ? "Finish recalls ▶" : "Next Card ▶"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
