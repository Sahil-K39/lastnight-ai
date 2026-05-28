import { useEffect, useState } from "react";

type HealthStatus = {
  provider: "gemini" | "ollama";
  model: string;
  aiConfigured: boolean;
  geminiConfigured: boolean;
  ollamaConfigured: boolean;
  authRequired: boolean;
  uploadLimits: {
    maxMaterials: number;
    maxFileMB: number;
    maxTotalMB: number;
    requestJsonLimit: string;
  };
};

export default function SettingsView() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("Health check failed");
        return response.json();
      })
      .then((status: HealthStatus) => {
        if (!active) return;
        setHealth(status);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to read backend status right now.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex-1 min-h-screen px-6 py-8 md:px-12 flex flex-col gap-8 relative">
      <header className="z-10 relative">
        <h1 className="font-display font-medium text-4xl text-white">
          System <span className="text-gradient font-bold drop-shadow-[0_0_15px_rgba(208,188,255,0.3)]">Settings</span>
        </h1>
        <p className="font-sans text-[#cbc3d7]/80 text-sm mt-1">
          Configure profile details and backend AI provider integrations.
        </p>
      </header>

      <div className="max-w-2xl bg-[#14161d] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10">
        
        {/* Profile Card */}
        <section className="flex flex-col gap-1.5 pb-4 border-b border-white/5">
          <h2 className="font-display text-sm font-semibold text-white uppercase tracking-wider">
            Student Profile Details
          </h2>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-lg">
              <img
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBBQZqCikHA2EqxBpgmGBq07pPy6DWCPo2HO2Fo8zA_eJeeRSBdiBfcKLc8uLmBuNoB_HJxUYO48FXDm7qO_3wbVjVB7_Q1NCyeYvpTKhbimIzOBFtmv5mAOcMJUyPuabYkCnqvkcF1z-Z7fDKibnLO3-AM27QZB9su-v-MqDME9wnaK_rLGxcO8U5L5teVYLpK6zYWL9-d9Afzk0DyFOyUP0hm5hnULLT7nEBWb2BPm-NkGd4dfpxD4uXXwMnrnJHQcleBLOhIhOD"
              />
            </div>
            <div>
              <p className="font-sans font-bold text-base text-white">Alex Chen</p>
              <p className="font-mono text-xs text-[#cbc3d7]/60">alex.chen@university.edu</p>
            </div>
          </div>
        </section>

        {/* AI Provider Instructions Card */}
        <section className="flex flex-col gap-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">
              AI Backend Status
            </h3>
            <p className="font-sans text-[#cbc3d7]/60 text-xs mt-1 leading-relaxed">
              LastNight AI reads secrets from the server environment. API keys are never saved from the browser settings screen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatusTile label="Provider" value={health?.provider ? health.provider.toUpperCase() : "Checking..."} tone={health?.aiConfigured ? "good" : "warn"} />
            <StatusTile label="Model" value={health?.model || "Checking..."} />
            <StatusTile label="Gemini" value={health?.geminiConfigured ? "Cloud Ready" : "No Key"} tone={health?.geminiConfigured ? "good" : "warn"} />
            <StatusTile label="Ollama" value={health?.ollamaConfigured ? "Configured" : "Not Set"} tone={health?.ollamaConfigured ? "good" : "warn"} />
            <StatusTile label="API Guard" value={health?.authRequired ? "Shared Secret On" : "Rate Limit Only"} tone={health?.authRequired ? "good" : "warn"} />
            <StatusTile
              label="Upload Limit"
              value={health ? `${health.uploadLimits.maxFileMB}MB file / ${health.uploadLimits.maxTotalMB}MB kit` : "Checking..."}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[#ffb4ab]/20 bg-[#ffb4ab]/10 px-4 py-3 text-xs text-[#ffb4ab]">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-[#cbc3d7]/70 leading-relaxed">
            Cloud demo: set <span className="font-mono text-white">AI_PROVIDER=gemini</span> and <span className="font-mono text-white">GEMINI_API_KEY</span>. Local privacy mode: set <span className="font-mono text-white">AI_PROVIDER=ollama</span> and <span className="font-mono text-white">OLLAMA_BASE_URL</span>, then restart <span className="font-mono text-white">npm run dev</span>.
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const color = tone === "good" ? "text-[#10b981]" : tone === "warn" ? "text-[#ffb4ab]" : "text-[#4cd7f6]";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/55">{label}</div>
      <div className={`mt-2 font-display text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}
