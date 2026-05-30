# Final Submission Checklist

Deadline: **May 31, 2026, 11:59 PM IST**

Submission form:

```text
https://forms.gle/ocsow25Np3pm54K1A
```

## Must Submit

- [ ] Product/demo link
- [ ] 5-10 minute video walkthrough link
- [ ] LinkedIn or X/Twitter announcement post link
- [ ] Solution details
- [ ] Codex/OpenAI usage details
- [ ] Pitch deck link with open access

## Ready Now

- [x] GitHub repo: `https://github.com/Sahil-K39/lastnight-ai`
- [x] Local demo: `http://127.0.0.1:3000`
- [x] Pitch deck: `submission/LastNightAI_PitchDeck.pptx`
- [x] Demo script: `submission/video-walkthrough-script.md`
- [x] Social post drafts: `submission/social-announcement-posts.md`
- [x] Form answer draft: `submission/final-submission-answers.md`
- [x] INR pricing: `₹0 trial`, `₹49 / 72 hours`, `₹149/month`, `₹399 / 3 months`, `Custom INR`
- [x] Secret scan checked for exposed keys in files

## Do Before Submitting

- [ ] Record walkthrough video.
- [ ] Upload video to YouTube unlisted or Google Drive.
- [ ] Make sure video link is accessible.
- [ ] Upload `LastNightAI_PitchDeck.pptx` to Google Drive.
- [ ] Set deck access to **Anyone with the link can view**.
- [ ] Post LinkedIn or X announcement.
- [ ] Paste final video, pitch deck, announcement, and GitHub links into the submission form.

## Public Live Demo Link

- [ ] Import the GitHub repo into Vercel.
- [ ] Set the Vercel project root directory to `lastnight-ai`.
- [ ] Rotate the Gemini API key.
- [ ] Add backend-only Vercel environment variables:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=<new_rotated_key>
GEMINI_MODEL=gemini-3.5-flash
```

- [ ] Redeploy.
- [ ] Test the deployed URL and `/api/health` before submitting.
- [ ] Use the deployed Vercel URL as the **Live product/demo link** in the form.
