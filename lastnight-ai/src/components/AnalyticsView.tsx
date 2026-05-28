export default function AnalyticsView() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const progressStats = [
    { day: "Mon", hrs: 2.5, percent: "35%", active: false },
    { day: "Tue", hrs: 4.0, percent: "55%", active: false },
    { day: "Wed", hrs: 1.5, percent: "20%", active: false },
    { day: "Thu", hrs: 5.2, percent: "75%", active: false },
    { day: "Fri", hrs: 6.8, percent: "95%", active: true },
    { day: "Sat", hrs: 3.0, percent: "42%", active: false },
    { day: "Sun", hrs: 1.0, percent: "15%", active: false },
  ];

  const courseBreakdowns = [
    { id: 1, name: "Advanced Machine Learning", code: "CS-412", covered: 90, hours: 15, color: "bg-[#d0bcff]" },
    { id: 2, name: "Data Structures", code: "CS-201", covered: 65, hours: 12, color: "bg-[#4cd7f6]" },
    { id: 3, name: "Operating Systems", code: "CS-304", covered: 40, hours: 8, color: "bg-[#adc6ff]" },
  ];

  return (
    <div className="flex-grow min-h-screen px-6 py-8 md:px-12 flex flex-col gap-10 relative">
      <header className="z-10 relative">
        <h1 className="font-display font-medium text-4xl text-white">
          Coursework <span className="text-gradient font-bold drop-shadow-[0_0_15px_rgba(76,215,246,0.3)]">Analytics</span>
        </h1>
        <p className="font-sans text-[#cbc3d7]/80 text-sm mt-1">
          Monitor your night-before syllabus triage history, sleep index, and active-recall success indicators.
        </p>
      </header>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* Hours Studied Column Chart (8 / 12 columns) */}
        <section className="lg:col-span-8 bg-[#14161d] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d0bcff]">bar_chart</span>
              Hours Spent Studying (Daily Breakdown)
            </h3>
            <span className="text-xs font-mono text-[#cbc3d7]/60">Avg. 3.4 hrs / Day</span>
          </div>

          {/* Styled Column stats chart */}
          <div className="flex items-end justify-between h-48 pt-6 border-b border-white/5 pb-2">
            {progressStats.map((stat) => (
              <div key={stat.day} className="flex flex-col items-center gap-3 w-1/12 group">
                <div className="relative w-full flex justify-center">
                  {/* Tooltip on hover */}
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-white/10 pointer-events-none z-20">
                    {stat.hrs}h
                  </span>

                  {/* Column element */}
                  <div
                    className={`w-4/5 rounded-t-md transition-all duration-500 hover:opacity-100 ${
                      stat.active
                        ? "bg-gradient-to-t from-[#6d3bd7] to-[#d0bcff] shadow-[0_0_15px_rgba(208,188,255,0.4)] opacity-100"
                        : "bg-white/10 opacity-60"
                    }`}
                    style={{ height: `${stat.hrs * 20}px` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-[#cbc3d7]/50">{stat.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Readiness overview gauge right metrics (4 / 12 columns) */}
        <section className="lg:col-span-4 bg-[#14161d] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 justify-between">
          <div>
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#4cd7f6]">hourglass_empty</span>
              Sleep vs Study Ratio
            </h3>
            <p className="font-sans text-xs text-[#cbc3d7]/60 leading-relaxed">
              Based on historical data of your night-before session trends, studying until 01:15 AM yields the highest performance metrics.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between font-mono text-xs text-[#cbc3d7]/60">
              <span>Optimum Study window</span>
              <span className="text-white font-bold">4.5 hrs</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-[#6d3bd7] to-[#4cd7f6] rounded-full" style={{ width: "70%" }} />
            </div>

            <div className="flex justify-between font-mono text-xs text-[#cbc3d7]/60">
              <span>Required Sleep Index</span>
              <span className="text-white font-bold">6.5 hrs</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="h-full bg-[#4cd7f6] rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </section>
      </div>

      {/* Course progression detail tables */}
      <section className="bg-[#14161d] border border-white/5 rounded-2xl p-6 relative z-10 flex flex-col gap-6">
        <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffb4ab]">school</span>
          Syllabus Coverage Breakdown
        </h3>

        <div className="flex flex-col gap-5">
          {courseBreakdowns.map((course) => (
            <div key={course.id} className="border-b border-white/5 pb-5 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">{course.name}</h4>
                  <p className="font-mono text-[10px] text-[#cbc3d7]/60">{course.code} • {course.hours} hrs completed</p>
                </div>
                <span className="font-mono text-xs font-bold text-white">{course.covered}% covered</span>
              </div>
              
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.covered}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
