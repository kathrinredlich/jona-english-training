import type { AppSettings } from '../types';

const STORAGE_KEY = 'jona-english-settings';

const defaults: AppSettings = {
  showGermanHints: true,
  soundEnabled: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
