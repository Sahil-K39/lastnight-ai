# LastNight AI Submission

## Product

LastNight AI is an AI exam survival agent for students who start studying with hours left, not weeks. Students upload syllabus notes, previous year question papers, lecture files, or handwritten material, choose the time left before the exam, and receive a focused study kit.

## Hackathon

OpenAI x Outskill AI Builders Hackathon.

This is framed as a shipping competition, so the demo focuses on the working product:

- Web app: React, Vite, TypeScript, Three.js, Express.
- Mobile app path: fully Flutter for Android and iOS.
- AI providers: Gemini Flash for cloud demo, Ollama for local privacy-first mode.
- Demo reliability: local fallback keeps the product working without exposing secrets.

## Demo Flow

1. Open the web app.
2. Click **Start Preparing**.
3. Enter a subject such as `Operating Systems`.
4. Upload or stage a PYQ/syllabus/notes file.
5. Choose a panic mode: `3 hours`, `6 hours`, `1 night`, or `2 days`.
6. Run the agent.
7. Show the results: exam strategy, PYQ pattern analysis, unit-wise importance, high-priority topics, important questions, revision notes, viva questions, quiz, summary, and study plan.

## Final Checklist

- GitHub repo pushed: `https://github.com/Sahil-K39/lastnight-ai`
- Local demo: `http://127.0.0.1:3000`
- Public demo deployment: import the repo into Vercel and set root directory to `lastnight-ai`
- Real-life pricing: `₹0 trial`, `₹49 / 72 hours`, `₹149/month`, `₹399 / 3 months`, and `Custom INR` for campuses
- API keys are backend-only and ignored by git.
- The pasted Gemini key should be treated as compromised and rotated before Vercel demo use.
