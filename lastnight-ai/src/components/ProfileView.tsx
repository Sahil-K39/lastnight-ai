import { ChangeEvent, useRef, useState } from "react";
import { UserProfile } from "../types";

interface ProfileViewProps {
  user: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onCreateAccount: () => void;
}

function initialsFor(name?: string, email?: string) {
  const source = (name || email || "LastNight AI").trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LN";
}

const emptyProfile: UserProfile = {
  id: "draft",
  fullName: "",
  email: "",
  collegeName: "",
  degree: "",
  branch: "",
  semester: "",
  rollNumber: "",
  targetExam: "",
};

export default function ProfileView({ user, onSave, onCreateAccount }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile>(user || emptyProfile);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!user) {
    return (
      <div className="flex-1 min-h-screen px-6 py-8 md:px-12 flex items-center justify-center relative">
        <div className="glass-panel rounded-2xl p-8 max-w-xl text-center">
          <span className="material-symbols-outlined text-[#d0bcff] text-5xl mb-4">account_circle</span>
          <h1 className="font-display text-3xl font-semibold text-white tracking-tight">Create your profile first</h1>
          <p className="text-[#cbc3d7]/75 mt-3 leading-relaxed">
            Add your college and study details so LastNight AI can attach useful context to every PYQ upload.
          </p>
          <button onClick={onCreateAccount} className="glow-btn rounded-xl px-6 py-3 mt-6 font-mono text-[11px] uppercase tracking-widest text-white">
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file for your profile picture.");
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setNotice("Profile photo must be under 2.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({
        ...current,
        avatarDataUrl: typeof reader.result === "string" ? reader.result : current.avatarDataUrl,
      }));
      setNotice("Profile photo staged. Save changes to keep it.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSave = () => {
    if (!profile.fullName.trim() || !profile.email.trim() || !profile.collegeName.trim()) {
      setNotice("Name, email, and college are required.");
      return;
    }

    onSave({
      ...profile,
      fullName: profile.fullName.trim(),
      email: profile.email.trim().toLowerCase(),
      collegeName: profile.collegeName.trim(),
      degree: profile.degree.trim(),
      branch: profile.branch.trim(),
      semester: profile.semester.trim(),
      rollNumber: profile.rollNumber?.trim() || undefined,
      targetExam: profile.targetExam?.trim() || undefined,
    });
    setNotice("Profile saved.");
  };

  return (
    <div className="flex-1 min-h-screen px-6 py-8 md:px-12 flex flex-col gap-8 relative">
      <header className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-end">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#4cd7f6]">Student Profile</span>
          <h1 className="font-display text-4xl text-white font-medium tracking-tight mt-2">Account and college details</h1>
          <p className="text-[#cbc3d7]/80 mt-2 max-w-2xl">
            This context helps the upload agent understand your course, exam style, and PYQ source material.
          </p>
        </div>
        <button onClick={handleSave} className="glow-btn rounded-xl px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-white">
          Save Profile
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-6 relative z-10">
        <section className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-3xl overflow-hidden border border-[#d0bcff]/30 bg-[#d0bcff]/10 flex items-center justify-center hover:bg-[#d0bcff]/15 transition-colors"
            aria-label="Change profile picture"
          >
            {profile.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl font-bold text-[#d0bcff]">{initialsFor(profile.fullName, profile.email)}</span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div>
            <h2 className="font-display text-2xl text-white font-semibold tracking-tight">{profile.fullName || "Student Name"}</h2>
            <p className="text-sm text-[#cbc3d7]/70 mt-1">{profile.email || "student@college.edu"}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">Current Academic Context</span>
            <p className="text-white mt-3 leading-relaxed">
              {profile.degree || "Degree"} • {profile.branch || "Branch"} • {profile.semester || "Semester"}
            </p>
            <p className="text-[#4cd7f6] text-sm mt-2">{profile.collegeName || "College not set"}</p>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField label="Full Name" value={profile.fullName} onChange={(value) => updateProfile("fullName", value)} />
          <ProfileField label="Email" value={profile.email} onChange={(value) => updateProfile("email", value)} type="email" />
          <ProfileField label="College Name" value={profile.collegeName} onChange={(value) => updateProfile("collegeName", value)} />
          <ProfileField label="Degree" value={profile.degree} onChange={(value) => updateProfile("degree", value)} />
          <ProfileField label="Branch" value={profile.branch} onChange={(value) => updateProfile("branch", value)} />
          <ProfileField label="Semester / Year" value={profile.semester} onChange={(value) => updateProfile("semester", value)} />
          <ProfileField label="Roll Number" value={profile.rollNumber || ""} onChange={(value) => updateProfile("rollNumber", value)} />
          <ProfileField label="Target Exam" value={profile.targetExam || ""} onChange={(value) => updateProfile("targetExam", value)} />
          {notice && (
            <div className="md:col-span-2 rounded-xl border border-[#4cd7f6]/15 bg-[#4cd7f6]/5 px-4 py-3 text-sm text-[#4cd7f6]">
              {notice}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-dark rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-[#cbc3d7]/30"
      />
    </label>
  );
}
