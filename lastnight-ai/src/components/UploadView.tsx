import React, { useState, useRef } from "react";
import { MaterialInput, UserProfile } from "../types";

interface UploadViewProps {
  onUploadSuccess: (subjectName: string, materialsList: MaterialInput[], timeLeft: string) => void;
  initialSubject?: string;
  userProfile?: UserProfile | null;
}

export default function UploadView({ onUploadSuccess, initialSubject, userProfile }: UploadViewProps) {
  const [subject, setSubject] = useState(initialSubject || "");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([
    "Syllabus PDF",
    "Handwritten Notes",
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<MaterialInput[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("1 night");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pyqInputRef = useRef<HTMLInputElement>(null);
  const maxFileBytes = 10 * 1024 * 1024;
  const maxTotalFileBytes = 20 * 1024 * 1024;
  const maxFileCount = 8;

  const readFileAsMaterial = (file: File, sourceKind: MaterialInput["sourceKind"] = "other"): Promise<MaterialInput> => {
    return new Promise((resolve) => {
      const dataReader = new FileReader();

      dataReader.onload = () => {
        const material: MaterialInput = {
          name: file.name,
          type: file.type || "application/octet-stream",
          sourceKind,
          size: file.size,
          dataUrl: typeof dataReader.result === "string" ? dataReader.result : undefined,
        };

        const isTextLike =
          file.type.startsWith("text/") ||
          /\.(txt|md|csv|json|yaml|yml|log)$/i.test(file.name);

        if (!isTextLike) {
          resolve(material);
          return;
        }

        const textReader = new FileReader();
        textReader.onload = () => {
          resolve({
            ...material,
            text: typeof textReader.result === "string" ? textReader.result.slice(0, 12000) : undefined,
          });
        };
        textReader.onerror = () => resolve(material);
        textReader.readAsText(file);
      };

      dataReader.onerror = () =>
        resolve({
          name: file.name,
          type: file.type || "application/octet-stream",
          sourceKind,
          size: file.size,
        });

      dataReader.readAsDataURL(file);
    });
  };

  const addFiles = async (fileList: FileList, sourceKind: MaterialInput["sourceKind"] = "other") => {
    const incomingFiles = Array.from(fileList);
    let runningTotalBytes = uploadedFiles.reduce((total, file) => total + (file.size || 0), 0);
    const readableFiles: File[] = [];
    let skippedForSize = 0;
    let skippedForLimit = 0;

    for (const file of incomingFiles) {
      if (file.size > maxFileBytes) {
        skippedForSize += 1;
        continue;
      }

      if (uploadedFiles.length + readableFiles.length >= maxFileCount || runningTotalBytes + file.size > maxTotalFileBytes) {
        skippedForLimit += 1;
        continue;
      }

      readableFiles.push(file);
      runningTotalBytes += file.size;
    }

    const skippedCount = incomingFiles.length - readableFiles.length;

    if (readableFiles.length === 0) {
      setUploadNotice(
        skippedCount > 0
          ? "No files staged. Keep uploads under 10MB each, 20MB total, and 8 files per kit."
          : null
      );
      return;
    }

    setIsReadingFiles(true);
    setUploadNotice(null);
    const materials = await Promise.all(readableFiles.map((file) => readFileAsMaterial(file, sourceKind)));
    setUploadedFiles((prev) => {
      const existingKeys = new Set(prev.map((file) => `${file.name}-${file.size || 0}`));
      const nextFiles = materials.filter((file) => !existingKeys.has(`${file.name}-${file.size || 0}`));
      return [...prev, ...nextFiles];
    });
    setIsReadingFiles(false);
    setUploadNotice(
      skippedCount > 0
        ? `${materials.length} ${sourceKind === "pyq" ? "PYQ" : "file"}(s) staged. ${skippedForSize} over 10MB skipped; ${skippedForLimit} exceeded kit limits.`
        : `${materials.length} ${sourceKind === "pyq" ? "PYQ paper" : "file"}(s) staged for analysis.`
    );
  };

  const panicOptions = [
    { id: "3 hours", label: "3 Hours", sub: "Deep Panic Mode", desc: "Rapid 30m sprints", icon: "emergency_home" },
    { id: "6 hours", label: "6 Hours", sub: "Extreme Crunch", desc: "1.5h core topic locks", icon: "hourglass_empty" },
    { id: "1 night", label: "1 Night", sub: "Survival Triage", desc: "Default 4-phase prep", icon: "dark_mode" },
    { id: "2 days", label: "2 Days", sub: "Strategic Study", desc: "Structured Day 1 & 2 plans", icon: "calendar_month" },
  ];

  const toggleChip = (name: string) => {
    if (selectedChips.includes(name)) {
      setSelectedChips(selectedChips.filter((c) => c !== name));
    } else {
      setSelectedChips([...selectedChips, name]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handlePyqFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files, "pyq");
    e.target.value = "";
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerPyqSelect = (event: React.MouseEvent) => {
    event.stopPropagation();
    pyqInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== index));
  };

  const executeAnalysis = () => {
    if (isReadingFiles) {
      setUploadNotice("Hold on a moment, files are still being prepared.");
      return;
    }

    if (!subject.trim()) {
      setUploadNotice("Add an exam or subject name before starting.");
      return;
    }
    
    // Compile full material references combining manual file names and visual chips
    const materialsList: MaterialInput[] = [
      ...(userProfile
        ? [{
            name: "Student Profile Context",
            type: "profile-context",
            sourceKind: "other" as const,
            text: [
              `College: ${userProfile.collegeName}`,
              `Degree: ${userProfile.degree}`,
              `Branch: ${userProfile.branch}`,
              `Semester: ${userProfile.semester}`,
              userProfile.targetExam ? `Target Exam: ${userProfile.targetExam}` : "",
            ].filter(Boolean).join("\n"),
          }]
        : []),
      ...selectedChips.map((chip) => ({ name: chip, type: "source-tag" })),
      ...uploadedFiles,
    ];

    if (materialsList.length === 0) {
      materialsList.push({ name: "Generic Syllabus Core", type: "source-tag" });
    }

    onUploadSuccess(subject, materialsList, timeLeft);
  };

  return (
    <div className="flex-grow flex flex-col justify-center min-h-[calc(100vh-80px)] relative overflow-hidden px-6 py-10 md:px-12">
      <div className="absolute top-24 right-8 w-72 h-24 bg-gradient-to-l from-[#4cd7f6]/10 to-transparent [clip-path:polygon(20%_0,100%_0,82%_100%,0_100%)] pointer-events-none" />
      <div className="absolute bottom-20 left-8 w-80 h-24 bg-gradient-to-r from-[#ff5f7e]/8 to-transparent [clip-path:polygon(0_0,82%_0,100%_100%,18%_100%)] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10 flex flex-col gap-10">
        
        {/* Header Branding Panel */}
        <div className="text-center">
          <h2 className="font-display font-medium text-4xl text-white mb-3">
            Triage Your Exam Materials
          </h2>
          <p className="font-sans text-[#cbc3d7]/85 text-sm md:text-base max-w-xl mx-auto">
            Input your subject structure, specify remaining study hours, and upload notebooks. LastNight AI compiles an ultra-focused revision prep kit.
          </p>
          {userProfile?.collegeName && (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-4 rounded-full border border-[#4cd7f6]/15 bg-[#4cd7f6]/5 px-4 py-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-sm">school</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#cbc3d7]">
                {userProfile.collegeName} • {userProfile.degree} {userProfile.branch} • {userProfile.semester}
              </span>
            </div>
          )}
        </div>

        {/* Bento Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: File input & timeframe parameters (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Subject name input & chips selection */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-mono text-[#cbc3d7] uppercase tracking-wider mb-2">
                  1. Subject info & Material sources
                </label>
                <div className="input-dark rounded-xl flex items-center px-4 py-3">
                  <span className="material-symbols-outlined text-[#cbc3d7]/45 mr-3 text-lg">edit_note</span>
                  <input
                    type="text"
                    required
                    placeholder={userProfile?.branch ? `e.g. ${userProfile.branch} Data Structures or Core Artificial Intelligence` : "e.g. CS-201 Data Structures or Core Artificial Intelligence"}
                    className="bg-transparent border-none outline-none w-full font-sans text-sm text-white focus:ring-0 focus:outline-none placeholder:text-[#cbc3d7]/30"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              {/* Tag sources Selection */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-[#cbc3d7]/50 uppercase tracking-widest font-semibold">Select Material Sources In Kit</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Syllabus PDF", icon: "picture_as_pdf" },
                    { id: "Handwritten Notes", icon: "edit_document" },
                    { id: "Previous Year Papers", icon: "history_edu" },
                    { id: "Lecture Slides", icon: "slideshow" },
                  ].map((chip) => {
                    const isSelected = selectedChips.includes(chip.id);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => toggleChip(chip.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase font-semibold transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#6d3bd7] to-[#d0bcff] text-white border-[#d0bcff] shadow-md"
                            : "bg-white/5 text-[#cbc3d7]/40 border border-white/5 hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">{chip.icon}</span>
                        {chip.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeframe selector: Panic Mode! */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <label className="block text-xs font-mono text-[#cbc3d7] uppercase tracking-wider">
                  2. Select Time Left Before Exam (Panic Mode)
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#ffb4ab]">
                  <span className="material-symbols-outlined text-xs animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span>TIME EXTREMITY</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {panicOptions.map((opt) => {
                  const isSelected = timeLeft === opt.id;
                  let cardBorder = isSelected ? "border-[#a078ff] bg-[#a078ff]/10 shadow-[0_0_15px_rgba(160,120,255,0.15)] bg-zinc-900" : "border-white/5 hover:border-white/20";
                  let cardAccent = isSelected ? "text-[#d0bcff]" : "text-[#cbc3d7]/45";
                  
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setTimeLeft(opt.id)}
                      className={`rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${cardBorder}`}
                    >
                      <div className="flex justify-between items-start gap-1 pb-1">
                        <span className={`material-symbols-outlined text-base ${cardAccent}`}>
                          {opt.icon}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]"></span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <h4 className="font-sans font-bold text-xs text-white">
                          {opt.label}
                        </h4>
                        <p className="font-mono text-[9px] uppercase tracking-wide font-semibold text-[#cbc3d7]/50 mt-0.5">
                          {opt.sub}
                        </p>
                        <p className="font-sans text-[10px] text-[#cbc3d7]/40 leading-normal mt-1 border-t border-white/5 pt-1">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Block: File Uploader drop zone & listings (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`glass-panel rounded-2xl p-6 text-center cursor-pointer relative group flex flex-col items-center justify-center min-h-[190px] duration-300 ${
                isDragOver ? "border-[#d0bcff]/80 bg-[#a078ff]/5" : ""
              }`}
            >
              <div className="animated-border" />
              
              <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center mb-3 group-hover:bg-[#a078ff]/15 duration-300 border border-white/5">
                <span className="material-symbols-outlined text-[#d0bcff] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cloud_upload
                </span>
              </div>
              <h3 className="font-display text-xs font-bold text-white mb-0.5">
                {isReadingFiles ? "Preparing Files..." : "Upload Custom Study Files"}
              </h3>
              <p className="font-sans text-[10px] text-[#cbc3d7]/60">
                {isReadingFiles ? "Reading local file metadata and text excerpts" : "Drag-and-drop notes/syllabus PDF, or click here"}
              </p>
              <button
                type="button"
                onClick={triggerPyqSelect}
                className="mt-4 rounded-lg border border-[#4cd7f6]/25 bg-[#4cd7f6]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#4cd7f6] hover:bg-[#4cd7f6]/15 transition-colors"
              >
                Upload PYQ Papers
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.md,.csv"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <input
                ref={pyqInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.md,.csv"
                className="hidden"
                multiple
                onChange={handlePyqFileChange}
              />
            </div>

            {uploadNotice && (
              <div className="rounded-xl border border-[#4cd7f6]/15 bg-[#4cd7f6]/5 px-3 py-2 font-mono text-[10px] text-[#4cd7f6]">
                {uploadNotice}
              </div>
            )}

            {/* Uploaded Files Tracker list */}
            {uploadedFiles.length > 0 && (
              <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="font-mono text-[9px] text-[#cbc3d7]/50 uppercase tracking-widest font-bold">Uploaded documents ({uploadedFiles.length})</span>
                  <button onClick={() => setUploadedFiles([])} className="font-mono text-[9px] text-[#ffb4ab] hover:underline cursor-pointer">Clear All</button>
                </div>

                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[120px] pr-1.5 custom-scrollbar">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/5 text-[10px]">
                      <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                        <span className="material-symbols-outlined text-[12px] text-[#cbc3d7]/60">article</span>
                        <span className="text-[#cbc3d7] truncate font-mono">{file.name}</span>
                        {file.sourceKind === "pyq" && (
                          <span className="rounded bg-[#4cd7f6]/10 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[#4cd7f6]">
                            PYQ
                          </span>
                        )}
                        {file.size && (
                          <span className="text-[#cbc3d7]/35 font-mono shrink-0">
                            {Math.max(1, Math.round(file.size / 1024))}KB
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="text-red-400 hover:text-red-500 material-symbols-outlined text-xs cursor-pointer"
                      >
                        cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Start Analyze Action Key Button */}
        <div className="flex justify-center mt-2.5">
          <button
            onClick={executeAnalysis}
            disabled={isReadingFiles}
            className="w-full max-w-md py-4 rounded-xl premium-btn text-white font-display text-[16px] font-bold tracking-normal cursor-pointer duration-300 flex items-center justify-center gap-2.5 select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
            {isReadingFiles ? "Preparing Uploads..." : "Ignite LastNight AI Agent"}
          </button>
        </div>

        {/* Guidelines specification status */}
        <p className="text-center font-mono text-[9px] text-[#cbc3d7]/30 tracking-tight leading-normal">
          AI reasoning matches course notes with PYQs to reduce guesswork. Supports PDF, DOCX, TXT, MD, JPG, PNG (Max 10MB per file, 20MB per kit).
        </p>

      </div>
    </div>
  );
}
