// Dead Today — Phase 0 foundation status page.
// Server component: fetches today's shows from the live Archive.org spine and
// renders proof-of-life. Agent A replaces this with the real Today tab.

import { LightningBolt } from "@/components/LightningBolt";
import { normalizeShows } from "@/lib/archive";
import { buildOnThisDayUrl } from "@/lib/archive";

export const dynamic = "force-dynamic";

function monthDayToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

async function getTodayShows() {
  const md = monthDayToday();
  try {
    const res = await fetch(buildOnThisDayUrl(md), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { md, shows: [], error: `Archive ${res.status}` };
    const data = await res.json();
    return { md, shows: normalizeShows(data?.response?.docs ?? []), error: null };
  } catch {
    return { md, shows: [], error: "Archive unreachable" };
  }
}

export default async function Home() {
  const { md, shows, error } = await getTodayShows();
  const top = shows.slice(0, 5);

  return (
    <main className="min-h-screen bg-dt-black text-dt-bone px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-2">
        <LightningBolt variant="standalone" fill="#C8102E" size={28} />
        <h1 className="font-display font-bold text-5xl tracking-[0.02em] uppercase">
          Dead Today
        </h1>
      </header>
      <p className="text-dt-text-muted font-ui text-sm mb-8">
        Phase 0 foundation — live data spine verified against Archive.org.
      </p>

      <section className="mb-8">
        <h2 className="font-display text-xl mb-1">On this day in Dead history</h2>
        <p className="text-dt-text-muted text-sm mb-4">
          {md} ·{" "}
          {error ? (
            <span className="text-danger">{error}</span>
          ) : (
            `${shows.length} shows found`
          )}
        </p>

        <div className="space-y-3">
          {top.map((s, i) => (
            <div
              key={s.identifier}
              className="rounded-dt-lg border border-dt p-3 bg-dt-black"
              style={{ borderColor: "rgba(255,255,255,0.10)" }}
            >
              <div className="font-display text-[17px] font-semibold">
                {i === 0 ? "★ " : ""}
                {s.year} · {s.venue}
              </div>
              <div className="text-dt-text-muted text-xs mt-0.5">
                {s.city} · {s.sourceType}
              </div>
              <div className="text-dt-text-muted text-xs mt-1 font-mono">
                ★ {s.avgRating.toFixed(2)} · {s.numReviews} reviews ·{" "}
                {s.setlistRaw ? "setlist ✓" : "setlist —"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-dt-text-subtle text-xs border-t border-dt pt-4">
        Foundation components: tokens · LightningBolt · types · archive layer ·
        setlist parser · /api/shows · /api/metadata · /api/chat (stub-ready).
        Data from archive.org.
      </footer>
    </main>
  );
}
