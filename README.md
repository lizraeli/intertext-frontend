# Intertext Frontend

A literary exploration app built with React, TypeScript, and Vite. The app allows to browse novels, read segments, explore similar passages via embedding similarity, and listen to narrated audio with word-level highlighting.

## Setup

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

### Environment

Create a `.env` file (optional):

- `VITE_API_URL` — backend API base URL (defaults to `http://localhost:8000`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page with novel listing and personal reading shelf |
| `/explore` | OpeningScreen | Random segment previews with mood-colored cards |
| `/novel/:id` | NovelScreen | Chapter listing for a novel |
| `/segment/:id` | ReadingScreen | Full segment reading view with navigation, audio narration, and similar passages |

## Audio Narration

When a segment has audio data from the backend, the ReadingScreen displays a play/pause button in the top bar. During playback, the currently spoken word is highlighted with a warm amber background that fades out smoothly as narration advances.

Key pieces:
- `useAudioPlayer` hook — manages audio playback state, buffering, and time tracking via `requestAnimationFrame`
- `NarratedText` component — renders markdown with word-level `<span>` wrappers, using `ActiveWordContext` so that only the active word re-renders (preserving CSS transitions)
- `splitTimingsByParagraph` — converts segment-level word timings to per-paragraph offsets

## Project Structure

```
src/
  api/              API client (segments, novels)
  components/       Shared UI (GrainOverlay, LoadingIndicator)
  hooks/            Custom hooks (useAudioPlayer)
  pages/            Route screens, each with co-located CSS module
    HomePage/
    OpeningScreen/
    NovelScreen/
    ReadingScreen/
      components/     TopBar, NovelInfoBadge, NarratedText, etc.
  shelf/            Local storage reading shelf persistence
  types/            TypeScript interfaces (segments, novels)
  utils/            Mood colors
```

## Stack

- **React**, **TypeScript**, **Vite**
- **React Router 7** for client-side routing
- **react-markdown** for rendering segment content
- **CSS Modules** for scoped styling
- **Vitest**, **Testing Library** for tests
