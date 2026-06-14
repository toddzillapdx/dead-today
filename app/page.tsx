// Dead Today — Home page (Today tab)
// Server component that fetches today's shows and passes to TodayPage client component.

import { LightningBolt } from "@/components/LightningBolt";
import { TodayPage } from "@/components/TodayPage";
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
    return {
      md,
      shows: normalizeShows(data?.response?.docs ?? []),
      error: null,
    };
  } catch {
    return { md, shows: [], error: "Archive unreachable" };
  }
}

export default async function Home() {
  const { md, shows, error } = await getTodayShows();

  return (
    <main className="min-h-screen bg-dt-black text-dt-bone px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-dt-6">
        <LightningBolt variant="standalone" fill="#C8102E" size={28} />
        <h1 className="font-display font-bold text-5xl tracking-[0.02em] uppercase">
          Dead Today
        </h1>
      </header>

      <TodayPage
        initialShows={shows}
        initialDate={md}
        error={error}
      />

      <footer className="text-dt-text-subtle text-xs border-t border-dt pt-dt-6 mt-dt-10">
        <p>
          Dead Today — on this day in Grateful Dead history. Browse concerts
          from the Internet Archive.
        </p>
      </footer>
    </main>
  );
}
