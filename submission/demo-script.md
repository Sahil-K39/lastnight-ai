# LastNight AI Demo Script

## 30-Second Opening

LastNight AI is built for students who open their syllabus the night before the exam and do not know what to study first. Instead of giving a generic chatbot answer, it turns syllabus notes, PYQs, and study files into a focused exam survival kit.

## Live Walkthrough

1. Start on the cinematic landing page.
2. Show the pricing section with all real-life INR plans: `₹0`, `₹49 / 72 hours`, `₹149/month`, `₹399 / 3 months`, and `Custom INR`.
3. Click **Start Preparing**.
4. Enter `Operating Systems`.
5. Upload or stage PYQ/syllabus material.
6. Select `3 Hours` to demonstrate panic mode.
7. Run the agent.
8. Open the results dashboard.

## What To Point Out

- The product returns structured output, not just chat text.
- It identifies high-priority topics and important questions.
- It creates quick revision notes, viva questions, quizzes, and a time-boxed study plan.
- The same backend supports the Flutter mobile app through `POST /api/analyze`.
- Gemini Flash is used for cloud demo mode; Ollama is available for local privacy-first mode.
- Secrets stay only in backend environment variables.

## Closing Line

This is not a pitch-only concept. LastNight AI is a working AI product shipped with a web app, backend, Flutter mobile path, structured AI output, and demo-safe fallbacks.
