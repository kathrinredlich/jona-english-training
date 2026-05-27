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

export type FillBlankItem = {
  prompt: string;
  answer: string;
  choices: string[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  words: Word[];
  quiz: QuizItem[];
  fillBlank: FillBlankItem[];
  spellingWordIds: string[];
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

export type AppSettings = {
  showGermanHints: boolean;
  soundEnabled: boolean;
};

export type LessonSession = {
  lessonId: string;
  screen: 'learn' | 'quiz' | 'spell' | 'fill';
  wordIndex: number;
  quizIndex: number;
  quizScore: number;
  spellIndex: number;
  fillIndex: number;
};
