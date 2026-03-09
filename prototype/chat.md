**Project: Literary Journey Machine — UI Prototype**

I'm building a web app that lets users explore novels one semantically-meaningful segment at a time. The backend uses PostgreSQL with a `novels` table and a `novel_segments` table. Each row in `novel_segments` includes: novel ID, text, an embedding vector, and a `metadata` JSON field containing: `mood`, `chapters`, `setting`, `characters`, and `themes`.

**Core experience:**
- Two entry points: (1) free-text search (will use vector similarity against embeddings), and (2) a selection of ~5 randomly chosen segments shown as opening lines only — the user picks one to begin reading
- One segment is read at a time, full-page focus
- After reading, the user clicks "Continue the journey" which reveals the novel title/author/mood and offers 3 next-segment options (also shown as opening lines), chosen by vector similarity
- A dot trail at the top tracks how many segments deep the user is

**Stack / prototype:**
- Built as a React `.jsx` artifact
- Uses `Playfair Display` serif font
- Dark warm-brown background (`#1c1a16`), cream text, amber accents, mood-specific colors per segment
- Two screens: `OpeningScreen` and `ReadingScreen`


The prototype uses hardcoded mock segments and a static `RELATED` map in place of real DB queries.