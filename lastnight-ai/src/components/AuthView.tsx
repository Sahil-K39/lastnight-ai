import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { TabState, UserProfile } from "../types";
import CinematicScene from "./CinematicScene";
import ShootingStarBackdrop from "./ShootingStarBackdrop";

interface AuthViewProps {
  mode: "login" | "signup";
  savedProfile: UserProfile | null;
  onAuthComplete: (profile: UserProfile) => void;
  onNavigate: (tab: TabState) => void;
}

const defaultProfile = {
  fullName: "",
  email: "",
  collegeName: "",
  degree: "",
  branch: "",
  semester: "",
  rollNumber: "",
  targetExam: "",
};

function initialsFor(name: string, email: string) {
  const source = name.trim() || email.trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LN";
}

async function hashPassword(password: string, email: string) {
  const payload = `${email.toLowerCase()}:${password}`;
  if (!window.crypto?.subtle) {
    return `demo:${window.btoa(payload)}`;
  }

  const encoded = new TextEncoder().encode(payload);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function AuthView({ mode, savedProfile, onAuthComplete, onNavigate }: AuthViewProps) {
  const [form, setForm] = useState(defaultProfile);
  const [password, setPassword] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSignup = mode === "signup";

  const updateField = (field: keyof typeof defaultProfile, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the profile photo.");
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setError("Profile photo must be under 2.5MB for this demo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDataUrl(typeof reader.result === "string" ? reader.result : undefined);
      setError(null);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError("Add your email to continue.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Use at least 6 characters for the demo password.");
      return;
    }

    if (!isSignup) {
      if (!savedProfile || savedProfile.email.toLowerCase() !== email) {
        setError("No local account found for this email. Create an account first.");
        return;
      }
      if (savedProfile.passwordHash) {
        const submittedHash = await hashPassword(password, email);
        if (submittedHash !== savedProfile.passwordHash) {
          setError("Password does not match this local demo account.");
          return;
        }
      }
      onAuthComplete(savedProfile);
      return;
    }

    if (!form.fullName.trim() || !form.collegeName.trim() || !form.degree.trim() || !form.branch.trim() || !form.semester.trim()) {
      setError("Fill name, college, degree, branch, and semester so the study profile is useful.");
      return;
    }

    onAuthComplete({
      id: savedProfile?.id || `user-${Date.now()}`,
      fullName: form.fullName.trim(),
      email,
      passwordHash: await hashPassword(password, email),
      avatarDataUrl,
      collegeName: form.collegeName.trim(),
      degree: form.degree.trim(),
      branch: form.branch.trim(),
      semester: form.semester.trim(),
      rollNumber: form.rollNumber.trim() || undefined,
      targetExam: form.targetExam.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-[#e2e2e8] font-sans antialiased overflow-hidden relative">
      <CinematicScene density="active" />
      <ShootingStarBackdrop page={isSignup ? "features" : "product"} />

      <button
        onClick={() => onNavigate("landing")}
        className="fixed left-6 top-6 z-20 flex items-center gap-2 text-[#d0bcff] hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">psychology</span>
        <span className="font-display font-bold text-xl tracking-tighter">LastNight AI</span>
      </button>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 max-w-6xl w-full items-stretch">
          <section className="glass-panel rounded-2xl p-8 md:p-10 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-l from-[#4cd7f6]/15 to-transparent [clip-path:polygon(24%_0,100%_0,72%_100%,0_100%)]" />
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#4cd7f6]">
                {isSignup ? "Builder Account" : "Welcome Back"}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mt-4">
                {isSignup ? "Create your exam command profile." : "Log in to your study cockpit."}
              </h1>
              <p className="text-[#cbc3d7]/80 leading-relaxed mt-5 max-w-xl">
                {isSignup
                  ? "Add your college details once, then every PYQ upload and study kit carries the right academic context."
                  : "Use your local demo account to jump back into dashboard, uploads, and saved study kits."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-10">
              {["Profile", "College", "PYQ"].map((label) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/65">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-5">
            {isSignup && (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl overflow-hidden border border-[#d0bcff]/30 bg-[#d0bcff]/10 flex items-center justify-center shrink-0 hover:bg-[#d0bcff]/15 transition-colors"
                  aria-label="Choose profile picture"
                >
                  {avatarDataUrl ? (
                    <img src={avatarDataUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-2xl font-bold text-[#d0bcff]">
                      {initialsFor(form.fullName, form.email)}
                    </span>
                  )}
                </button>
                <div>
                  <h2 className="font-display text-white text-xl font-semibold tracking-tight">Optional Profile Photo</h2>
                  <p className="text-sm text-[#cbc3d7]/65 mt-1">Upload a JPG or PNG under 2.5MB, or keep the initials avatar.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            )}

            {isSignup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Full Name" value={form.fullName} onChange={(value) => updateField("fullName", value)} placeholder="Sahil Kumar" />
                <TextField label="College Name" value={form.collegeName} onChange={(value) => updateField("collegeName", value)} placeholder="Outskill Institute of AI" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="you@college.edu" />
              <TextField label="Password" type="password" value={password} onChange={setPassword} placeholder="Minimum 6 characters" />
            </div>

            {isSignup && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField label="Degree" value={form.degree} onChange={(value) => updateField("degree", value)} placeholder="B.Tech" />
                  <TextField label="Branch" value={form.branch} onChange={(value) => updateField("branch", value)} placeholder="Computer Science" />
                  <TextField label="Semester" value={form.semester} onChange={(value) => updateField("semester", value)} placeholder="Semester 5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Roll Number" value={form.rollNumber} onChange={(value) => updateField("rollNumber", value)} placeholder="Optional" />
                  <TextField label="Target Exam" value={form.targetExam} onChange={(value) => updateField("targetExam", value)} placeholder="Mid Sem, Finals, Viva" />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-[#ffb4ab]/20 bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
                {error}
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-[#cbc3d7]/65 leading-relaxed">
              Demo auth note: a local password hash is stored only in this browser. Use real backend auth before public launch.
            </div>

            <button type="submit" className="glow-btn rounded-xl py-4 font-mono text-[11px] uppercase tracking-widest text-white">
              {isSignup ? "Create Account" : "Login"}
            </button>

            <button
              type="button"
              onClick={() => onNavigate(isSignup ? "login" : "signup")}
              className="text-sm text-[#cbc3d7]/75 hover:text-white transition-colors"
            >
              {isSignup ? "Already have an account? Login" : "New here? Create your account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input-dark rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-[#cbc3d7]/30"
      />
    </label>
  );
}
