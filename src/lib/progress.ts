import type { AppProgress, LessonProgress } from '../types';

const STORAGE_KEY = 'jona-english-progress';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {}, streakDays: [] };
    return JSON.parse(raw) as AppProgress;
  } catch {
    return { lessons: {}, streakDays: [] };
  }
}

export function saveProgress(progress: AppProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getLessonProgress(
  progress: AppProgress,
  lessonId: string,
): LessonProgress | undefined {
  return progress.lessons[lessonId];
}

export function recordLessonComplete(
  progress: AppProgress,
  lessonId: string,
  score: number,
  _total: number,
): AppProgress {
  const prev = progress.lessons[lessonId];
  const next: AppProgress = {
    ...progress,
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        completed: true,
        lastScore: score,
        bestScore: Math.max(prev?.bestScore ?? 0, score),
      },
    },
    streakDays: [...progress.streakDays],
  };
  const day = todayKey();
  if (!next.streakDays.includes(day)) {
    next.streakDays = [...next.streakDays, day].sort();
  }
  saveProgress(next);
  return next;
}

export function streakCount(progress: AppProgress): number {
  return progress.streakDays.length;
}
