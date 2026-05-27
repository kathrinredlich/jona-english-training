import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { getLesson, getSpellingWords, loadLessons } from './lib/lessons';
import {
  getLessonProgress,
  loadProgress,
  recordLessonComplete,
  streakCount,
} from './lib/progress';
import { clearSession, loadSession, saveSession } from './lib/session';
import { loadSettings, saveSettings } from './lib/settings';
import { playCorrect, playTryAgain } from './lib/sounds';
import type { AppSettings, Word } from './types';

type Screen = 'home' | 'learn' | 'quiz' | 'spell' | 'fill' | 'results';

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

function App() {
  const lessons = useMemo(() => loadLessons(), []);
  const [progress, setProgress] = useState(loadProgress);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [screen, setScreen] = useState<Screen>('home');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellInput, setSpellInput] = useState('');
  const [fillIndex, setFillIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const spellingWords = lesson ? getSpellingWords(lesson) : [];
  const streak = streakCount(progress);

  const persistSession = (
    nextScreen: Screen,
    patch: Partial<{
      wordIndex: number;
      quizIndex: number;
      quizScore: number;
      spellIndex: number;
      fillIndex: number;
    }> = {},
  ) => {
    if (!lessonId || nextScreen === 'home' || nextScreen === 'results') return;
    if (nextScreen === 'learn' || nextScreen === 'quiz' || nextScreen === 'spell' || nextScreen === 'fill') {
      saveSession({
        lessonId,
        screen: nextScreen,
        wordIndex: patch.wordIndex ?? wordIndex,
        quizIndex: patch.quizIndex ?? quizIndex,
        quizScore: patch.quizScore ?? quizScore,
        spellIndex: patch.spellIndex ?? spellIndex,
        fillIndex: patch.fillIndex ?? fillIndex,
      });
    }
  };

  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    const restored = getLesson(saved.lessonId);
    if (!restored) return;
    setLessonId(saved.lessonId);
    setWordIndex(saved.wordIndex);
    setQuizIndex(saved.quizIndex);
    setQuizScore(saved.quizScore);
    setSpellIndex(saved.spellIndex);
    setFillIndex(saved.fillIndex);
    setScreen(saved.screen);
  }, []);

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  const feedbackSound = (ok: boolean) => {
    if (!settings.soundEnabled) return;
    if (ok) playCorrect();
    else playTryAgain();
  };

  const startLesson = (id: string) => {
    clearSession();
    setLessonId(id);
    setWordIndex(0);
    setQuizIndex(0);
    setQuizScore(0);
    setSpellIndex(0);
    setSpellInput('');
    setFillIndex(0);
    setFeedback(null);
    setScreen('learn');
    saveSession({
      lessonId: id,
      screen: 'learn',
      wordIndex: 0,
      quizIndex: 0,
      quizScore: 0,
      spellIndex: 0,
      fillIndex: 0,
    });
  };

  const goHome = () => {
    clearSession();
    setScreen('home');
    setLessonId(null);
    setFeedback(null);
  };

  const finishLesson = (finalScore: number) => {
    if (!lesson) return;
    clearSession();
    setProgress(recordLessonComplete(progress, lesson.id, finalScore, lesson.quiz.length));
    setScreen('results');
  };

  const handleQuizAnswer = (index: number) => {
    if (!lesson) return;
    const item = lesson.quiz[quizIndex];
    if (index === item.correctIndex) {
      feedbackSound(true);
      const nextScore = quizScore + 1;
      if (quizIndex + 1 >= lesson.quiz.length) {
        setQuizScore(nextScore);
        setSpellIndex(0);
        setSpellInput('');
        setScreen('spell');
        persistSession('spell', { quizScore: nextScore, spellIndex: 0 });
        setFeedback(null);
      } else {
        setQuizScore(nextScore);
        const nextQuiz = quizIndex + 1;
        setQuizIndex(nextQuiz);
        persistSession('quiz', { quizScore: nextScore, quizIndex: nextQuiz });
        setFeedback('Great job! ⭐');
        setTimeout(() => setFeedback(null), 700);
      }
    } else {
      feedbackSound(false);
      setFeedback('Nice try — pick another answer!');
    }
  };

  const handleSpellSubmit = () => {
    if (!lesson) return;
    const word = spellingWords[spellIndex];
    if (!word) return;
    if (normalizeAnswer(spellInput) === normalizeAnswer(word.english)) {
      feedbackSound(true);
      if (spellIndex + 1 >= spellingWords.length) {
        setFillIndex(0);
        setScreen('fill');
        persistSession('fill', { fillIndex: 0 });
        setFeedback(null);
        setSpellInput('');
      } else {
        const next = spellIndex + 1;
        setSpellIndex(next);
        setSpellInput('');
        persistSession('spell', { spellIndex: next });
        setFeedback('Great spelling! ⭐');
        setTimeout(() => setFeedback(null), 600);
      }
    } else {
      feedbackSound(false);
      setFeedback('Nice try — check the letters and try again!');
    }
  };

  const handleFillSelect = (choice: string) => {
    if (!lesson) return;
    const item = lesson.fillBlank[fillIndex];
    if (choice === item.answer) {
      feedbackSound(true);
      if (fillIndex + 1 >= lesson.fillBlank.length) {
        finishLesson(quizScore);
      } else {
        const next = fillIndex + 1;
        setFillIndex(next);
        persistSession('fill', { fillIndex: next });
        setFeedback('Great job! ⭐');
        setTimeout(() => setFeedback(null), 600);
      }
    } else {
      feedbackSound(false);
      setFeedback('Nice try — pick another word!');
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
          <div className="settings">
            <label className="hint-toggle">
              <input
                type="checkbox"
                checked={settings.showGermanHints}
                onChange={(e) => updateSettings({ showGermanHints: e.target.checked })}
              />
              Show German hints
            </label>
            <label className="hint-toggle">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              />
              Sound effects
            </label>
          </div>
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
          {settings.showGermanHints && word.hint && (
            <p className="hint">({word.hint})</p>
          )}
          <p className="definition">{word.definition}</p>
          <p className="example">“{word.example}”</p>
        </article>
        <div className="actions">
          {wordIndex > 0 && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                const prev = wordIndex - 1;
                setWordIndex(prev);
                persistSession('learn', { wordIndex: prev });
              }}
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
                setQuizScore(0);
                setScreen('quiz');
                persistSession('quiz', { wordIndex, quizIndex: 0, quizScore: 0 });
              } else {
                const next = wordIndex + 1;
                setWordIndex(next);
                persistSession('learn', { wordIndex: next });
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
            Question {quizIndex + 1} of {lesson.quiz.length} · Score {quizScore}
          </p>
        </header>
        <p className="quiz-prompt">{item.prompt}</p>
        {feedback && (
          <p className="feedback" role="status">
            {feedback}
          </p>
        )}
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

  if (screen === 'spell') {
    const word = spellingWords[spellIndex];
    return (
      <div className="app">
        <header className="top-bar">
          <button type="button" className="back" onClick={() => setScreen('quiz')}>
            ← Quiz
          </button>
          <h2>Spelling practice</h2>
          <p className="step">
            Word {spellIndex + 1} of {spellingWords.length}
          </p>
        </header>
        <p className="quiz-prompt">{word.definition}</p>
        <p className="spell-emoji" aria-hidden="true">
          {word.emoji}
        </p>
        <label className="spell-label" htmlFor="spell-input">
          Type the English word
        </label>
        <input
          id="spell-input"
          className="spell-input"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          value={spellInput}
          onChange={(e) => setSpellInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSpellSubmit();
          }}
        />
        {feedback && (
          <p className="feedback" role="status">
            {feedback}
          </p>
        )}
        <button type="button" className="primary spell-submit" onClick={handleSpellSubmit}>
          Check spelling
        </button>
      </div>
    );
  }

  if (screen === 'fill') {
    const item = lesson.fillBlank[fillIndex];
    return (
      <div className="app">
        <header className="top-bar">
          <button type="button" className="back" onClick={() => setScreen('spell')}>
            ← Spelling
          </button>
          <h2>Complete the sentence</h2>
          <p className="step">
            Sentence {fillIndex + 1} of {lesson.fillBlank.length}
          </p>
        </header>
        <p className="quiz-prompt fill-prompt">{item.prompt}</p>
        {feedback && (
          <p className="feedback" role="status">
            {feedback}
          </p>
        )}
        <div className="quiz-options">
          {item.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className="quiz-option"
              onClick={() => handleFillSelect(choice)}
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
          {quizScore >= lesson.quiz.length - 1 ? '🎉' : '🌟'}
        </p>
        <h2>You did it!</h2>
        <p className="score-line">
          Quiz: {quizScore} out of {lesson.quiz.length} correct
        </p>
        <p className="encourage">
          {quizScore === lesson.quiz.length
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
