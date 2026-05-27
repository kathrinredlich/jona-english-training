import { useMemo, useState } from 'react';
import './App.css';
import { getLesson, loadLessons } from './lib/lessons';
import {
  getLessonProgress,
  loadProgress,
  recordLessonComplete,
  streakCount,
} from './lib/progress';
import type { Word } from './types';

type Screen = 'home' | 'learn' | 'quiz' | 'results';

function App() {
  const lessons = useMemo(() => loadLessons(), []);
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState<Screen>('home');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const streak = streakCount(progress);

  const startLesson = (id: string) => {
    setLessonId(id);
    setWordIndex(0);
    setQuizIndex(0);
    setScore(0);
    setFeedback(null);
    setScreen('learn');
  };

  const goHome = () => {
    setScreen('home');
    setLessonId(null);
    setFeedback(null);
  };

  const finishQuiz = (finalScore: number) => {
    if (!lesson) return;
    setScore(finalScore);
    setProgress(recordLessonComplete(progress, lesson.id, finalScore, lesson.quiz.length));
    setScreen('results');
  };

  const handleQuizAnswer = (index: number) => {
    if (!lesson) return;
    const item = lesson.quiz[quizIndex];
    if (index === item.correctIndex) {
      const nextScore = score + 1;
      if (quizIndex + 1 >= lesson.quiz.length) {
        finishQuiz(nextScore);
      } else {
        setScore(nextScore);
        setQuizIndex((i) => i + 1);
        setFeedback('Great job! ⭐');
        setTimeout(() => setFeedback(null), 700);
      }
    } else {
      setFeedback('Nice try — pick another answer!');
    }
  };

  if (screen === 'home') {
    return (
      <div className="app">
        <header className="hero">
          <p className="eyebrow">Practice English</p>
          <h1>Jona’s English Training</h1>
          <p className="subtitle">Short lessons, friendly quizzes, no internet needed after load.</p>
          {streak > 0 && (
            <p className="streak" aria-label={`${streak} practice days logged`}>
              🔥 {streak} day{streak === 1 ? '' : 's'} practiced
            </p>
          )}
          <label className="hint-toggle">
            <input
              type="checkbox"
              checked={showHints}
              onChange={(e) => setShowHints(e.target.checked)}
            />
            Show German hints
          </label>
        </header>
        <section className="lesson-grid" aria-label="Lessons">
          {lessons.map((l) => {
            const lp = getLessonProgress(progress, l.id);
            return (
              <button
                key={l.id}
                type="button"
                className="lesson-card"
                onClick={() => startLesson(l.id)}
              >
                <span className="lesson-emoji" aria-hidden="true">
                  {l.emoji}
                </span>
                <span className="lesson-title">{l.title}</span>
                <span className="lesson-desc">{l.description}</span>
                {lp?.completed && (
                  <span className="badge">★ Best {lp.bestScore}/{l.quiz.length}</span>
                )}
              </button>
            );
          })}
        </section>
        <footer className="footer">
          <p>Stub lessons only · Progress saved on this device</p>
        </footer>
      </div>
    );
  }

  if (!lesson) return null;

  if (screen === 'learn') {
    const word: Word = lesson.words[wordIndex];
    const isLast = wordIndex + 1 >= lesson.words.length;
    return (
      <div className="app">
        <header className="top-bar">
          <button type="button" className="back" onClick={goHome}>
            ← Home
          </button>
          <h2>
            {lesson.emoji} {lesson.title}
          </h2>
          <p className="step">
            Word {wordIndex + 1} of {lesson.words.length}
          </p>
        </header>
        <article className="word-card">
          <div className="word-emoji" aria-hidden="true">
            {word.emoji}
          </div>
          <h3>{word.english}</h3>
          {showHints && word.hint && <p className="hint">({word.hint})</p>}
          <p className="definition">{word.definition}</p>
          <p className="example">“{word.example}”</p>
        </article>
        <div className="actions">
          {wordIndex > 0 && (
            <button
              type="button"
              className="secondary"
              onClick={() => setWordIndex((i) => i - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (isLast) {
                setQuizIndex(0);
                setScore(0);
                setScreen('quiz');
              } else {
                setWordIndex((i) => i + 1);
              }
            }}
          >
            {isLast ? 'Start quiz' : 'Next word'}
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'quiz') {
    const item = lesson.quiz[quizIndex];
    return (
      <div className="app">
        <header className="top-bar">
          <button type="button" className="back" onClick={() => setScreen('learn')}>
            ← Words
          </button>
          <h2>Quiz time</h2>
          <p className="step">
            Question {quizIndex + 1} of {lesson.quiz.length} · Score {score}
          </p>
        </header>
        <p className="quiz-prompt">{item.prompt}</p>
        {feedback && <p className="feedback" role="status">{feedback}</p>}
        <div className="quiz-options">
          {item.choices.map((choice, index) => (
            <button
              key={choice}
              type="button"
              className="quiz-option"
              onClick={() => handleQuizAnswer(index)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app results">
      <div className="results-card">
        <p className="big-emoji" aria-hidden="true">
          {score >= lesson.quiz.length - 1 ? '🎉' : '🌟'}
        </p>
        <h2>You did it!</h2>
        <p className="score-line">
          {score} out of {lesson.quiz.length} correct
        </p>
        <p className="encourage">
          {score === lesson.quiz.length
            ? 'Perfect round! Come back tomorrow for another lesson.'
            : 'Keep going — practice makes it easier.'}
        </p>
        <button type="button" className="primary" onClick={goHome}>
          Choose another lesson
        </button>
      </div>
    </div>
  );
}

export default App;
