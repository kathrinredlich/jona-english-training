import rawLessons from '../data/lessons.json';
import type { Lesson } from '../types';

export function loadLessons(): Lesson[] {
  return rawLessons as Lesson[];
}

export function getLesson(id: string): Lesson | undefined {
  return loadLessons().find((l) => l.id === id);
}
