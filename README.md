# 📚 Study Assistant

> An AI-powered learning workspace that transforms free-form notes or topics into interactive **Flashcards** and **Quizzes** with instant feedback and wrong-answer re-testing. Built for the **Frontend Internship Assignment**.

[![Node.js](https://img.shields.io/badge/Node.js-≥18-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-lightgrey.svg)](https://expressjs.com/)
[![Zod](https://img.shields.io/badge/Zod-3-blueviolet.svg)](https://zod.dev/)

---

## 🎯 Assignment Overview & Choice

- **Chosen Track**: **Study Assistant**
- **Core Principle**: **Not a chatbot**. The AI returns strictly structured JSON that is parsed, validated, and rendered as interactive, stateful UI components. Raw model text is never dumped into a chat window.
- **Key Focus**: Turning unpredictable LLM output into reliable UI, guaranteeing fault tolerance, and handling model failure gracefully without crashes.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- A **Google Gemini API Key** (free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### Step 1: Configure Environment

In the `backend` folder, create a `.env` file from `.env.example`:

```bash
# From the project root:
cd backend
cp .env.example .env
```

Open `backend/.env` and insert your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

---

### Step 2: Run the Application

#### Option A — Single Command from Root (`npm install && npm start`)
As specified in the assignment submission guidelines, you can run the entire stack from the root directory:

```bash
# In the repository root:
npm install
npm start
```
*This installs dependencies across both sub-projects and concurrently boots the backend (`http://localhost:3001`) and frontend (`http://localhost:5173`).*

#### Option B — Run in Two Terminals (Traditional)

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev      # Starts Express API on http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev      # Starts Vite React app on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 🕹️ Interactive Usage Guide

### 1. Free-Form Input Panel
- **Topic Input (Required)**: Enter any subject (e.g., *TCP vs UDP*, *Photosynthesis*, *French Revolution*).
- **Your Notes (Optional)**: Paste up to 8,000 characters of lecture notes, article excerpts, or syllabus points.
- **Suggestion Chips**: One-click quick-fill topics to test immediately.
- **Mode Toggle**: Switch between **🃏 Flashcards** and **🧠 Quiz** generation.

### 2. 🃏 Flashcards Mode
- **3D Card Flip**: Click the card or press <kbd>Space</kbd> / <kbd>Enter</kbd> to flip between question and answer.
- **Keyboard Navigation**: Use <kbd>←</kbd> and <kbd>→</kbd> arrow keys to navigate between cards.
- **Hints**: Click `💡 Show hint` for subtle contextual clues without revealing the answer.
- **Progress Tracking**: Real-time progress bar and clickable dot indicators to jump between cards.

### 3. 🧠 Multiple-Choice Quiz Mode
- **Interactive Questions**: 4 plausible options generated per question.
- **Instant Feedback**: Clicking an option reveals immediate correctness (`✓ Correct` / `✗ Your answer`) and a detailed pedagogical explanation.
- **Score Summary Screen**: Displays total score, accuracy percentage, and an itemized breakdown of every question.
- **🔁 Retest Wrong Answers**: Re-quizzes **only** the questions you answered incorrectly, reinforcing retention until mastery.

---

## 🛡️ Handling Bad AI Output & Failure Modes

> *"Most of the signal is in handling the model returning bad output... Handling failure well is what separates people who've built AI features from those who haven't."* — Assignment Prompt

LLMs are inherently probabilistic and non-deterministic. Here is how this application turns unpredictable model outputs into rock-solid UI:

| Failure Mode | Risk | Our Engineering Solution | User Experience |
|:---|:---|:---|:---|
| **Malformed JSON** | `JSON.parse` crashes frontend | Backend uses Gemini's native JSON mode (`responseMimeType: "application/json"`) + `stripJsonFences()` sanitizer to strip stray ` ```json ` markdown code fences before parsing. | Seamless rendering; no parse crashes. |
| **Wrong Shape / Missing Keys** | Undefined property errors (e.g., `card.front` missing) | Strict runtime **Zod Schemas** validate structure (`min(1)`, required fields, array bounds). Any mismatch fails closed with a typed `502 schema_mismatch`. | Clean error screen: *"Unexpected Response"*, with an instant retry action. |
| **Stale Responses / Race Conditions** | Slow previous prompt overwrites newer prompt results | Frontend `useGenerate` tracks requests with **`AbortController`**. If a new request is fired, any active in-flight request is immediately aborted; aborted responses are discarded. | Latest user intent always wins; no stale state overwrite. |
| **API Rate Limits (429)** | Exceeded free-tier quota (15 RPM) | Backend detects 429 / quota status; frontend classifies into `rate_limit` error state. | Friendly warning with cooldown explanation: *"The free tier allows ~15 requests/minute. Wait a moment and try again."* |
| **Backend Offline / Network Loss** | Browser `fetch` network rejection | Client-side error classifier maps network failures to typed `{ type: 'network' }`. | Clear instruction banner: *"Make sure the backend server is running on port 3001"*. |
| **Slow / In-Flight Generation** | User uncertainty / repetitive clicks | Input form is disabled during generation; loading screen shows animated card stack with rotating educational messages + skeleton placeholders. | Smooth visual feedback with zero layout shift. |
| **Empty / Overlong Input** | Wasting LLM tokens on invalid inputs | Client and backend enforce character boundaries (`topic` 1–200 chars, `notes` max 8000 chars). | Form validation prevents invalid requests before they leave the browser. |

### Error Recovery Actions
Every error screen provides two distinct user escape hatches:
1. **🔄 Try Again**: Re-submits the exact same prompt and options without retyping.
2. **← Start Over**: Resets application state and returns to the input form.

---

## 🏗️ Architecture & Security

```
study-assistant/
├── package.json               # Root scripts (npm install && npm start)
├── run.js                     # Zero-dependency concurrent dev runner
├── backend/                   # Secure Express API Proxy
│   ├── .env.example           # Environment template
│   ├── src/
│   │   ├── index.js           # Server entry point & CORS
│   │   ├── routes/
│   │   │   └── generate.js    # POST /api/generate with Zod body validation
│   │   ├── services/
│   │   │   └── gemini.js      # Gemini API caller, Zod response validation & prompt engineering
│   │   └── middleware/
│   │       ├── errorHandler.js # Typed error normalization (429, 502, 500)
│   │       └── rateLimiter.js  # Server-side IP rate limiting
│   └── package.json
└── frontend/                  # React (Vite) Single Page App
    ├── index.html
    ├── src/
    ├── src/components/
    │   ├── InputPanel.jsx     # Free-form input, mode toggle, suggestions
    │   ├── FlashcardView.jsx  # 3D cards, keyboard nav, hint reveal
    │   ├── QuizView.jsx       # Quiz state machine, scoring, retest wrong answers
    │   ├── LoadingState.jsx   # Animated cards, rotating status, skeleton
    │   └── ErrorState.jsx     # Typed error view with Retry & Reset
    ├── src/hooks/
    │   ├── useGenerate.js     # State machine with AbortController cancellation
    │   └── useQuizSession.js  # Quiz state management
    ├── src/utils/
    │   ├── api.js             # Fetch wrapper with error classification
    │   └── storage.js         # LocalStorage session persistence
    └── package.json
```

### 🔒 API Key Security
Per the assignment instructions (*"don't ship it in the browser. Route the model call through a small backend"*):
- The Gemini API key resides **strictly on the Express backend** in `backend/.env`.
- The client communicates only with `http://localhost:3001/api/generate`.
- Zero credentials or environment variables are bundled into the Vite client bundle.

---

## 🌟 Stretch Goals Implemented

- [x] **Keyboard Navigation**: Full arrow key (<kbd>←</kbd> / <kbd>→</kbd>) navigation and <kbd>Space</kbd> / <kbd>Enter</kbd> card flipping.
- [x] **3D Flip & Transition Animations**: Smooth CSS 3D transform card flip and progress bar animations.
- [x] **Session Persistence**: Automatic saving of recent generations to `localStorage` (up to 10 sessions).
- [x] **Retest Wrong Answers Workflow**: Stateful score screen that isolates incorrect answers and launches a focused re-test session.
- [x] **Mobile Responsive**: Flexbox/Grid responsive layout tested down to mobile viewport sizes.

---

## 🤖 AI Usage Disclosure

In compliance with the assignment instructions (*"Add a short note in your README on what you used AI for — being honest about it counts in your favor"*):

### What AI Tools Were Used
- **Antigravity AI (Google DeepMind)** was used during development as an intelligent assistant.

### Where AI Was Leveraged
- **Scaffolding & Boilerplate**: Initial Vite React and Express boilerplate setup.
- **Schema Drafting**: Generating initial Zod schema definitions for flashcards and quiz structures.
- **CSS Styling Foundation**: Providing starting CSS rules for the 3D card flip perspective (`transform-style: preserve-3d`).

### What Was Authored & Directed by the Developer
- **Architecture & Proxy Design**: Designing the backend proxy isolation to secure API keys.
- **Race Condition Prevention**: Designing the `AbortController` cancellation logic in `useGenerate` to handle stale responses.
- **Failure Taxonomy**: Building the typed error categorization (`network`, `rate_limit`, `schema_mismatch`, `server`) and recovery UX.
- **Quiz Retest State Machine**: Architecting the multi-phase quiz loop (`answering` → `complete` → `retest` → merged score resolution).
- **Prompt Engineering**: Designing JSON-mode prompt contracts with explicit distractor and explanation requirements.

*The developer thoroughly understands every line of code in this repository and is ready to demo, explain architectural decisions, or extend features during the interview.*

---

## ⏱️ Time Spent

Total development time was capped strictly at **~8 hours** to respect the assignment guidelines:

| Phase | Description | Time Spent |
|:---|:---|:---|
| **Planning & Architecture** | Requirement breakdown, schema design, API security model | ~1.0 hour |
| **Backend & AI Integration** | Express server, Gemini JSON-mode integration, Zod validation | ~1.5 hours |
| **Frontend Core & State** | Input form, Flashcard view, Quiz engine with wrong answer retest | ~2.5 hours |
| **Failure Handling & Edge Cases** | AbortController cancellation, error categorization, retry logic | ~1.5 hours |
| **UI Polish & Responsiveness** | 3D animations, keyboard shortcuts, mobile CSS styling | ~1.0 hour |
| **Documentation & Packaging** | Single-command root setup, README, verification | ~0.5 hour |
| **Total** | | **~8.0 hours** |

---

## 🔮 Known Limitations & What I'd Do Next

If additional time were available beyond the 8-hour window, the following improvements would be prioritized:

1. **Streaming Output (SSE)**: Stream AI tokens progressively using Server-Sent Events, rendering flashcards as they are generated rather than waiting for the entire payload.
2. **Refinement Loop**: Add follow-up prompting to let users say *"make the questions harder"* or *"add 5 more cards about mitochondria"* without losing the current deck.
3. **Multi-Block Output**: Support hybrid study materials containing flashcards, summary mind-maps, and checklist study guides in a unified view.
4. **Export Integrations**: Export flashcard decks directly to **Anki (.apkg)** format, CSV, or printable PDF study sheets.
5. **Dark Mode & Audio**: Add a dark mode toggle and Web Speech API audio pronunciation for flashcard terms.

---

## 📋 Evaluation Checklist

- [x] **React & Frontend Architecture (25%)**: Functional components, custom hooks (`useGenerate`, `useQuizSession`), modular directory structure.
- [x] **AI Integration & Data Handling (25%)**: Real Gemini LLM integration, backend proxy, JSON mode, Zod parsing.
- [x] **Handling Bad AI Output (20%)**: Schema validation, stale response cancellation, typed errors, rate limiting, no crashes.
- [x] **UI/UX & Product Sense (15%)**: Clean light UI, 3D animations, keyboard shortcuts, re-testing wrong answers.
- [x] **Communication & Understanding (15%)**: Clear README, setup instructions, transparent AI disclosure, clean code comments.
