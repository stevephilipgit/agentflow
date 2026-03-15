# ⚡ AgentFlow — Multi-Agent AI Platform

> Give it one goal. A Planner AI decomposes it. Specialist agents execute in parallel. Get a full executive report in ~30 seconds.

![AgentFlow Demo](https://img.shields.io/badge/AI-Multi--Agent-6366F1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

---

## 🏗 Architecture

```
User Goal
    │
    ▼
┌─────────────┐
│   PLANNER   │  Decomposes goal into 4 JSON subtasks
└──────┬──────┘
       │
  Promise.all() ← staggered 2s apart to avoid rate limits
       │
 ┌─────┴──────────────────────────┐
 ▼        ▼          ▼           ▼
📊        ⚙️          💰          ⚠️
Analyst  Engineer  Strategist  Risk Auditor
 └─────┬──────────────────────────┘
       │
       ▼
┌──────────────┐
│ SYNTHESIZER  │  Compiles final executive report
└──────────────┘
       │
       ▼
  Final Report (PDF download)
```

## 🛠 Tech Stack

| Layer      | Tool                  | Why                          |
|------------|-----------------------|------------------------------|
| Frontend   | React 18 + Vite 5     | Fast dev, component UI       |
| Styling    | Inline CSS            | No build complexity          |
| AI Model   | LLaMA 3.3 70B (Groq)  | Free, fastest inference      |
| Backend    | Vercel Serverless     | API proxy, hides API key     |
| Deployment | Vercel                | Free, instant CI/CD          |

## 🚀 Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/agentflow.git
cd agentflow

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY
# Get free key at: https://console.groq.com

# 4. Start dev server (Vercel CLI handles the API proxy)
npm install -g vercel
vercel dev

# App runs at http://localhost:3000
```

## 📦 Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/agentflow.git
git push -u origin main

# 2. Import in Vercel dashboard
# Go to vercel.com → New Project → Import your repo

# 3. Add environment variable in Vercel dashboard:
#    GROQ_API_KEY = gsk_xxxxxxxxxxxxxxxxxxxx

# 4. Deploy → Done!
```

## 📁 Project Structure

```
agentflow/
├── api/
│   └── chat.js              ← Vercel serverless proxy (Groq API)
├── public/
│   └── favicon.svg
├── src/
│   ├── agents/
│   │   └── index.js         ← Planner, Worker, Synthesizer logic
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── HeroInput.jsx
│   │   ├── PipelineFlow.jsx
│   │   ├── AgentCard.jsx
│   │   ├── ActivityLog.jsx
│   │   └── FinalReport.jsx
│   ├── utils/
│   │   └── download.js      ← PDF/HTML report download
│   ├── constants.js         ← Design tokens + agent definitions
│   ├── App.jsx              ← Main app + pipeline orchestration
│   └── main.jsx             ← React entry point
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## 🧠 AI Techniques Used

| Technique                  | Where Used                          |
|---------------------------|--------------------------------------|
| Multi-Agent Orchestration | Planner → Workers → Synthesizer      |
| Structured JSON Output    | Planner returns parseable task list  |
| Persona Prompt Engineering| Each agent has unique system prompt  |
| Parallel Async Execution  | Promise.all() with staggered starts  |
| Context Passing           | Synthesizer receives all agent output|
| Retry with Backoff        | Workers retry once after 5s on fail  |
| Rate Limit Handling       | 2s stagger between worker launches   |

## ⚠️ Known Issues & Fixes

**Agent fails with 429 error** → Already handled: workers stagger 2s apart + 5s retry backoff

**Download not working** → Uses Blob URL download (no popup blocker issues)

**Planner returns invalid JSON** → JSON extracted with indexOf/lastIndexOf, not regex

---

Built with ⚡ by AgentFlow · Powered by LLaMA 3.3 70B via Groq
