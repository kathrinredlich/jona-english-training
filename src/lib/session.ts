import type { LessonSession } from '../types';

const STORAGE_KEY = 'jona-english-session';

export function loadSession(): LessonSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LessonSession;
  } catch {
    return null;
  }
}

export function saveSession(session: LessonSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
