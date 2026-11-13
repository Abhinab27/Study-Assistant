import type { FlashcardDeck, Quiz } from '../types';

const STORAGE_KEY = 'study_assistant_sessions';

export interface SavedSession {
  id: string;
  savedAt: string;
  mode: 'flashcards' | 'quiz';
  topic: string;
  data: FlashcardDeck | Quiz;
}

export function saveSession(session: Omit<SavedSession, 'id' | 'savedAt'>): void {
  try {
    const existing = getSessions();
    const newSession: SavedSession = {
      ...session,
      id: `session_${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    // Keep last 10 sessions
    const updated = [newSession, ...existing].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

export function getSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSession[]) : [];
  } catch {
    return [];
  }
}

export function clearSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
