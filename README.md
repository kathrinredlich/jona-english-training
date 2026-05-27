# Jona’s English Training

A simple English practice app for a young learner (~2 years of school English). Built from the Notion PRD with **local lesson data only**—no external APIs.

- **PRD (local):** [prd.md](./prd.md)
- **PRD (Notion):** [Jona’s English Training](https://www.notion.so/36dda74ef045804a8c7ce8e814483804)

## Quick start

```bash
npm install
npm run dev
```

## Features

- 3 lessons (Animals, At school, Food & snacks) with 8 words each
- Tap-through word cards with optional German hints (saved in settings)
- Multiple-choice quiz, spelling practice, and fill-in-the-blank sentences
- Gentle retry on wrong answers; optional sound effects (Web Audio, no external APIs)
- Progress, practice-day streak, and mid-lesson resume via `sessionStorage`

## Content

Edit lessons in `src/data/lessons.json`. No network calls are made at runtime.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## License

MIT
