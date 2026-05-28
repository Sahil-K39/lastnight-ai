# LastNight AI

AI-powered exam survival kits for students who have hours, not weeks.

This repository contains the public demo-ready product for the OpenAI x Outskill AI Builders Hackathon:

- `lastnight-ai`: React + Vite web app with an Express backend.
- `lastnight-ai-flutter`: Fully Flutter mobile app for Android and iOS.

## AI Providers

The backend does not require a paid OpenAI API key.

- Cloud demo mode: Gemini Flash through backend-only `GEMINI_API_KEY`.
- Local privacy mode: Ollama through backend-only `OLLAMA_BASE_URL`.

Never put AI keys in frontend code, Flutter Dart code, or any `VITE_*` variable.

## Web Demo

```bash
cd lastnight-ai
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

For Vercel, set these environment variables in the Vercel dashboard:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_rotated_google_ai_studio_key
GEMINI_MODEL=gemini-3.5-flash
```

## Flutter Demo

```bash
cd lastnight-ai-flutter
flutter pub get
flutter run
```

For a deployed backend:

```bash
flutter run --dart-define=API_BASE_URL=https://your-backend.example.com/
```

Android emulator local backend default:

```text
http://10.0.2.2:3000/
```

iOS simulator local backend default:

```text
http://127.0.0.1:3000/
```

## Push Safety

This repo ignores `.env*`, Vercel local files, build outputs, Flutter/Gradle caches, iOS Pods, signing keys, service account JSON files, and platform config secrets such as `google-services.json` and `GoogleService-Info.plist`.

The API key that was pasted in chat should be treated as compromised. Rotate it in Google AI Studio before using the demo.
