# NutriAI

AI-powered nutrition analysis app. Next.js + Tailwind frontend, serverless API route
calling Google Gemini with schema-enforced structured output (no fragile JSON parsing).

## 1. Get a Gemini API key
https://aistudio.google.com/app/apikey → Create API key.

## 2. Run locally
```bash
cd nutriai
npm install
cp .env.example .env.local
# paste your key into .env.local
npm run dev
```
Open http://localhost:3000

## 3. Push to GitHub
```bash
git init
git add .
git commit -m "NutriAI initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/nutriai.git
git push -u origin main
```

## 4. Deploy to Vercel
**Option A — Dashboard (recommended)**
1. Go to https://vercel.com/new
2. Import your `nutriai` GitHub repo
3. Framework preset: Next.js (auto-detected)
4. Under "Environment Variables" add:
   - `GEMINI_API_KEY` = your key
5. Click **Deploy**

**Option B — CLI**
```bash
npm i -g vercel
vercel login
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

## 5. Done
Your app is live at `https://nutriai-<random>.vercel.app`. The API key stays
server-side in the `/api/analyze` route — it's never exposed to the browser.

## Notes
- Uses `gemini-1.5-flash` for speed/cost. Swap to `gemini-1.5-pro` in
  `app/api/analyze/route.js` for higher accuracy.
- `responseSchema` in the API route enforces structured JSON output directly
  from Gemini — this replaces the old approach of parsing markdown-fenced text.
