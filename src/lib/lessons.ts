import rawLessons from '../data/lessons.json';
import type { Lesson, Word } from '../types';

export function loadLessons(): Lesson[] {
  return rawLessons as Lesson[];
}

export function getLesson(id: string): Lesson | undefined {
  return loadLessons().find((l) => l.id === id);
}

export function getSpellingWords(lesson: Lesson): Word[] {
  return lesson.spellingWordIds
    .map((id) => lesson.words.find((w) => w.id === id))
    .filter((w): w is Word => Boolean(w));
}
