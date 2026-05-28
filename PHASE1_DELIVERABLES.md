# LastNight AI - Phase 1 Deliverables

Date: May 27, 2026

## Daily Progress Update

Project: LastNight AI

Today I finalized the Phase 1 MVP for LastNight AI, an AI-powered exam survival kit for students who have hours, not weeks. The web app now supports the core journey: students enter a subject, upload syllabus/PYQ/notes, choose the time left before the exam, run the AI agent, and receive a practical study kit with priority topics, predicted questions, viva prep, quick notes, quizzes, and a panic-mode timeline.

Current status:
- Web MVP production build passes successfully.
- Main product flow is implemented: landing, dashboard, upload, panic mode, progress, and results.
- Backend integration is available through an Express server using Gemini Flash for cloud demos or Ollama for local privacy-first mode, with local fallback predictions for demo reliability.
- Mobile paths exist for Flutter, native Android reference, and iOS reference.
- Next focus is polishing the live demo narrative, capturing screenshots/demo video, and packaging the 4-slide pitch deck.

Blockers:
- Need to confirm the final deployment URL and backend Gemini environment variables before public demo.
- Flutter/iOS builds need verification on a machine with Flutter and full mobile SDKs installed.

## Phase 1 Checklist

- MVP with main features working: Complete for web MVP.
- Clear user flow / product journey: Complete.
- 4-slide pitch deck: Draft content ready below.

## 4-Slide Pitch Deck Content

### Slide 1: Problem

Students often start exam prep too late and waste precious time deciding what to study first. Syllabus files, notes, and PYQs are scattered across formats, and generic AI chat does not produce a focused, exam-ready plan.

Pain points:
- Too much material, too little time.
- No clear priority order for topics.
- PYQs and syllabus patterns are underused.
- Students need quick recall, viva prep, and time-boxed revision, not long explanations.

### Slide 2: Solution & Key Features

LastNight AI turns messy course material into a personalized exam survival kit.

Key features:
- Upload syllabus, notes, PDFs, images, and PYQs.
- Choose remaining time: 3 hours, 6 hours, 1 night, or 2 days.
- Get high-priority topics ranked by likely importance.
- Generate predicted questions, quick notes, viva questions, quizzes, and a panic-mode study timeline.
- Demo-safe fallback mode keeps results working even without live API access.

### Slide 3: Tools & Tech Stack

Frontend:
- React 19, Vite, TypeScript, Tailwind CSS
- Motion, Lucide React, Three.js

Backend:
- Express
- Gemini Flash cloud AI provider for deployed demos
- Ollama local AI provider for privacy-first demos
- Backend-only environment variables for API keys
- Compatibility endpoint: `POST /api/analyze`

Platforms:
- Web MVP
- Flutter mobile path for Android and iOS
- Native Android and iOS reference implementations

### Slide 4: ICP / Target Audience

Ideal Customer Profile:
- College and university students, especially engineering students.
- Students preparing with limited time before exams.
- Learners who have syllabus PDFs, PYQs, lecture notes, or handwritten notes but need a clear study strategy.

Initial wedge:
- Indian engineering students facing semester exams and viva preparation.

Buyer/user expansion:
- Coaching institutes, colleges, student communities, and edtech platforms that want AI-powered exam prep workflows.

## Demo Flow

1. Enter a subject like `Operating Systems`.
2. Upload a syllabus or PYQ PDF plus notes.
3. Select a time constraint such as `3 Hours` or `1 Night`.
4. Run the agent progress screen.
5. Show the results dashboard: priority topics, predicted questions, viva prep, quiz, and hour-by-hour study plan.
