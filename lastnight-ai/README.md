# LastNight AI

AI-powered exam survival kits for students who have hours, not weeks.

This build is shaped for the OpenAI x Outskill AI Builders Hackathon: a working product first, pitch second. Students enter a subject, upload syllabus/PYQ/notes files, choose how much time is left, and receive a practical study kit with priority topics, predicted questions, viva prep, quick notes, quizzes, and a panic-mode timeline.

## What Ships

- React + Vite product UI with dashboard, upload, agent progress, results, flashcards, quiz, and assistant views.
- Express backend with switchable AI providers: Gemini Flash for cloud demos and Ollama for local private use.
- Browser-side file capture for PDFs, docs, images, and text-like files.
- Gemini inline PDF/image support for uploaded materials when `GEMINI_API_KEY` is configured.
- Local fallback predictions so demos still work without secrets.
- Compatibility endpoint at `POST /api/analyze` for the Android client schema.

## Run Locally

Prerequisites: Node.js 20+.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   ```

3. Choose your AI provider:

   Cloud demo mode with Gemini Flash:
   ```bash
   AI_PROVIDER="gemini"
   GEMINI_API_KEY="your_google_ai_studio_key"
   GEMINI_MODEL="gemini-3.5-flash"
   ```

   Local AI mode with Ollama:
   ```bash
   AI_PROVIDER="ollama"
   OLLAMA_BASE_URL="http://127.0.0.1:11434"
   OLLAMA_MODEL="llama3.2"
   ```

   The server loads `.env.local` first, then `.env`. Keep real keys out of source control.

4. Start the app:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Runtime Safety

- API routes are rate-limited by IP by default.
- Uploads are capped at 8 files, 10MB per file, and 20MB per study kit.
- API keys stay only in backend environment variables and are never sent to the frontend.
- Demo auth is local-only. Use Clerk, Firebase Auth, Supabase Auth, or a backend session system before public launch.

## AI Provider Modes

### Cloud Demo Mode: Gemini Flash

Use this for the deployed Vercel demo when you do not want a paid OpenAI API dependency:

```bash
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_google_ai_studio_key"
GEMINI_MODEL="gemini-3.5-flash"
```

The backend calls Gemini's `generateContent` API and asks for structured JSON containing:

- `examStrategy`
- `confidenceLevel`
- `pyqPatternAnalysis`
- `unitWiseImportance`
- `highPriorityTopics`
- `importantQuestions`
- `revisionNotes`
- `vivaQuestions`
- `quiz`
- `summary`
- `studyPlan`

### Local AI Mode: Ollama

Use this for privacy-first local demos:

```bash
ollama pull llama3.2
ollama serve

AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="llama3.2"
```

Ollama runs locally, so uploaded study material stays on your machine. No paid OpenAI API is required for either mode.

## Build

```bash
npm run lint
npm run build
```

## Hackathon Demo Flow

1. Enter a real subject, for example `Operating Systems`.
2. Upload a syllabus or PYQ PDF, plus any text notes.
3. Select `3 Hours`, `6 Hours`, `1 Night`, or `2 Days`.
4. Run the agent and open the Results dashboard.
5. Show the judge the source-grounded plan, predicted questions, quiz, and assistant explainers.
