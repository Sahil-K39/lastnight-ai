import { useEffect } from "react";
import { MarketingPage, TabState } from "../types";
import CinematicScene from "./CinematicScene";
import ShootingStarBackdrop from "./ShootingStarBackdrop";

interface LandingPageProps {
  page: MarketingPage;
  onNavigate: (page: MarketingPage) => void;
  onStart: (tab: TabState) => void;
}

export default function LandingPage({ page, onNavigate, onStart }: LandingPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const navigatePage = (targetPage: MarketingPage) => {
    onNavigate(targetPage);
  };

  const navButtonClass = (sectionId: MarketingPage) =>
    [
      "border-b-2 px-2 lg:px-3 py-1 text-sm lg:text-base tracking-tight transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff]/60",
      page === sectionId
        ? "text-[#d0bcff] font-bold border-[#d0bcff]"
        : "text-[#cbc3d7]/70 border-transparent hover:text-white hover:bg-white/5",
    ].join(" ");

  const mobileNavButtonClass = (sectionId: MarketingPage) =>
    [
      "shrink-0 border px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff]/60",
      page === sectionId
        ? "text-[#d0bcff] bg-[#d0bcff]/10 border-[#d0bcff]/40"
        : "text-[#cbc3d7] bg-white/5 border-white/10",
    ].join(" ");

  return (
    <div className="min-h-screen bg-[#05070d] text-[#e2e2e8] font-sans antialiased overflow-x-hidden relative">
      <CinematicScene density="active" />
      <ShootingStarBackdrop page={page} />
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0c10]/85 backdrop-blur-md border-b border-white/5 shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center gap-4 px-6 md:px-8 lg:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigatePage("product")}>
            <span className="material-symbols-outlined text-[#d0bcff] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
            <span className="font-display font-bold text-xl lg:text-2xl tracking-tighter text-[#d0bcff] whitespace-nowrap">LastNight AI</span>
          </div>

          <div className="hidden md:flex items-center gap-3 lg:gap-8">
            <button onClick={() => navigatePage("product")} className={navButtonClass("product")}>Product</button>
            <button onClick={() => navigatePage("features")} className={navButtonClass("features")}>Features</button>
            <button onClick={() => navigatePage("pricing")} className={navButtonClass("pricing")}>Pricing</button>
            <button onClick={() => navigatePage("enterprise")} className={navButtonClass("enterprise")}>Enterprise</button>
          </div>

          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <button onClick={() => onStart("login")} className="hidden lg:block text-[#e2e2e8] hover:text-[#d0bcff] transition-colors font-medium tracking-tight whitespace-nowrap">
              Log In
            </button>
            <button 
              onClick={() => onStart("signup")} 
              className="glow-btn text-white px-4 lg:px-6 py-2 rounded-full font-mono text-[10px] lg:text-[11px] font-bold tracking-widest uppercase cursor-pointer whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-6 pb-4">
          <button onClick={() => navigatePage("product")} className={mobileNavButtonClass("product")}>Product</button>
          <button onClick={() => navigatePage("features")} className={mobileNavButtonClass("features")}>Features</button>
          <button onClick={() => navigatePage("pricing")} className={mobileNavButtonClass("pricing")}>Pricing</button>
          <button onClick={() => navigatePage("enterprise")} className={mobileNavButtonClass("enterprise")}>Enterprise</button>
        </div>
      </nav>

      {/* Main Container Content */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        {page === "product" && (
          <>

        {/* Hero Section */}
        <section className="text-center flex flex-col items-center justify-center pt-12 pb-20 relative z-10">
          
          {/* Version Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full sub-panel glow-border mb-8 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] shadow-[0_0_8px_#4cd7f6] animate-pulse"></span>
            <span className="font-mono text-on-surface-variant uppercase tracking-widest text-[10px] text-[#cbc3d7]">
              Version 2.0 Now Live
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-on-surface max-w-4xl mx-auto mb-6 leading-tight tracking-tight drop-shadow-2xl">
            Built for students who start studying{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a078ff] to-[#4cd7f6] drop-shadow-[0_0_20px_rgba(160,120,255,0.2)]">
              one night before
            </span>{" "}
            the exam.
          </h1>

          {/* Subheading text */}
          <p className="font-sans text-base md:text-lg text-[#cbc3d7]/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload notes, syllabi, previous year papers to get ultra-focused AI-predicted questions, quick revision sheets, and a safe study timeline. Stop panicking, start passing.
          </p>

          {/* Start Preparing button */}
          <button 
            onClick={() => onStart("upload")}
            className="glow-btn text-white px-8 py-4 rounded-xl font-display text-[18px] font-semibold flex items-center gap-3 relative overflow-hidden group tracking-tight cursor-pointer active:scale-95 duration-200"
          >
            <span className="relative z-10">Start Preparing</span>
            <span className="material-symbols-outlined relative z-10 transition-transform duration-350 group-hover:translate-x-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              arrow_forward
            </span>
          </button>
        </section>

        {/* Mock Dashboard Representation */}
        <section className="relative z-10 -mt-6 md:-mt-12 mb-32">
          <div 
            onClick={() => onStart("dashboard")}
            className="glass-panel rounded-xl overflow-hidden aspect-[16/10] max-w-5xl mx-auto relative group cursor-pointer transition-all duration-700 hover:scale-[1.01] glow-border"
          >
            {/* Dashboard Browser header bar */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-zinc-900/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/85"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/85"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/85"></div>
              </div>
              <div className="mx-auto w-1/3 h-6 sub-panel rounded-md flex items-center justify-center">
                <span className="font-mono text-on-surface-variant text-[10px] opacity-75 text-[#cbc3d7]">
                  app.lastnight.ai/study/cs101
                </span>
              </div>
            </div>

            {/* Dashboard Mock Content */}
            <div className="flex h-[calc(100%-3rem)] bg-[#111318]/40">
              {/* Sidebar simulation */}
              <div className="w-48 border-r border-white/5 p-4 flex flex-col gap-3 bg-[#111318]/25 hidden sm:flex">
                <div className="h-8 sub-panel rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-[#a078ff]/10 border-l-2 border-[#a078ff] rounded-r w-full"></div>
                <div className="h-6 sub-panel rounded w-full opacity-50"></div>
                <div className="h-6 sub-panel rounded w-5/6 opacity-40"></div>
                <div className="h-6 sub-panel rounded w-full opacity-40"></div>
              </div>

              {/* Main operational area */}
              <div className="flex-1 p-6 flex flex-col gap-5">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-8 w-48 sub-panel rounded mb-2 bg-white/5"></div>
                    <div className="h-4 w-32 sub-panel rounded opacity-50"></div>
                  </div>
                  <div className="h-10 w-32 bg-[#cbc3d7]/10 rounded-lg border border-[#cbc3d7]/25 shadow-inner" />
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-5 h-24">
                  <div className="sub-panel rounded-lg p-3 flex flex-col justify-between">
                    <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                    <div className="h-6 w-3/4 bg-[#d0bcff]/15 rounded"></div>
                  </div>
                  <div className="sub-panel rounded-lg p-3 flex flex-col justify-between">
                    <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                    <div className="h-6 w-2/3 bg-[#4cd7f6]/15 rounded"></div>
                  </div>
                  <div className="sub-panel rounded-lg p-3 flex flex-col justify-between">
                    <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                    <div className="h-6 w-4/5 bg-white/10 rounded"></div>
                  </div>
                </div>

                {/* Triage summary container */}
                <div className="flex-1 sub-panel rounded-lg p-4">
                  <div className="h-full w-full bg-[#111318]/50 rounded-lg flex flex-col gap-2.5 p-4 border border-white/5">
                    <div className="h-4 w-[90%] bg-white/5 rounded"></div>
                    <div className="h-4 w-[85%] bg-white/5 rounded"></div>
                    <div className="h-4 w-[45%] bg-white/5 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid container */}
        <section id="features" className="mt-32 scroll-mt-32">
          <h2 className="font-display font-medium text-3xl text-white text-center mb-16 tracking-tight">
            Intelligence over All-Nighters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Large question analysis predict tracker */}
            <div 
              onClick={() => onStart("dashboard")}
              className="feature-card rounded-xl p-8 lg:col-span-2 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-52 h-28 bg-gradient-to-l from-[#a078ff]/18 to-transparent opacity-80 [clip-path:polygon(18%_0,100%_0,78%_100%,0_100%)] group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="material-symbols-outlined text-[#d0bcff] mb-6 text-4xl sub-panel p-3 rounded-xl inline-block shadow-[0_0_20px_rgba(160,120,255,0.15)]">
                analytics
              </span>
              <h3 className="font-display text-2xl font-bold text-white mb-3 tracking-tight">
                Important Question Prediction
              </h3>
              <p className="font-sans text-sm text-[#cbc3d7] mb-6 max-w-md">
                Our AI analyzes past papers and your syllabus to rank the highest-probability questions for tomorrow's exam with transparent confidence signals.
              </p>
              
              {/* Graphic indicator inside card */}
              <div className="h-32 rounded-lg sub-panel relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#a078ff]/15 to-transparent z-10"></div>
                <div className="flex items-end h-full p-4 gap-3 opacity-60">
                  <div className="w-1/6 bg-[#a078ff]/30 h-[30%] rounded-t border border-[#a078ff]/15"></div>
                  <div className="w-1/6 bg-[#a078ff]/50 h-[50%] rounded-t border border-[#a078ff]/25"></div>
                  <div className="w-1/6 bg-[#a078ff]/20 h-[20%] rounded-t border border-[#a078ff]/10"></div>
                  <div className="w-1/6 bg-gradient-to-t from-[#6d3bd7] to-[#d0bcff] h-[80%] rounded-t shadow-[0_0_20px_rgba(208,188,255,0.4)] border border-[#d0bcff]/50 relative z-20"></div>
                  <div className="w-1/6 bg-[#a078ff]/40 h-[40%] rounded-t border border-[#a078ff]/20"></div>
                  <div className="w-1/6 bg-[#a078ff]/25 h-[28%] rounded-t border border-white/5"></div>
                </div>
              </div>
            </div>

            {/* Card 2: Quick revision summaries */}
            <div 
              onClick={() => onStart("dashboard")}
              className="feature-card rounded-xl p-8 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-36 h-24 bg-gradient-to-l from-[#4cd7f6]/16 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)] group-hover:opacity-100 opacity-75 transition-opacity duration-500"></div>
              <span className="material-symbols-outlined text-[#4cd7f6] mb-6 text-4xl sub-panel p-3 rounded-xl inline-block shadow-[0_0_20px_rgba(76,215,246,0.15)]">
                bolt
              </span>
              <h3 className="font-display text-xl font-semibold text-white mb-3 tracking-tight">
                Quick Revision Notes
              </h3>
              <p className="font-sans text-sm text-[#cbc3d7]/80 leading-relaxed">
                Compress 300 pages of tedious slide documents into 5 pages of absolute extreme high-yield key items and study sheets.
              </p>
            </div>

            {/* Card 3: Interactive Exam Voice Prep mocks */}
            <div 
              onClick={() => onStart("dashboard")}
              className="feature-card rounded-xl p-8 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-36 h-24 bg-gradient-to-l from-[#adc6ff]/16 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)] group-hover:opacity-100 opacity-75 transition-opacity duration-500"></div>
              <span className="material-symbols-outlined text-[#adc6ff] mb-6 text-4xl sub-panel p-3 rounded-xl inline-block shadow-[0_0_20px_rgba(173,198,255,0.15)]">
                record_voice_over
              </span>
              <h3 className="font-display text-xl font-semibold text-white mb-3 tracking-tight">
                Viva Prep Simulator
              </h3>
              <p className="font-sans text-sm text-[#cbc3d7]/80 leading-relaxed">
                Simulate a tough oral examiner. Practice speaking your response ideas aloud to an active conversational agent trained specifically on your textbook.
              </p>
            </div>

            {/* Card 4: MCQ generator recall tool */}
            <div 
              onClick={() => onStart("dashboard")}
              className="feature-card rounded-xl p-8 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-36 h-24 bg-gradient-to-l from-[#d0bcff]/16 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)] group-hover:opacity-100 opacity-75 transition-opacity duration-500"></div>
              <span className="material-symbols-outlined text-[#d0bcff] mb-6 text-4xl sub-panel p-3 rounded-xl inline-block shadow-[0_0_20px_rgba(160,120,255,0.15)]">
                quiz
              </span>
              <h3 className="font-display text-xl font-semibold text-white mb-3 tracking-tight">
                Quiz Generator
              </h3>
              <p className="font-sans text-sm text-[#cbc3d7]/80 leading-relaxed">
                Instantly populate multiple-choice quizzes, fill-in-the-gap arrays, and short-answer prompts to active-recall your way to retention.
              </p>
            </div>

            {/* Card 5: Last-Night Plan triage flow */}
            <div 
              onClick={() => onStart("dashboard")}
              className="feature-card rounded-xl p-8 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-36 h-24 bg-gradient-to-l from-[#4cd7f6]/16 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)] group-hover:opacity-100 opacity-75 transition-opacity duration-500"></div>
              <span className="material-symbols-outlined text-[#4cd7f6] mb-6 text-4xl sub-panel p-3 rounded-xl inline-block shadow-[0_0_20px_rgba(76,215,246,0.15)]">
                schedule
              </span>
              <h3 className="font-display text-xl font-semibold text-white mb-3 tracking-tight">
                Last-Night Study Plan
              </h3>
              <p className="font-sans text-sm text-[#cbc3d7]/80 leading-relaxed">
                Feed in your exam hour and state of knowledge readiness. Get a localized hour-by-hour triage plan of things to memorize before morning.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="mt-32 scroll-mt-32 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="font-mono text-[11px] text-[#4cd7f6] uppercase tracking-widest">Pricing</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mt-3">
                Pick your last-night mode
              </h2>
            </div>
            <p className="text-[#cbc3d7]/80 max-w-xl leading-relaxed">
              Keep the hackathon promise simple: upload material, ship a study kit, and scale up only when a class or campus needs the command layer.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="feature-card rounded-xl p-7 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-[#4cd7f6]/70"></div>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white tracking-tight">Free Scout</h3>
                  <p className="text-sm text-[#cbc3d7]/70 mt-1">For one urgent exam run.</p>
                </div>
                <span className="material-symbols-outlined text-[#4cd7f6] text-3xl">radar</span>
              </div>
              <div className="flex items-end gap-2 mb-8">
                <span className="font-display text-5xl font-bold text-white">$0</span>
                <span className="text-[#cbc3d7]/70 pb-2">/ start</span>
              </div>
              <div className="space-y-3 text-sm text-[#cbc3d7] mb-8">
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#4cd7f6] text-lg">check</span>1 active study kit</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#4cd7f6] text-lg">check</span>Question prediction preview</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#4cd7f6] text-lg">check</span>Revision sheet generation</p>
              </div>
              <button onClick={() => onStart("upload")} className="w-full glow-btn rounded-lg py-3 font-mono text-[11px] uppercase tracking-widest text-white">
                Try Upload
              </button>
            </div>

            <div className="feature-card rounded-xl p-7 relative overflow-hidden border-[#d0bcff]/35 shadow-[0_0_40px_rgba(160,120,255,0.12)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#a078ff] to-[#4cd7f6]"></div>
              <div className="absolute right-5 top-5 px-3 py-1 rounded-full border border-[#d0bcff]/30 bg-[#d0bcff]/10 font-mono text-[10px] uppercase tracking-widest text-[#d0bcff]">
                Popular
              </div>
              <div className="flex items-center justify-between gap-4 mb-8 pr-24">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white tracking-tight">Pro Crunch</h3>
                  <p className="text-sm text-[#cbc3d7]/70 mt-1">For students shipping every week.</p>
                </div>
                <span className="material-symbols-outlined text-[#d0bcff] text-3xl">rocket_launch</span>
              </div>
              <div className="flex items-end gap-2 mb-8">
                <span className="font-display text-5xl font-bold text-white">$9</span>
                <span className="text-[#cbc3d7]/70 pb-2">/ month</span>
              </div>
              <div className="space-y-3 text-sm text-[#cbc3d7] mb-8">
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#d0bcff] text-lg">check</span>Unlimited study kits</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#d0bcff] text-lg">check</span>Full quiz and viva simulator</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#d0bcff] text-lg">check</span>Saved exam timelines</p>
              </div>
              <button onClick={() => onStart("dashboard")} className="w-full glow-btn rounded-lg py-3 font-mono text-[11px] uppercase tracking-widest text-white">
                Open Dashboard
              </button>
            </div>

            <div className="feature-card rounded-xl p-7 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-[#adc6ff]/70"></div>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white tracking-tight">Campus Command</h3>
                  <p className="text-sm text-[#cbc3d7]/70 mt-1">For cohorts, clubs, and colleges.</p>
                </div>
                <span className="material-symbols-outlined text-[#adc6ff] text-3xl">domain</span>
              </div>
              <div className="flex items-end gap-2 mb-8">
                <span className="font-display text-5xl font-bold text-white">Custom</span>
              </div>
              <div className="space-y-3 text-sm text-[#cbc3d7] mb-8">
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#adc6ff] text-lg">check</span>Shared subject workspaces</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#adc6ff] text-lg">check</span>Faculty-safe admin controls</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[#adc6ff] text-lg">check</span>Private deployment options</p>
              </div>
              <button onClick={() => navigatePage("enterprise")} className="w-full border border-[#adc6ff]/35 bg-[#adc6ff]/10 hover:bg-[#adc6ff]/15 rounded-lg py-3 font-mono text-[11px] uppercase tracking-widest text-white transition-colors">
                View Enterprise
              </button>
            </div>
          </div>
        </section>

        <section id="enterprise" className="mt-32 scroll-mt-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
            <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-28 bg-gradient-to-l from-[#4cd7f6]/14 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)]"></div>
              <span className="font-mono text-[11px] text-[#d0bcff] uppercase tracking-widest">Enterprise</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mt-4 mb-5">
                A command center for entire cohorts
              </h2>
              <p className="text-[#cbc3d7]/80 leading-relaxed mb-8">
                Give student teams, clubs, or college departments one shared AI layer for exam prep, content ingestion, progress visibility, and launch-week reliability.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border-l border-[#d0bcff]/40 pl-4">
                  <div className="font-display text-3xl text-white">1K+</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">Builder-ready</div>
                </div>
                <div className="border-l border-[#4cd7f6]/40 pl-4">
                  <div className="font-display text-3xl text-white">7 days</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">Hackathon pace</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => onStart("dashboard")} className="glow-btn rounded-lg px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-white">
                  Open Command
                </button>
                <button onClick={() => onStart("upload")} className="rounded-lg px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 font-mono text-[11px] uppercase tracking-widest text-[#cbc3d7] transition-colors">
                  Launch A Kit
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-lg border border-white/10 bg-[#10141d]/70 p-4">
                  <span className="material-symbols-outlined text-[#d0bcff] mb-3">admin_panel_settings</span>
                  <h3 className="font-display text-white font-semibold tracking-tight mb-1">Admin Controls</h3>
                  <p className="text-xs text-[#cbc3d7]/70 leading-relaxed">Manage cohorts, subjects, and shared exam material.</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#10141d]/70 p-4">
                  <span className="material-symbols-outlined text-[#4cd7f6] mb-3">hub</span>
                  <h3 className="font-display text-white font-semibold tracking-tight mb-1">Integrations</h3>
                  <p className="text-xs text-[#cbc3d7]/70 leading-relaxed">Connect notes, syllabi, docs, and previous papers.</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#10141d]/70 p-4">
                  <span className="material-symbols-outlined text-[#adc6ff] mb-3">verified_user</span>
                  <h3 className="font-display text-white font-semibold tracking-tight mb-1">Privacy Layer</h3>
                  <p className="text-xs text-[#cbc3d7]/70 leading-relaxed">Keep uploads private with export-ready study outputs.</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#080b12]/85 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/70">Campus Live Ops</span>
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
                    Synced
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <span className="text-sm text-white">Data Structures final sprint</span>
                    <span className="font-mono text-[10px] text-[#4cd7f6]">92 kits</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full w-[78%] bg-gradient-to-r from-[#a078ff] to-[#4cd7f6]"></div></div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <span className="text-sm text-white">Biology viva practice room</span>
                    <span className="font-mono text-[10px] text-[#d0bcff]">41 mocks</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full w-[56%] bg-gradient-to-r from-[#d0bcff] to-[#adc6ff]"></div></div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <span className="text-sm text-white">Physics PYQ prediction batch</span>
                    <span className="font-mono text-[10px] text-[#adc6ff]">128 files</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full w-[84%] bg-gradient-to-r from-[#4cd7f6] to-[#adc6ff]"></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
          </>
        )}

        {page === "features" && (
          <FeaturesPage onStart={onStart} />
        )}

        {page === "pricing" && (
          <PricingPage onStart={onStart} onNavigate={navigatePage} />
        )}

        {page === "enterprise" && (
          <EnterprisePage onStart={onStart} />
        )}
      </main>

      {/* Footer view */}
      <footer className="w-full py-16 border-t border-white/5 bg-[#0a0c10] mt-32 relative z-10 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d0bcff]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
              <span className="font-display text-xl font-bold text-white tracking-tighter">LastNight AI</span>
            </div>
            <p className="font-mono text-xs text-[#cbc3d7]/60">
              © 2026 LastNight AI. All rights reserved. Built for student crunch times.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-white font-bold uppercase mb-2 tracking-widest">Legal</span>
            <span onClick={() => onStart("dashboard")} className="font-sans text-sm text-[#cbc3d7] hover:text-[#d0bcff] duration-200 cursor-pointer">Privacy Policy</span>
            <span onClick={() => onStart("dashboard")} className="font-sans text-sm text-[#cbc3d7] hover:text-[#d0bcff] duration-200 cursor-pointer">Terms and Conditions</span>
            <span onClick={() => onStart("dashboard")} className="font-sans text-sm text-[#cbc3d7] hover:text-[#d0bcff] duration-200 cursor-pointer">Cookie Policy</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-white font-bold uppercase mb-2 tracking-widest">Help</span>
            <span onClick={() => onStart("dashboard")} className="font-sans text-sm text-[#cbc3d7] hover:text-[#d0bcff] duration-200 cursor-pointer">Support Help Desk</span>
            <span onClick={() => onStart("dashboard")} className="font-sans text-sm text-[#cbc3d7] hover:text-[#d0bcff] duration-200 cursor-pointer">Documentation Guide</span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs text-white font-bold uppercase tracking-widest">Operational Status</span>
            <div className="flex items-center gap-2 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
              <span className="font-mono text-xs text-[#cbc3d7]">All systems running normal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MarketingHero({
  eyebrow,
  title,
  body,
  icon,
  accent,
  onStart,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
  accent: string;
  onStart: (tab: TabState) => void;
}) {
  return (
    <section className="min-h-[72vh] flex items-center pt-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center w-full">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-7">
            <span className="material-symbols-outlined text-[#4cd7f6] text-base">{icon}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]">{eyebrow}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white max-w-4xl">
            {title}
          </h1>
          <p className="text-[#cbc3d7]/85 text-base md:text-lg leading-relaxed max-w-2xl mt-6">
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-9">
            <button onClick={() => onStart("upload")} className="glow-btn rounded-xl px-7 py-4 font-mono text-[11px] uppercase tracking-widest text-white">
              Start A Study Kit
            </button>
            <button onClick={() => onStart("dashboard")} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-7 py-4 font-mono text-[11px] uppercase tracking-widest text-[#cbc3d7] transition-colors">
              Open Dashboard
            </button>
          </div>
        </div>

        <div className="relative min-h-[430px]">
          <div className="absolute inset-0 rounded-2xl border border-white/10 bg-[#080b12]/70 overflow-hidden shadow-[0_50px_120px_-60px_rgba(76,215,246,0.55)]">
            <div className={`absolute inset-x-0 top-0 h-1 ${accent}`}></div>
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_24%,transparent_70%,rgba(76,215,246,0.08))]"></div>
            <div className="absolute left-8 right-8 top-8 rounded-xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/70">Live Signal</span>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"></span>
                  Online
                </span>
              </div>
              <div className="space-y-4">
                {[88, 63, 74].map((width, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="h-2 w-28 rounded-full bg-white/10"></span>
                      <span className="font-mono text-[10px] text-[#cbc3d7]/50">{width}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full ${accent}`} style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3">
              {["Predict", "Revise", "Recall"].map((label) => (
                <div key={label} className="rounded-lg border border-white/10 bg-[#10141d]/75 px-4 py-5 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/70">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesPage({ onStart }: { onStart: (tab: TabState) => void }) {
  const features = [
    {
      icon: "analytics",
      title: "Question Prediction",
      body: "Turns uploaded notes, syllabi, and previous papers into ranked exam questions with confidence signals.",
      accent: "text-[#d0bcff]",
    },
    {
      icon: "bolt",
      title: "Crunch Notes",
      body: "Compresses messy material into short high-yield revision sheets built for the final hours before an exam.",
      accent: "text-[#4cd7f6]",
    },
    {
      icon: "record_voice_over",
      title: "Viva Simulator",
      body: "Creates oral-exam prompts and examiner angles so students can practice answers out loud.",
      accent: "text-[#adc6ff]",
    },
    {
      icon: "quiz",
      title: "Active Recall",
      body: "Generates MCQs, short answers, and flash-style prompts from the exact study kit.",
      accent: "text-[#ffc857]",
    },
    {
      icon: "schedule",
      title: "Panic Timeline",
      body: "Builds a focused hour-by-hour study plan based on the time left and the student's readiness.",
      accent: "text-[#4cd7f6]",
    },
    {
      icon: "hub",
      title: "Shared Backend",
      body: "Keeps the website and mobile app aligned on the same prediction schema and product story.",
      accent: "text-[#d0bcff]",
    },
  ];

  return (
    <>
      <MarketingHero
        eyebrow="Feature Page"
        title="Every feature is built to ship a usable study kit, not a pitch deck."
        body="This page is for judges and users who want to understand what the product actually does: ingest material, triage the risk, generate prep assets, and help the student act immediately."
        icon="auto_awesome"
        accent="bg-gradient-to-r from-[#a078ff] to-[#4cd7f6]"
        onStart={onStart}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature) => (
          <button
            key={feature.title}
            onClick={() => onStart("upload")}
            className="feature-card rounded-xl p-7 text-left min-h-[230px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-36 bg-gradient-to-l from-white/10 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)]"></div>
            <span className={`material-symbols-outlined ${feature.accent} mb-6 text-4xl sub-panel p-3 rounded-xl inline-block`}>
              {feature.icon}
            </span>
            <h2 className="font-display text-xl font-semibold text-white tracking-tight mb-3">{feature.title}</h2>
            <p className="text-sm leading-relaxed text-[#cbc3d7]/78">{feature.body}</p>
          </button>
        ))}
      </section>

      <section className="mt-24 rounded-2xl border border-white/10 bg-[#080b12]/75 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Upload", "Analyze", "Predict", "Practice"].map((step, index) => (
            <div key={step} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#4cd7f6]">Step 0{index + 1}</span>
              <h3 className="font-display text-white text-xl mt-3 tracking-tight">{step}</h3>
              <p className="text-sm text-[#cbc3d7]/70 mt-2 leading-relaxed">
                {index === 0 && "Bring notes, PDFs, rough text, or PYQ files into one study workspace."}
                {index === 1 && "Extract signals from the source material and deadline context."}
                {index === 2 && "Rank exam questions, topics, and high-yield revision paths."}
                {index === 3 && "Turn outputs into quizzes, viva prompts, and final recall loops."}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function PricingPage({
  onStart,
  onNavigate,
}: {
  onStart: (tab: TabState) => void;
  onNavigate: (page: MarketingPage) => void;
}) {
  const plans = [
    {
      name: "Free Scout",
      price: "$0",
      detail: "For one urgent exam sprint.",
      icon: "radar",
      accent: "text-[#4cd7f6]",
      items: ["1 active study kit", "Prediction preview", "Revision sheet export"],
      action: () => onStart("upload"),
      cta: "Try Upload",
    },
    {
      name: "Pro Crunch",
      price: "$9",
      detail: "For weekly study-kit shipping.",
      icon: "rocket_launch",
      accent: "text-[#d0bcff]",
      items: ["Unlimited kits", "Quiz and viva simulator", "Saved study timelines"],
      action: () => onStart("dashboard"),
      cta: "Open Dashboard",
    },
    {
      name: "Campus Command",
      price: "Custom",
      detail: "For cohorts and campus teams.",
      icon: "domain",
      accent: "text-[#adc6ff]",
      items: ["Shared workspaces", "Admin controls", "Private deployment path"],
      action: () => onNavigate("enterprise"),
      cta: "View Enterprise",
    },
  ];

  return (
    <>
      <MarketingHero
        eyebrow="Pricing Page"
        title="Simple plans for a product that has to work before exam night ends."
        body="Start free, upgrade for repeat study kits, and use Campus Command when a cohort needs a shared AI prep layer."
        icon="payments"
        accent="bg-gradient-to-r from-[#ffc857] via-[#d0bcff] to-[#4cd7f6]"
        onStart={onStart}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="feature-card rounded-xl p-7 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#a078ff] to-[#4cd7f6]"></div>
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-white">{plan.name}</h2>
                <p className="text-sm text-[#cbc3d7]/70 mt-1">{plan.detail}</p>
              </div>
              <span className={`material-symbols-outlined ${plan.accent} text-3xl`}>{plan.icon}</span>
            </div>
            <div className="font-display text-5xl font-bold text-white mb-8">{plan.price}</div>
            <div className="space-y-3 mb-8">
              {plan.items.map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-[#cbc3d7]">
                  <span className={`material-symbols-outlined ${plan.accent} text-lg`}>check</span>
                  {item}
                </p>
              ))}
            </div>
            <button onClick={plan.action} className="w-full glow-btn rounded-lg py-3 font-mono text-[11px] uppercase tracking-widest text-white">
              {plan.cta}
            </button>
          </div>
        ))}
      </section>

      <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-4">
        {["No fake pitch mode", "Works without perfect files", "Designed for demo day"].map((label) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#080b12]/75 p-6">
            <span className="material-symbols-outlined text-[#4cd7f6] mb-4">verified</span>
            <h3 className="font-display text-white text-xl tracking-tight">{label}</h3>
            <p className="text-sm text-[#cbc3d7]/70 mt-2 leading-relaxed">
              The pricing story stays tied to the working flow: create, inspect, revise, and ship a study kit.
            </p>
          </div>
        ))}
      </section>
    </>
  );
}

function EnterprisePage({ onStart }: { onStart: (tab: TabState) => void }) {
  return (
    <>
      <MarketingHero
        eyebrow="Enterprise Page"
        title="Campus-grade exam prep for cohorts moving at hackathon speed."
        body="Enterprise mode frames LastNight AI as a command center for student teams, clubs, departments, and private deployments."
        icon="domain"
        accent="bg-gradient-to-r from-[#adc6ff] via-[#d0bcff] to-[#4cd7f6]"
        onStart={onStart}
      />

      <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
        <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-28 bg-gradient-to-l from-[#4cd7f6]/14 to-transparent [clip-path:polygon(25%_0,100%_0,72%_100%,0_100%)]"></div>
          <span className="font-mono text-[11px] text-[#d0bcff] uppercase tracking-widest">Campus Command</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mt-4 mb-5">
            One shared AI layer for the whole cohort.
          </h2>
          <p className="text-[#cbc3d7]/80 leading-relaxed mb-8">
            Admins can organize subjects, keep uploaded material private, and let every student generate prep assets from the same knowledge base.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border-l border-[#d0bcff]/40 pl-4">
              <div className="font-display text-3xl text-white">1K+</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">Builder-ready</div>
            </div>
            <div className="border-l border-[#4cd7f6]/40 pl-4">
              <div className="font-display text-3xl text-white">7 days</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">Hackathon pace</div>
            </div>
          </div>
          <button onClick={() => onStart("dashboard")} className="glow-btn rounded-lg px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-white">
            Open Command
          </button>
        </div>

        <div className="space-y-4">
          {[
            ["admin_panel_settings", "Cohort Controls", "Manage subject rooms, student study kits, and shared materials."],
            ["hub", "Source Integrations", "Bring notes, syllabi, docs, and PYQs into one exam intelligence layer."],
            ["verified_user", "Private Outputs", "Keep uploads private and export finished study material when needed."],
          ].map(([icon, title, body]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-[#080b12]/75 p-6">
              <span className="material-symbols-outlined text-[#4cd7f6] mb-4">{icon}</span>
              <h3 className="font-display text-white text-xl tracking-tight">{title}</h3>
              <p className="text-sm text-[#cbc3d7]/70 mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-xl border border-white/10 bg-[#080b12]/85 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/70">Campus Live Ops</span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
            Synced
          </span>
        </div>
        <div className="p-4 space-y-3">
          {[
            ["Data Structures final sprint", "92 kits", "78%"],
            ["Biology viva practice room", "41 mocks", "56%"],
            ["Physics PYQ prediction batch", "128 files", "84%"],
          ].map(([label, metric, width]) => (
            <div key={label}>
              <div className="grid grid-cols-[1fr_auto] gap-3 items-center mb-2">
                <span className="text-sm text-white">{label}</span>
                <span className="font-mono text-[10px] text-[#4cd7f6]">{metric}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a078ff] to-[#4cd7f6]" style={{ width }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
