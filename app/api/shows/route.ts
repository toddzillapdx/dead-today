// Dead Today — /api/shows
// Source: Data Architecture v0.1 §7. Proxies Archive.org Advanced Search.
// Keeps Archive calls server-side for future rate-limit management.
//   GET /api/shows?monthDay=MM-DD            (On This Day)
//   GET /api/shows?q=...&year=...&era=...    (Browse)
// Returns: normalized Show[] sorted by avg_rating desc.

import { NextRequest, NextResponse } from "next/server";
import { buildOnThisDayUrl, buildBrowseUrl, normalizeShows } from "@/lib/archive";
import { ERA_RANGES } from "@/lib/era";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const monthDay = sp.get("monthDay");
  const q = sp.get("q") ?? undefined;
  const yearParam = sp.get("year");
  const era = sp.get("era") ?? undefined;
  const start = parseInt(sp.get("start") ?? "0", 10) || 0;

  let url: string;
  if (monthDay && /^\d{2}-\d{2}$/.test(monthDay)) {
    url = buildOnThisDayUrl(monthDay);
  } else {
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    let yearStart: number | undefined;
    let yearEnd: number | undefined;
    if (!year && era && ERA_RANGES[era]) [yearStart, yearEnd] = ERA_RANGES[era];
    url = buildBrowseUrl({ q, year, yearStart, yearEnd, start });
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Cache at the edge briefly; client also caches in IndexedDB.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Archive.org unreachable" },
        { status: 502 },
      );
    }
    const data = await res.json();
    const docs = data?.response?.docs ?? [];
    const shows = normalizeShows(docs);
    if (shows.length === 0) {
      return NextResponse.json({ shows: [], numFound: 0 }, { status: 404 });
    }
    return NextResponse.json({
      shows,
      numFound: data?.response?.numFound ?? shows.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Archive.org unreachable" },
      { status: 502 },
    );
  }
}
