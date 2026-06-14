# Dead Today — Build & Design Plan
**Owner:** Maia · **For:** Todd Ames · **Date:** June 2026 · **Source:** PRD v0.1, Data Architecture v0.1, Design System v0.2, Wireframe Spec v0.1

---

## 0. Decisions baked in (override anytime)

| Decision | Call | Rationale |
|---|---|---|
| **Surface order** | **Web app first**, extension second | The web app is the linkable portfolio artifact. Extension is a thin shell on proven components — add once Phase 1 is green. |
| **Chat key** | Build live if `ANTHROPIC_API_KEY` provided; else stub with a feature flag | Stub returns canned streamed text so UI is fully testable; flip the env var at deploy for real Claude. |
| **Stale `.next/`** | Delete | No real source exists — clean-slate scaffold. |
| **Logo fill** | Drive via `currentColor`/prop | Spec default is Stealie red `#C8102E`; SVG on disk is `black`. Component owns color. |

---

## 1. Target architecture

```
dead-today/
├─ app/
│  ├─ layout.tsx              # root, fonts, tokens, dark-only
│  ├─ page.tsx                # Today (default route)
│  ├─ browse/page.tsx
│  ├─ show/[identifier]/page.tsx
│  └─ api/
│     ├─ shows/route.ts       # GET — Archive Advanced Search proxy
│     ├─ metadata/[identifier]/route.ts  # GET — Archive Metadata proxy
│     └─ chat/route.ts        # POST — Claude proxy, SSE stream
├─ components/                # 14 components from spec inventory
├─ lib/
│  ├─ archive.ts              # normalization: Show / Track
│  ├─ setlist.ts              # description → SET 1/2/ENCORE + segues
│  ├─ era.ts                  # date → Era enum
│  ├─ cache.ts                # IndexedDB (shows/tracks/vibeBlurbs)
│  ├─ chatLimit.ts            # localStorage 20/day guardrail
│  └─ types.ts               # Show, Track, Era, SourceType, Chat*
├─ styles/globals.css         # :root design tokens
└─ public/icons/lightning_bolt.svg
```

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Tabler Icons (webfont) · Barlow Condensed + Inter (Google Fonts) · deploy Vercel.

**Data spine (from arch doc, no changes):**
- `GET /api/shows?monthDay=MM-DD` → Archive Advanced Search → normalized `Show[]` sorted by `avg_rating desc`
- `GET /api/metadata/:identifier` → Archive Metadata → `Track[]` (MP3-only, sorted disc+track)
- `POST /api/chat` → Claude `claude-sonnet-4` via proxy, SSE stream, key server-side only
- MP3 streams **direct from Archive.org CDN** — we never proxy audio bytes
- Cache: IndexedDB (shows 24h / tracks 7d / vibeBlurbs 30d) + localStorage (chat count)

---

## 2. Design implementation plan

**Foundation (tokens → everything inherits):**
- All CSS custom properties from Design System §9 into `:root` (`--dt-black`, `--dt-red`, `--dt-bone`, source-badge colors, radii, spacing).
- Tailwind config maps tokens to utility classes so components never hardcode hex.
- Fonts: Barlow Condensed (display) + Inter (UI) + mono for numerals (durations, `14/20` count) to prevent layout shift.

**Logo system:** single `<LightningBolt fill?>` component wrapping the exact path (viewBox `0 0 388 441`, coordinates frozen). Variants: app-icon (rounded rect), wordmark lockup, circle lockup, standalone, monochrome. **Rules enforced in code:** fill-only, no stroke, no transform.

**Aesthetic guardrails:** dark-first, void black surfaces, bone-white type, single Stealie-red accent. No tie-dye, no rainbow, no psychedelic chrome. "Serious tool for serious fans."

**Component fidelity:** every component built to the §6 specs — ShowCard (10px radius, vibe blurb with 2px red left-border), MiniPlayer (56px, 3px seek bar), Chat (user = red bubble `10/10/2/10`, AI = bubble-less plain text), source badges color-coded per type.

**Motion:** sparse. Seek bar is the one live element. Skeletons pulse 1.4s. Everything respects `prefers-reduced-motion`.

---

## 3. Phasing & agent workstreams

### Phase 0 — Foundation *(Maia, sequential — the shared spine)*
Scaffold, tokens, Tailwind, `LightningBolt`, `lib/types.ts`, `lib/archive.ts` + `era.ts`, three API proxy routes (real Archive calls, chat stub-or-live), IndexedDB + chatLimit utilities. **Gate:** `npm run build` clean, `/api/shows?monthDay=05-08` returns real normalized Cornell data.

### Phase 1 — Features *(3 agents in parallel against the spine)*
- **Agent A — Discovery:** Today/On This Day (auto-load, sort, featured card, vibe blurb lazy-load, nearest-date empty state) · Browse (search debounce 400ms, era/year filters, load-more) · `ShowCard`, `SourceBadge`, `StarRating`, `SkeletonCard`, `EmptyState`.
- **Agent B — Listening:** `lib/setlist.ts` parser (the risk item) · Show Detail (set dividers, segue `>`, active-track highlight) · MiniPlayer + ExpandedPlayer + `TrackList` + `SetDivider` · audio continuity across tabs.
- **Agent C — Conversation:** `/api/chat` SSE wiring · `ChatInterface`, `ChatMessage`, `SuggestedPrompts`, `ContextBanner`, `MessageLimitBar` · system-prompt grounding from show context · 20/day limit (green→amber→red) · IndexedDB vibe-blurb cache integration.

### Phase 2 — Integration & verification *(Maia)*
Stitch, resolve shared-component seams, `npm run build`, run live, walk every screen + state, verify against the 5 MVP success criteria, capture screenshots, hand over running URL.

### Phase 3 — Extension *(deferred, post-web-green)*
React + Vite + Manifest V3 shell reusing the same components in the 400×580 popup. Known MV3 limitation noted: no background audio when popup closes.

---

## 4. Milestones / Definition of Done

**MVP is done when:**
1. Today tab loads relevant shows in <3s ✓
2. Audio streams Archive MP3s without buffering on a standard connection ✓
3. Chat answers show-specific + GD-history questions accurately and in-character ✓
4. App builds and runs with zero console errors ✓
5. A cold user completes a full session (open → pick show → play → chat) with no guidance ✓

Every screen renders its loading, empty, and error states per the wireframe spec.

---

## 5. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| **Setlist parsing** from unstructured Archive `description` | High | Dedicated `setlist.ts` parser + confident "setlist unavailable, see description" fallback. Never block playback on a parse miss. |
| Archive.org rate limits / latency at scale | Med | Aggressive IndexedDB caching per arch TTLs; proxy keeps calls server-side for future throttling. |
| Claude model string / SSE through Vercel | Med | Pin a valid current model; verify streaming in Phase 0 before feature agents depend on it. |
| Two surfaces inflate scope | Med | Web-first; extension is a deferred shell, not parallel work. |
| Empty-date On This Day | Low | Nearest-date fallback (±3 days, prefer future) per spec. |

---

## 6. What I need from you
1. **Confirm web-first** (recommended) or insist on both surfaces in v1.
2. **`ANTHROPIC_API_KEY`** for live chat verification — or I build it stubbed and you wire it at deploy.

On your go, I start Phase 0 immediately.
