import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
  hint: z.string().optional(),
});

const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(QuizOptionSchema).min(2).max(5),
  correctOptionId: z.string(),
  explanation: z.string().min(1),
});

const FlashcardResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  flashcards: z.array(FlashcardSchema).min(1).max(20),
});

const QuizResponseSchema = z.object({
  title: z.string(),
  questions: z.array(QuizQuestionSchema).min(1).max(15),
});

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildFlashcardPrompt(topic, notes) {
  const content = notes
    ? `Topic: ${topic}\n\nNotes:\n${notes}`
    : `Topic: ${topic}`;

  return `You are a study tool. Generate educational flashcards from the content below.

${content}

Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:
{
  "title": "Deck title (5 words max)",
  "summary": "1-2 sentence overview of what this covers",
  "flashcards": [
    {
      "id": "fc_1",
      "front": "Concise question or concept (max 20 words)",
      "back": "Clear, complete answer (max 60 words)",
      "hint": "Optional subtle hint (max 10 words, omit if not useful)"
    }
  ]
}

Rules:
- Generate 6–10 flashcards covering the key ideas
- Each card should test ONE concept
- Front should be a question or incomplete statement
- Back must be a standalone answer (readable without the front)
- Omit the "hint" field if not helpful`;
}

function buildQuizPrompt(topic, notes) {
  const content = notes
    ? `Topic: ${topic}\n\nNotes:\n${notes}`
    : `Topic: ${topic}`;

  return `You are a study tool. Generate a multiple-choice quiz from the content below.

${content}

Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:
{
  "title": "Quiz title (5 words max)",
  "questions": [
    {
      "id": "q_1",
      "question": "Clear question text",
      "options": [
        { "id": "o_a", "text": "Option A text" },
        { "id": "o_b", "text": "Option B text" },
        { "id": "o_c", "text": "Option C text" },
        { "id": "o_d", "text": "Option D text" }
      ],
      "correctOptionId": "o_a",
      "explanation": "Why this answer is correct (1-2 sentences)"
    }
  ]
}

Rules:
- Generate 5–8 questions
- Each question must have exactly 4 options
- Distractors must be plausible (not obviously wrong)
- correctOptionId must exactly match one of the option id values
- Explanation must address why the correct answer is right`;
}

// ── Gemini service ────────────────────────────────────────────────────────────

let genAI = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

function stripJsonFences(text) {
  // Handle ```json ... ``` or ``` ... ``` wrappers from the model
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

async function callGemini(prompt) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleaned = stripJsonFences(rawText);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Model returned invalid JSON. Raw response: ${rawText.slice(0, 200)}`);
  }

  return parsed;
}

// ── Exported service functions ────────────────────────────────────────────────

export async function generateFlashcards(topic, notes) {
  const prompt = buildFlashcardPrompt(topic, notes);
  const raw = await callGemini(prompt);
  const result = FlashcardResponseSchema.safeParse(raw);

  if (!result.success) {
    console.error('Flashcard schema validation failed:', result.error.flatten());
    throw new Error('The AI returned an unexpected response format. Please try again.');
  }

  return result.data;
}

export async function generateQuiz(topic, notes) {
  const prompt = buildQuizPrompt(topic, notes);
  const raw = await callGemini(prompt);
  const result = QuizResponseSchema.safeParse(raw);

  if (!result.success) {
    console.error('Quiz schema validation failed:', result.error.flatten());
    throw new Error('The AI returned an unexpected response format. Please try again.');
  }

  return result.data;
}
