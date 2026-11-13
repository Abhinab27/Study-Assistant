# 📚 Study Assistant

An AI-powered study tool that transforms your notes or any topic into interactive **flashcards** and **quizzes** — built for the Frontend Internship Assignment.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd study-assistant

# 2. Set up backend
cd backend
cp .env.example .env
# → Edit .env and add your GEMINI_API_KEY
npm install
npm run dev      # Starts on http://localhost:3001

# 3. In a new terminal, set up frontend
cd frontend
npm install
npm run dev      # Starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🏗️ Architecture

```
study-assistant/
├── frontend/          # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/    # Flashcard, Quiz, UI components
│   │   ├── hooks/         # useStudySession, useGenerateContent
│   │   ├── types/         # Shared TypeScript types
│   │   └── utils/         # Schema validation (Zod), API client
│   └── ...
└── backend/           # Node + Express
    ├── src/
    │   ├── routes/        # POST /api/generate
    │   ├── services/      # Gemini API integration
    │   └── middleware/     # Error handling, rate limiting
    └── ...
```

### Key Design Decisions

| Concern | Solution |
|---|---|
| **API Key Security** | Key lives only in `backend/.env`; never sent to the browser |
| **Stale Response Prevention** | `AbortController` cancels in-flight requests on re-submit |
| **LLM Output Validation** | Zod schema validates every response before rendering |
| **Race Condition Safety** | Request ID tracking + latest-wins strategy |
| **Failure UX** | Typed error states: validation, network, rate-limit, empty |

### Model Choice
**Google Gemini 1.5 Flash** — fast, free tier available, and natively supports JSON mode (`response_mime_type: "application/json"`) ensuring structured output without brittle string parsing.

---

## ✨ Features

- 📝 **Free-form input** — paste notes, article text, or just a topic name
- 🃏 **Interactive Flashcards** — flip animation, keyboard navigation (←/→/Space)
- 🧠 **Multiple-Choice Quiz** — instant feedback, explanations, score tracking
- 🔁 **Retest Wrong Answers** — re-quiz only the questions you got wrong
- 💾 **Session Persistence** — progress saved to `localStorage`
- 🎯 **Empty / Loading / Error States** — handled gracefully at every step
- 📱 **Mobile Responsive** — works on all screen sizes

---

## 🤖 AI Usage Disclosure

This project was built with the assistance of **Antigravity (AI coding assistant)**:
- Scaffolding the project structure and boilerplate
- Generating component skeletons and type definitions
- Suggesting Zod validation patterns and AbortController usage

All architectural decisions, feature logic, error handling strategies, and final implementations were reviewed and directed by the developer.

---

## ⏱️ Time Spent
~8 hours total across planning, implementation, testing, and documentation.

---

## 🔮 Known Limitations & Future Work
- No user accounts — sessions are single-browser only
- Gemini free tier has rate limits (15 req/min); a 429 error UI is shown
- Could add PDF/image upload as a future input source
- Deck history / saved sessions panel (foundation in localStorage exists)
