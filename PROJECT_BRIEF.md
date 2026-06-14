# Dead Today — Project Brief

> Consolidated from 6 fragmented Telegram topic threads (June 13–14, 2026).
> This is the single source of truth. Detailed specs live alongside in this build dir
> (PRD, Data Architecture, Design System, Wireframe Spec, BUILD_PLAN.md, Claude.md).

---

## What it is
A web app — **Dead Today** — that lets you explore Grateful Dead concerts from *this date in history*.
Pick a day, see every show the Dead played on that calendar date across 1965–1995, listen to the
recordings, read the setlist, and chat with an AI grounded in that show's data.

**MVP scope (disciplined):** anonymous, no auth, no database. Web-first.
Chrome extension is a deferred thin shell — built *after* web is green, not in parallel.

---

## Stack
- **Next.js 14** (14.2.33 — patched off the scaffold's vulnerable version)
- **TypeScript** — full type system: `Show`, `Track`, `Era`, `SourceType`, `Chat*`
- **Tailwind** — design tokens wired from the Design System
- **Data sources:** two Archive.org APIs (show search + track metadata) + an Anthropic Claude proxy for chat
- **Caching:** IndexedDB (TTL'd) for show/track data, localStorage for chat-limit logic
- **No backend DB** — all data fetched live + cached client-side

---

## Architecture (data spine)
- `lib/archive.ts` — Archive.org normalization, query builders, source/duration parsing
- `lib/setlist.ts` — the setlist parser (#1 project risk, see below)
- `LightningBolt` component — frozen SVG path, 3 variants, fill-only rules enforced in code
- **3 API proxy routes:**
  - `/api/shows?monthDay=MM-DD` — On This Day query (+ `?q=` for Browse search)
  - `/api/metadata/:id` — track listing w/ disc/track order + direct CDN stream URLs
  - `/api/chat` — SSE streaming Claude chat (stub mode now, flips live when key exists)

---

## DevOps setup (Todd's pipeline)
- **Local:** `npm run dev` — the working dev loop
- **Dev/Preview:** Vercel — every PR + `dev` branch gets an auto-deploy preview URL
- **Production:** Vercel ← `main` branch
- **Code:** GitHub repo `dead-today` (private)

**Sequencing:**
1. **Now:** GitHub repo + commit Phase 0 baseline → *then* Phase 1 agents on branches
2. **Phase 2:** merge → connect Vercel (prod + preview) → add `ANTHROPIC_API_KEY` as Vercel env var → chat flips stub→live

---

## Build plan (foundation-first, then parallelize)
Three agents can't see each other's files, so: build shared spine solo → unleash 3 agents → stitch + verify live.

- **Phase 0 — Foundation (solo): ✅ DONE & VERIFIED.** Scaffold, tokens, types, data layer, 3 proxy routes.
- **Phase 1 — Three agents in parallel (NOT STARTED):**
  - **Agent A · Discovery** — Today/On This Day + Browse + ShowCard/SourceBadge/StarRating
  - **Agent B · Listening** — audio player (mini + expanded) + Show Detail + setlist parser
  - **Agent C · Conversation** — streaming Claude chat + 20-msg limit + IndexedDB cache
- **Phase 2 — Integration (solo):** stitch, build, run live, verify vs 5 MVP success criteria, hand over URL + screenshots
- **Phase 3 — Extension:** deferred shell, post-web-green

---

## Status (as of June 14, 2026)

### ✅ Phase 0 — complete and verified against live data
- Committed: `800dd65` on `main` — "Phase 0 baseline", 29 files, full data spine
- `next build` clean, `tsc --noEmit` passes (exit 0), all 3 routes registered
- **Verified live against Archive.org:**
  - `/api/shows?monthDay=06-14` → 30 shows, normalized + rating-sorted ✓
  - `/api/metadata/:id` → 23 MP3 tracks w/ ordering + CDN stream URLs ✓
  - `/api/chat` → SSE streaming works (stub mode) ✓
  - Home renders 200, zero console errors ✓

### 🐛 Real spec bug caught in Phase 0 (don't let it resurface)
Data Architecture doc specified the On This Day query as `date:[*-MM-DD TO *-MM-DD]`.
That **wildcard-year syntax is invalid Solr** — Archive rejects it, returns zero results.
**Fix:** OR explicit `date:YYYY-MM-DD` across GD's active years (1965–1995). Documented inline.

### ⏳ Open items
1. **GitHub:** repo creation in progress — Todd creating `dead-today` (private). `gh` auth was the blocker.
   - **Auth approach (decided):** fine-grained PAT scoped to *only* the personal repo (keeps work repos out).
     Name `hermes-personal`, 90-day expiry, Contents + PR read/write. Wire per-repo via
     `git remote set-url origin https://<user>:<token>@github.com/<user>/dead-today.git` — no global helper.
2. **Phase 1 not started** — 3 feature agents on `feat/discovery`, `feat/listening`, `feat/chat`
3. **README** — Todd asked; lean shape agreed (what it does / how to run / data source). Draft when repo path is confirmed.

---

## Decisions locked
- **Web-first**, extension deferred — web is the linkable portfolio/brand artifact
- **Secrets:** never paste `ANTHROPIC_API_KEY` in chat. Use `.env.local` (gitignored) for build, Vercel env var for deploy. Chat runs stubbed-but-live-ready until the key exists.
- **Design discipline:** dark, minimal, one red accent (Stealie red `#C8102E`), frozen lightning bolt path. Restraint *is* the brand. Wordmark: Barlow Condensed.
- **Setlist parsing = #1 risk:** the `SET 1 / SET 2 / ENCORE` w/ `>` segue notation comes from Archive's *unstructured* `description` field — wildly inconsistent. Dedicated parser + graceful "setlist unavailable" fallback. Won't be 100% clean every show; that's Archive reality, not a build miss.

---

## Build location
`/home/tames914/dead-today-build/` on the virtual server (`144.202.91.225`).
Phase 0 was reachable at `http://144.202.91.225:8088` (plain HTTP, raw IP — fine for clicking around, not a public launch).
