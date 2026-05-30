# Final Submission Answers

Submission form:

```text
https://forms.gle/ocsow25Np3pm54K1A
```

Deadline:

```text
May 31, 2026, 11:59 PM IST
```

## Product / Demo Link

Use the deployed Vercel URL as the live demo link after deploying:

```text
TODO: Add Vercel live product URL
```

Use the GitHub repo as the source/MVP link:

```text
https://github.com/Sahil-K39/lastnight-ai
```

Vercel setup: import the GitHub repo, set the root directory to `lastnight-ai`, add backend-only Gemini env vars, and redeploy.

## Product Name

```text
LastNight AI
```

## Product + Solution

```text
LastNight AI is an AI exam survival agent for students who start studying with hours left before an exam. Students upload syllabus notes, PYQs, lecture files, or handwritten material, choose how much time they have left, and receive a structured study kit with exam strategy, PYQ pattern analysis, unit-wise importance, high-priority topics, important questions, revision notes, viva questions, quiz questions, a summary, and a panic-mode study plan.
```

## What Problem Are You Solving?

```text
Students often begin exam preparation too late and waste their most valuable time deciding what to study first. Their study material is scattered across PDFs, notes, slides, PYQs, and images. Generic AI chat answers are usually too broad and not optimized for the last-night exam situation. LastNight AI solves this by turning messy material into a focused, high-yield exam prep workflow.
```

## Proposed Solution + User Journey

```text
The user opens LastNight AI, enters a subject, uploads syllabus/PYQ/notes material, selects the time left before the exam, and launches the AI agent. The app analyzes the available material and produces a practical study kit: what to study first, which units matter most, likely questions, quick notes, viva prep, quizzes, and a time-boxed study plan. The same backend also supports the Flutter mobile app through a synced API endpoint.
```

## Tools / Tech Stack

```text
Frontend: React, Vite, TypeScript, Tailwind CSS, Three.js, Motion, Lucide React.
Backend: Express API, structured JSON response pipeline, upload validation, rate limiting, fallback demo mode.
AI: Gemini Flash for cloud demo mode, Ollama for local privacy-first mode.
Mobile: Flutter app path for Android and iOS.
Workflow: Codex was used to implement features, review bugs, harden security, sync web/mobile schemas, remove OpenAI paid API dependency, add Gemini/Ollama provider switching, prepare GitHub, and create final submission assets.
```

## Target Audience

```text
Primary users are college and university students, especially engineering students preparing for semester exams, viva exams, or internal assessments with limited time. The initial wedge is Indian college students who rely on syllabus PDFs, PYQs, handwritten notes, and lecture slides. Future expansion can support coaching institutes, colleges, student clubs, and cohort-based exam prep workflows.
```

## How Did You Use AI / Codex?

```text
I used Codex as the core build partner throughout the project. Codex helped review the project, fix bugs, improve the UI, add cinematic 3D styling, sync the web app with the Flutter mobile app, add login/signup/profile flows, implement PYQ upload support, add Gemini Flash and Ollama AI provider modes, keep API keys backend-only, remove paid OpenAI API dependency, scan for secrets, prepare the GitHub repo, verify local demo readiness, and create the final pitch deck and submission material.
```

## Video Walkthrough Link

Paste your uploaded 5-10 minute video link here after recording:

```text
TODO: Add YouTube unlisted / Google Drive video link
```

## LinkedIn / X Announcement Link

Paste your public announcement post link here after posting:

```text
TODO: Add LinkedIn or X post link
```

## Pitch Deck

Upload this file to Google Drive and set access to **Anyone with the link can view**:

```text
submission/LastNightAI_PitchDeck.pptx
```

## Demo Notes

```text
The live app runs locally at http://127.0.0.1:3000 for recording. For deployed demo mode, add a rotated Gemini key in backend environment variables only:

AI_PROVIDER=gemini
GEMINI_API_KEY=<new_rotated_key>
GEMINI_MODEL=gemini-3.5-flash

The previously pasted Gemini key should be treated as compromised and should not be used.
```
