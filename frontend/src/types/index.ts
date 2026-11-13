// Shared TypeScript types for the Study Assistant app

export type Mode = 'flashcards' | 'quiz';

// ── Flashcard types ───────────────────────────────────────────────────────────

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export interface FlashcardDeck {
  title: string;
  summary: string;
  flashcards: Flashcard[];
}

// ── Quiz types ────────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

// ── App state types ───────────────────────────────────────────────────────────

export type AppStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export interface AppError {
  type: 'network' | 'rate_limit' | 'validation' | 'server' | 'unknown';
  message: string;
}

export interface GenerateResult {
  mode: Mode;
  data: FlashcardDeck | Quiz;
}

// ── Quiz session types ────────────────────────────────────────────────────────

export type QuizPhase = 'answering' | 'review' | 'retest' | 'complete';

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}
