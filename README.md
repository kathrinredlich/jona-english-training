# Jona’s English Training

A simple English practice app for a young learner (~2 years of school English). Built from the Notion PRD with **local lesson data only**—no external APIs.

- **PRD:** [Jona’s English Training (Notion)](https://www.notion.so/36dda74ef045804a8c7ce8e814483804)

## Quick start

```bash
npm install
npm run dev
```

## Features (MVP)

- 3 lessons (Animals, At school, Food & snacks) with 8 words each
- Tap-through word cards with optional German hints
- Multiple-choice quiz with gentle retry on wrong answers
- Progress and practice-day streak in `localStorage`

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
