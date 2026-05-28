import React, { useState } from "react";
import { StudyKit, TabState, UserProfile } from "../types";

interface DashboardViewProps {
  studyKits: StudyKit[];
  user: UserProfile | null;
  onSelectKit: (kit: StudyKit) => void;
  onSelectTab: (tab: TabState) => void;
  onQuickCreate: (subjectName: string) => void;
}

export default function DashboardView({
  studyKits,
  user,
  onSelectKit,
  onSelectTab,
  onQuickCreate,
}: DashboardViewProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onQuickCreate(searchInput.trim());
    }
  };

  return (
    <div className="flex-1 min-h-screen px-6 py-8 md:px-12 flex flex-col gap-10 relative">
      
      {/* Welcome / Header row with Dynamic quick subject search builder */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10 relative">
        <div>
          <h1 className="font-display font-medium text-4xl text-white tracking-tight">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.
          </h1>
          <p className="font-sans text-[#cbc3d7] mt-1 text-sm md:text-base">
            {user?.collegeName
              ? `${user.degree} ${user.branch} • ${user.semester} • ${user.collegeName}`
              : "Ready to crush your exams tonight? Live predicted triages are on stand-by."}
          </p>
        </div>

        {/* Action input bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-[420px] input-dark rounded-xl flex items-center px-4 py-2.5">
          <span className="material-symbols-outlined text-[#cbc3d7]/60 mr-3 text-lg">search</span>
          <input
            className="bg-transparent border-none outline-none w-full font-mono text-xs text-white placeholder:text-[#cbc3d7]/45 p-0 focus:ring-0 focus:outline-none"
            placeholder="Type a subject name (eg. Linear Algebra)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 bg-white/5 hover:bg-[#d0bcff]/20 text-[#d0bcff] p-1.5 rounded-lg transition-colors border border-white/5 hover:border-[#d0bcff]/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm icon-glow-primary">add</span>
          </button>
        </form>
      </header>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* Upload panel (8 / 12 columns) */}
        <section className="lg:col-span-8 bg-[#14161d] border border-white/5 rounded-2xl p-6 md:p-8 glow-hover flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#d0bcff] icon-glow-primary">
                rocket_launch
              </span>
              New Exam Prep Triage
            </h2>
            <span className="px-3 py-1 bg-[#4cd7f6]/10 text-[#4cd7f6] rounded-full font-mono text-[10px] tracking-wide border border-[#4cd7f6]/20">
              AI Standby
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[180px]">
            {/* Box 1: Syllabus */}
            <div
              onClick={() => onSelectTab("upload")}
              className="border border-dashed border-[#494454]/60 hover:border-[#d0bcff]/60 bg-zinc-900/40 hover:bg-[#d0bcff]/5 hover:shadow-[inset_0_0_24px_rgba(208,188,255,0.05)] rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-3xl text-[#cbc3d7]/40 group-hover:text-[#d0bcff] mb-2 transition-colors group-hover:icon-glow-primary">
                description
              </span>
              <span className="font-mono text-xs text-white group-hover:text-[#d0bcff] transition-colors mb-0.5">
                Upload Syllabus
              </span>
              <span className="text-[10px] text-[#cbc3d7]/50 font-mono">PDF, DOCX</span>
            </div>

            {/* Box 2: Notebooks */}
            <div
              onClick={() => onSelectTab("upload")}
              className="border border-dashed border-[#494454]/60 hover:border-[#d0bcff]/60 bg-zinc-900/40 hover:bg-[#d0bcff]/5 hover:shadow-[inset_0_0_24px_rgba(208,188,255,0.05)] rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-3xl text-[#cbc3d7]/40 group-hover:text-[#d0bcff] mb-2 transition-colors group-hover:icon-glow-primary">
                edit_document
              </span>
              <span className="font-mono text-xs text-white group-hover:text-[#d0bcff] transition-colors mb-0.5">
                Upload Notes
              </span>
              <span className="text-[10px] text-[#cbc3d7]/50 font-mono">JPG, PNG</span>
            </div>

            {/* Box 3: Past papers */}
            <div
              onClick={() => onSelectTab("upload")}
              className="border border-dashed border-[#494454]/60 hover:border-[#d0bcff]/60 bg-zinc-900/40 hover:bg-[#d0bcff]/5 hover:shadow-[inset_0_0_24px_rgba(208,188,255,0.05)] rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-3xl text-[#cbc3d7]/40 group-hover:text-[#d0bcff] mb-2 transition-colors group-hover:icon-glow-primary">
                history_edu
              </span>
              <span className="font-mono text-xs text-white group-hover:text-[#d0bcff] transition-colors mb-0.5">
                Upload PYQs
              </span>
              <span className="text-[10px] text-[#cbc3d7]/50 font-mono">Past Papers / PYQ</span>
            </div>
          </div>
        </section>

        {/* Right analytics side panels (4 / 12 columns) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <button
            onClick={() => onSelectTab("profile")}
            className="bg-[#14161d] border border-white/5 rounded-2xl p-6 flex items-center justify-between glow-hover text-left"
          >
            <div>
              <p className="font-mono text-[10px] uppercase text-[#cbc3d7]/60 tracking-wider mb-1">
                College Profile
              </p>
              <p className="font-display font-bold text-xl text-white">
                {user?.collegeName || "Add details"}
              </p>
              <p className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wide mt-1">
                {user?.targetExam || "Target exam not set"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center text-[#d0bcff] shadow-[0_0_15px_rgba(208,188,255,0.15)]">
              <span className="material-symbols-outlined text-xl icon-glow-primary">account_circle</span>
            </div>
          </button>
          
          {/* Box 1: Study hours */}
          <div className="bg-[#14161d] border border-white/5 rounded-2xl p-6 flex items-center justify-between glow-hover">
            <div>
              <p className="font-mono text-[10px] uppercase text-[#cbc3d7]/60 tracking-wider mb-1">
                Study Hours This Week
              </p>
              <p className="font-display font-bold text-3xl text-[#d0bcff] drop-shadow-[0_0_8px_rgba(208,188,255,0.3)]">
                24<span className="text-sm font-sans font-normal text-[#cbc3d7]/40 ml-1">hrs</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center text-[#d0bcff] shadow-[0_0_15px_rgba(208,188,255,0.15)]">
              <span className="material-symbols-outlined text-xl icon-glow-primary">timer</span>
            </div>
          </div>

          {/* Box 2: Knowledge metrics */}
          <div className="bg-[#14161d] border border-white/5 rounded-2xl p-6 flex items-center justify-between glow-hover">
            <div>
              <p className="font-mono text-[10px] uppercase text-[#cbc3d7]/60 tracking-wider mb-1">
                Knowledge Readiness
              </p>
              <p className="font-display font-bold text-3xl text-[#4cd7f6] drop-shadow-[0_0_8px_rgba(76,215,246,0.3)]">
                78<span className="text-sm font-sans font-normal text-[#cbc3d7]/40 ml-1">%</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 flex items-center justify-center text-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.15)]">
              <span className="material-symbols-outlined text-xl icon-glow-tertiary">trending_up</span>
            </div>
          </div>
        </section>
      </div>

      {/* Recent active study kits */}
      <section className="z-10 flex flex-col gap-6 relative">
        <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#cbc3d7]/60">folder_special</span>
          Recent Study Kits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyKits.map((kit) => {
            // Pick design indicators based on subject code
            const isOS = kit.code.includes("304");
            const accentColor = isOS ? "text-[#4cd7f6]" : "text-[#d0bcff]";
            const barGradient = isOS 
              ? "from-[#4cd7f6] to-[#009eb9] shadow-[0_0_12px_#4cd7f6]" 
              : "from-[#a078ff] to-[#d0bcff] shadow-[0_0_12px_#a078ff]";

            return (
              <div
                key={kit.id}
                onClick={() => onSelectKit(kit)}
                className="bg-[#14161d] border border-white/5 rounded-2xl p-6 cursor-pointer group hover:-translate-y-1 hover:border-[#d0bcff]/30 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-white/5 bg-zinc-900 text-lg ${accentColor}`}>
                    <span className="material-symbols-outlined">
                      {isOS ? "memory" : "data_object"}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-zinc-900/60 border border-white/5 text-[#cbc3d7]/60 rounded-md text-[10px] font-mono">
                    {kit.timestamp}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-base text-white group-hover:text-[#d0bcff] duration-200 mb-0.5">
                  {kit.courseName}
                </h4>
                <p className="font-mono text-[11px] text-[#cbc3d7]/50 mb-6">
                  {kit.code} • {kit.term}
                </p>

                {/* Cyber progress bars */}
                <div className="w-full bg-zinc-900/60 rounded-full h-1.5 mb-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
                    style={{ width: `${kit.progress}%` }}
                  />
                </div>

                <div className="flex justify-between font-mono text-[10px] text-[#cbc3d7]/40">
                  <span>Syllabus covered</span>
                  <span className={`${accentColor} font-bold`}>{kit.progress}%</span>
                </div>
              </div>
            );
          })}

          {/* Add custom brand study kit placeholder */}
          <div
            onClick={() => onSelectTab("upload")}
            className="border-2 border-dashed border-[#494454]/40 hover:border-[#d0bcff]/60 bg-zinc-900/10 hover:bg-[#d0bcff]/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[200px] group hover:shadow-[inset_0_0_32px_rgba(208,188,255,0.03)]"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[#cbc3d7]/40 mb-3 group-hover:text-[#d0bcff] group-hover:border-[#d0bcff]/30 duration-300">
              <span className="material-symbols-outlined text-xl">add</span>
            </div>
            <span className="font-sans font-semibold text-sm text-[#cbc3d7]/85 group-hover:text-white duration-200">
              Create New Kit
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
