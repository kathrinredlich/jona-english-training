# Product Requirements Document (PRD) — Jona's English Training

**Status:** Draft  
**Owner:** Family / parent builder  
**Last updated:** 2026-05-27  
**Canonical Notion:** [Jona's English Training](https://www.notion.so/36dda74ef045804a8c7ce8e814483804)

---

## 1. Document control

| Field | Value |
| --- | --- |
| Product name | Jona's English Training |
| Document type | PRD (Product Requirements Document) |
| Primary user | Jona — age 10, non-native English speaker (~2 years of school English) |
| Implementation repo | [github.com/kathrinredlich/jona-english-training](https://github.com/kathrinredlich/jona-english-training) — public app with **stubbed local content only** (no external APIs) |

---

## 2. Executive summary

Jona's English Training is a simple, kid-friendly web app for daily English practice at home. It focuses on vocabulary, short reading, and low-pressure quizzes suited to a fourth-grade learner who has had English in school for about two years.

The app runs entirely in the browser with bundled lessons and words—no sign-in, no paid APIs, and no network dependency after load—so practice works offline and stays private.

---

## 3. Problem statement

School English alone is often not enough for a child to build confidence speaking and reading. Jona needs short, repeatable practice that feels like a game, not homework, with clear feedback and visible progress.

---

## 4. Goals and non-goals

### 4.1 Goals

- Help Jona practice **high-frequency words** and simple sentences (~CEFR A1 toward A2).
- Provide **immediate feedback** (correct / try again) without harsh failure states.
- Track **streaks and completed lessons** locally so she can see improvement.
- Keep sessions **5–10 minutes** by default.
- Ship a **public, cloneable repo** parents or developers can extend without API keys.

### 4.2 Non-goals

- Speech recognition or pronunciation scoring (future; would need external services).
- Live tutoring, chat with strangers, or social features.
- Full curriculum alignment to a specific national syllabus.
- Accounts, cloud sync, or parental dashboards in v1.
- Translation engines or LLM calls in the browser.

---

## 5. Users and use cases

| Persona | Need | Success signal |
| --- | --- | --- |
| Jona (learner) | Practice words she might see in school texts | Completes one lesson most days without adult help |
| Parent | Safe, offline-capable tool; no accounts | Opens URL locally; no data leaves the device |

**Core use cases**

1. Pick a lesson topic (animals, school, food).
2. Learn 8–10 words with picture + example sentence (stub images/text).
3. Take a multiple-choice quiz on those words.
4. See score and earn a star; progress saved in browser storage.

---

## 6. Product requirements

### 6.1 MVP (Phase 1 — must ship first)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| MVP-1 | Lesson list | Home screen shows ≥ 3 topics from local JSON; each shows title, emoji, and completion badge |
| MVP-2 | Word cards | Tap-through cards: English word, simple definition, example sentence, stub illustration or emoji |
| MVP-3 | Quiz mode | 4-option multiple choice per word; gentle retry on wrong answer |
| MVP-4 | Session summary | End screen: score (e.g. 7/8), encouragement message, return to home |
| MVP-5 | Local progress | `localStorage` stores completed lessons and best score; survives refresh |
| MVP-6 | Stub content only | All lessons in `src/data/lessons.json`; **no fetch to third-party APIs** |
| MVP-7 | Kid-safe UX | Large tap targets, readable font (≥ 18px body), high contrast, no ads |

### 6.2 Backlog (Phase 2)

| ID | Feature | Acceptance criteria |
| --- | --- | --- |
| BL-1 | Daily streak | Calendar or flame icon increments when one lesson finished per calendar day |
| BL-2 | Spelling practice | Type the word (lenient compare: trim, case-insensitive) |
| BL-3 | Fill-in-the-blank sentences | Drop-down or word bank using lesson vocabulary only |
| BL-4 | Parent settings | Toggle German hints on definitions (optional L1 support) |
| BL-5 | Sound effects | Local audio files for correct/wrong (no streaming TTS API) |

---

## 7. Content model (stubbed)

```typescript
type Word = {
  id: string;
  english: string;
  hint?: string;
  definition: string;
  example: string;
  emoji: string;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  words: Word[];
  quiz: { wordId: string; prompt: string; choices: string[]; correctIndex: number }[];
  fillBlank: { prompt: string; answer: string; choices: string[] }[];
};
```

**Minimum content:** 3 lessons, 8 words each, quizzes pre-generated in JSON (no runtime random API).

**Tone:** Encouraging copy ("Nice try!", "You did it!"). Avoid negative scoring language.

---

## 8. UX and design notes

- **Palette:** Warm, calm (not infantile); avoid red for wrong answers—use amber + retry.
- **Navigation:** Home → Learn → Quiz → Spelling → Fill-in-the-blank → Results.
- **Accessibility:** Keyboard optional; focus visible on buttons.
- **Language:** UI chrome in English; optional German hints behind BL-4.

---

## 9. Technical constraints

| Constraint | Rationale |
| --- | --- |
| No external APIs | Privacy, offline use, no keys |
| Static / Vite SPA | Fast to build and host on GitHub Pages if desired |
| Public repository | Shareable, forkable family project |
| Simple codebase | One parent can maintain; Cursor-friendly size |

**Suggested stack:** Vite + React + TypeScript. Modules: `src/lib/progress.ts`, `src/lib/settings.ts`, `src/lib/sounds.ts`.

---

## 10. Test plan

- [ ] Load app offline after first visit (cached assets).
- [ ] Complete lesson end-to-end; home shows completion badge.
- [ ] Refresh mid-quiz; progress not corrupted.
- [ ] Wrong answer allows retry without ending session.
- [ ] All quiz choices come from lesson word list (no nonsense options).
- [ ] Text readable at arm's length on a laptop tablet.

---

## 11. Success metrics

| Metric | Target (first month) |
| --- | --- |
| Sessions per week | ≥ 3 short sessions |
| Lesson completion rate | ≥ 80% of started lessons finished |
| Parent setup time | < 10 minutes clone + run |

---

## 12. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Content too hard | Start A1 word list; parent edits JSON |
| Child boredom | Short lessons; stars and streaks in Phase 2 |
| Scope creep (TTS, AI) | Explicit non-goals in PRD |

---

## 13. Open questions

- Should definitions allow optional German hints in MVP or only Phase 2?
- Preferred session length cap (8 vs 10 words per lesson)?
- Deploy target: local only vs GitHub Pages for tablet bookmark?

---

## 14. Original intent (preserved)

> I want to build an app for my 10 years old daughter to practice English. She is not a native speaker and only got English in school for the last two years.

**Next step:** Try one lesson with Jona and adjust `lessons.json` difficulty based on her feedback.
