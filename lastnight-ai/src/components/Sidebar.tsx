import { TabState, UserProfile } from "../types";

interface SidebarProps {
  currentTab: TabState;
  user: UserProfile | null;
  onTabChange: (tab: TabState) => void;
  onLogout: () => void;
}

function initialsFor(user: UserProfile | null) {
  const source = user?.fullName || user?.email || "LastNight AI";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LN";
}

export default function Sidebar({ currentTab, user, onTabChange, onLogout }: SidebarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "upload", label: "Upload & Create", icon: "cloud_upload" },
    { id: "profile", label: "Profile", icon: "account_circle" },
    { id: "analytics", label: "Analytics", icon: "insights" },
    { id: "settings", label: "Settings", icon: "settings" },
  ] as const;

  return (
    <>
    <nav className="hidden md:flex bg-[#14161d] h-screen w-64 fixed left-0 top-0 border-r border-white/5 shadow-[8px_0_32px_rgba(0,0,0,0.6)] flex-col py-6 z-50">
      {/* Branding Logo */}
      <div className="px-6 mb-8 flex items-center gap-2 cursor-pointer" onClick={() => onTabChange("landing")}>
        <span className="material-symbols-outlined text-[#d0bcff] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
        <span className="font-display font-bold text-2xl tracking-tighter text-white">LastNight AI</span>
      </div>

      {/* Profile summary */}
      <button onClick={() => onTabChange("profile")} className="flex items-center px-6 mb-8 gap-3 text-left group">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-900 shadow-inner">
          {user?.avatarDataUrl ? (
            <img alt="User Profile" className="w-full h-full object-cover" src={user.avatarDataUrl} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#d0bcff]/10 text-[#d0bcff] font-display font-bold text-sm">
              {initialsFor(user)}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-medium text-sm text-white leading-tight group-hover:text-[#d0bcff] transition-colors">
            {user?.fullName || "Create Profile"}
          </span>
          <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wide truncate max-w-[150px]">
            {user?.collegeName || "Student Mode"}
          </span>
        </div>
      </button>

      {/* Nav links */}
      <div className="flex-grow px-2 space-y-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-xs transition-all duration-200 outline-none ${
                isActive
                  ? "bg-gradient-to-r from-[#d0bcff]/10 to-transparent text-[#d0bcff] border-r-2 border-[#d0bcff] shadow-[inset_0_0_20px_rgba(208,188,255,0.05)]"
                  : "text-[#cbc3d7]/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg ${isActive ? "icon-glow-primary" : ""}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CTA Button and lower links */}
      <div className="px-4 mt-auto space-y-4">
        <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6d3bd7] to-[#a078ff] text-white font-mono text-xs shadow-[0_4px_12px_rgba(109,59,215,0.3)] hover:opacity-90 duration-300 border border-white/10 active:scale-95">
          Upgrade to Pro
        </button>
        <div className="h-px bg-white/5" />
        <div className="space-y-1">
          <button
            onClick={() => onTabChange("landing")}
            className="w-full flex items-center gap-3 text-[#cbc3d7]/60 hover:text-white px-3 py-2 rounded-lg font-mono text-xs duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">help</span>
            <span>Help</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 text-red-400/70 hover:text-red-400 px-3 py-2 rounded-lg font-mono text-xs duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#101219]/95 backdrop-blur-xl px-2 py-2 shadow-[0_-8px_32px_rgba(0,0,0,0.55)]">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabState)}
              className={`min-h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "bg-[#d0bcff]/12 text-[#d0bcff]" : "text-[#cbc3d7]/55 hover:text-white"
              }`}
              aria-label={tab.label}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isActive ? "icon-glow-primary" : ""}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="font-mono text-[9px] leading-none truncate max-w-full px-1">
                {tab.label.replace(" & Create", "")}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
}
