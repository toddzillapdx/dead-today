// Dead Today — Archive.org data layer.
// Source: Data Architecture v0.1 §2–3, §7. Normalizes raw Advanced Search and
// Metadata API responses into clean Show / Track objects. Pure functions — no
// network here; fetching lives in the API proxy routes (app/api/*).

import { Show, Track, SourceType } from "./types";
import { deriveEra } from "./era";
import { extractSetlistRaw } from "./setlist";

const ARCHIVE_SEARCH = "https://archive.org/advancedsearch.php";
const ARCHIVE_METADATA = "https://archive.org/metadata";
const ARCHIVE_DOWNLOAD = "https://archive.org/download";

// Fields requested from Advanced Search (Data Architecture §2.1).
export const SEARCH_FIELDS = [
  "identifier",
  "title",
  "date",
  "coverage",
  "venue",
  "avg_rating",
  "num_reviews",
  "downloads",
  "source",
  "subject",
  "description",
];

// ---- Raw response shapes (loosely typed; Archive is inconsistent) ----
interface RawSearchDoc {
  identifier: string;
  title?: string;
  date?: string;
  coverage?: string;
  venue?: string;
  avg_rating?: number | string;
  num_reviews?: number | string;
  downloads?: number | string;
  source?: string;
  subject?: string | string[];
  description?: string | string[];
}

interface RawFile {
  name: string;
  format?: string;
  title?: string;
  track?: string | number;
  length?: string;
  size?: string | number;
  source?: string;
}

// ---- Helpers ----
function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
}

function firstString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

// Normalize Archive `source` text into our SourceType enum.
export function normalizeSourceType(raw: string | undefined): SourceType {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("matrix")) return SourceType.MATRIX;
  if (s.includes("sbd") || s.includes("soundboard")) return SourceType.SBD;
  if (s.includes("fm")) return SourceType.FM;
  if (s.includes("aud")) return SourceType.AUD;
  return SourceType.UNKNOWN;
}

// "7:23" -> 443 seconds. Handles "h:mm:ss" and bare seconds too.
export function durationToSecs(length: string | undefined): number {
  if (!length) return 0;
  const parts = length.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

// ---- Show normalization (Advanced Search) ----
export function normalizeShow(doc: RawSearchDoc): Show {
  const isoDate = (doc.date ?? "").slice(0, 10); // "1977-05-08T..." -> "1977-05-08"
  const year = parseInt(isoDate.slice(0, 4), 10) || 0;
  const monthDay = isoDate.slice(5, 10); // "05-08"
  const description = firstString(doc.description);

  return {
    identifier: doc.identifier,
    title: doc.title ?? "Untitled show",
    date: isoDate,
    year,
    monthDay,
    era: deriveEra(year),
    venue: doc.venue ?? "Unknown venue",
    city: doc.coverage ?? "",
    avgRating: toNum(doc.avg_rating),
    numReviews: toNum(doc.num_reviews),
    downloads: toNum(doc.downloads),
    sourceType: normalizeSourceType(doc.source),
    description,
    setlistRaw: extractSetlistRaw(description),
  };
}

export function normalizeShows(docs: RawSearchDoc[]): Show[] {
  return docs
    .filter((d) => d && d.identifier)
    .map(normalizeShow)
    .sort((a, b) => b.avgRating - a.avgRating); // avg_rating desc
}

// ---- Track normalization (Metadata) ----
// Keep only MP3 files (VBR MP3 / 64Kbps MP3); filter FLAC, Ogg, XML, etc.
function isMp3(file: RawFile): boolean {
  const fmt = (file.format ?? "").toLowerCase();
  return fmt.includes("mp3") || /\.mp3$/i.test(file.name);
}

// Infer disc/set number from filename pattern "...d1t01.mp3" -> disc 1.
function inferDisc(filename: string): number {
  const m = filename.match(/d(\d+)t\d+/i);
  return m ? parseInt(m[1], 10) : 1;
}

export function normalizeTracks(identifier: string, files: RawFile[]): Track[] {
  return files
    .filter(isMp3)
    .map((f) => {
      const trackNumber = toNum(f.track, 0);
      return {
        filename: f.name,
        title: f.title ?? f.name.replace(/\.mp3$/i, ""),
        trackNumber,
        disc: inferDisc(f.name),
        duration: f.length ?? "",
        durationSecs: durationToSecs(f.length),
        streamUrl: `${ARCHIVE_DOWNLOAD}/${identifier}/${encodeURIComponent(f.name)}`,
        sizeBytes: toNum(f.size),
      };
    })
    .sort((a, b) => a.disc - b.disc || a.trackNumber - b.trackNumber);
}

// ---- URL builders for the proxy routes ----
// GD touring years. Archive's `date` is a Solr date type — the wildcard-year
// syntax `date:[*-MM-DD TO *-MM-DD]` from the spec is INVALID and rejected by
// Archive. Working approach: OR explicit `date:YYYY-MM-DD` (auto-expands to a
// full-day range) across every active year. Verified against the live API.
const GD_YEARS: number[] = Array.from({ length: 1995 - 1965 + 1 }, (_, i) => 1965 + i);

export function buildOnThisDayUrl(monthDay: string, rows = 30): string {
  // monthDay = "MM-DD"; query across all years on that month/day.
  const ors = GD_YEARS.map((y) => `date:${y}-${monthDay}`).join(" OR ");
  const q = `collection:GratefulDead AND (${ors})`;
  return buildSearchUrl(q, rows);
}

export function buildBrowseUrl(opts: {
  q?: string;
  year?: number;
  yearStart?: number;
  yearEnd?: number;
  rows?: number;
  start?: number;
}): string {
  const clauses = ["collection:GratefulDead"];
  if (opts.year) clauses.push(`year:${opts.year}`);
  else if (opts.yearStart && opts.yearEnd)
    clauses.push(`year:[${opts.yearStart} TO ${opts.yearEnd}]`);
  if (opts.q) {
    const esc = opts.q.replace(/"/g, '\\"');
    clauses.push(`(venue:("${esc}") OR coverage:("${esc}") OR title:("${esc}"))`);
  }
  return buildSearchUrl(clauses.join(" AND "), opts.rows ?? 20, opts.start ?? 0);
}

function buildSearchUrl(q: string, rows: number, start = 0): string {
  const params = new URLSearchParams();
  params.set("q", q);
  for (const f of SEARCH_FIELDS) params.append("fl[]", f);
  params.append("sort[]", "avg_rating desc");
  params.set("rows", String(rows));
  params.set("start", String(start));
  params.set("output", "json");
  return `${ARCHIVE_SEARCH}?${params.toString()}`;
}

export function metadataUrl(identifier: string): string {
  return `${ARCHIVE_METADATA}/${identifier}`;
}
