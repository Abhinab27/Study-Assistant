const STORAGE_KEY = 'study_assistant_sessions';

export function saveSession(session) {
  try {
    const existing = getSessions();
    const newSession = {
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

export function getSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearSessions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
