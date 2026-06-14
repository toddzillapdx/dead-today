# Dead Today

AI-powered Grateful Dead concert discovery app.
Chrome extension + Next.js web app. MVP is anonymous — no auth, no database.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- Vercel (deployment)

## Key constraints
- No auth in MVP. No Supabase. No login flows.
- Claude API always via /api/chat proxy — never client-side
- Archive.org APIs via /api/shows and /api/metadata proxies
- MP3 audio streams directly from Archive.org CDN — we never proxy audio
- Chat limit: 20 messages/day enforced via localStorage only

## Docs
Full PRD, data architecture, wireframe spec, and design system are in /docs.
Read them before making structural decisions.

## Logo
The exact lightning bolt SVG is at /public/icons/lightning_bolt.svg.
viewBox="0 0 388 441". Never modify the path. Only change fill color.

## Design tokens
See /docs/Design_System.docx. Key values:
--dt-black: #1A1A1A  --dt-red: #C8102E  --dt-bone: #F5F0E8
Font display: Barlow Condensed. Font UI: Inter.