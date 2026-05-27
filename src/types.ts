export type Word = {
  id: string;
  english: string;
  hint?: string;
  definition: string;
  example: string;
  emoji: string;
};

export type QuizItem = {
  wordId: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  words: Word[];
  quiz: QuizItem[];
};

export type LessonProgress = {
  completed: boolean;
  bestScore: number;
  lastScore: number;
};

export type AppProgress = {
  lessons: Record<string, LessonProgress>;
  streakDays: string[];
};
