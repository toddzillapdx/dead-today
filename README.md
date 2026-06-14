# Dead Today ⚡

Explore Grateful Dead concerts from *this day in history*. Pick a date, see every
show the Dead played on that calendar day (1965–1995), stream the recordings, read
the setlist, and chat with an AI grounded in that show's data.

Built on the Internet Archive's live audience and soundboard recordings — no database,
no auth, no account. Just the music.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
```

## Configuration

Chat runs in **stub mode** out of the box (canned streamed responses) so the whole
UI is testable with zero setup. To enable live Claude chat, copy the example env and
add your key:

```bash
cp .env.example .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

`.env.local` is gitignored — never commit secrets. In production, set these as Vercel
environment variables.

## Data sources

- **[Archive.org Advanced Search](https://archive.org/advancedsearch.php)** — finds shows by date (`/api/shows`)
- **[Archive.org Metadata API](https://archive.org/developers/md-read.html)** — track listings + direct CDN stream URLs (`/api/metadata/:id`)
- **[Anthropic Claude](https://docs.anthropic.com/)** — concert chat, proxied server-side (`/api/chat`)

Show and track data is cached client-side in IndexedDB; chat usage limits in localStorage.

> **Setlist note:** setlists are parsed from Archive's free-text `description` field,
> which is inconsistent show to show. Where a clean setlist can't be parsed, the UI
> falls back gracefully to "setlist unavailable." That's an Archive data reality, not a bug.

## Tech stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS

## Project layout

```
app/
  page.tsx                       # home
  layout.tsx, globals.css        # shell + design tokens
  api/shows/                     # On This Day + Browse search
  api/metadata/[identifier]/     # track metadata + stream URLs
  api/chat/                      # SSE Claude proxy (stub-aware)
lib/
  archive.ts                     # Archive.org normalization + query builders
  setlist.ts                     # setlist parser (+ graceful fallback)
  cache.ts, chatLimit.ts         # IndexedDB cache + chat-limit logic
  era.ts, prompt.ts, types.ts    # eras, chat system prompt, shared types
components/
  LightningBolt.tsx              # the bolt — frozen path, fill-only
```

## Status

**Phase 0 (foundation): complete and verified against live Archive.org data.**
Data spine, design tokens, types, and all three API routes are working. Feature
UI (Discovery / Listening / Conversation) is in active development.

---

*Not affiliated with the Grateful Dead. Built with respect for the music and the
tapers who preserved it. ⚡💀🌹*
