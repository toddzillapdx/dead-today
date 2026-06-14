// Dead Today — Setlist parser.
// THE risk component (Build Plan §5). Archive.org's `description` field is
// unstructured free text with no guaranteed format. This parser extracts a
// SET 1 / SET 2 / ENCORE structure with ">" segue notation when possible,
// and returns null when the text isn't parseable — callers MUST fall back to
// showing the raw description rather than blocking playback.
//
// Phase 0 ships a solid first pass; Agent B (Listening) hardens it against
// real-world description variety during feature work.

import { SetlistSet, SetlistSong } from "./types";

// Common set headers seen in GD Archive descriptions, normalized to labels.
const SET_HEADER_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /^\s*set\s*(?:one|1|i)\b\s*:?/i, label: "SET 1" },
  { re: /^\s*set\s*(?:two|2|ii)\b\s*:?/i, label: "SET 2" },
  { re: /^\s*set\s*(?:three|3|iii)\b\s*:?/i, label: "SET 3" },
  { re: /^\s*(?:e:|enc(?:ore)?)\b\s*:?/i, label: "ENCORE" },
];

// Split a run of songs on commas/newlines while respecting ">" segues.
function parseSongs(block: string): SetlistSong[] {
  const cleaned = block
    .replace(/\s+/g, " ")
    .replace(/[;|]/g, ",")
    .trim();
  if (!cleaned) return [];

  // Tokenize on commas and ">" but keep ">" as a segue signal on the prior song.
  const rawTokens = cleaned.split(/,/).map((t) => t.trim()).filter(Boolean);
  const songs: SetlistSong[] = [];

  for (const token of rawTokens) {
    // A token may itself contain "A > B > C" segue chains.
    const chain = token.split(/>/).map((s) => s.trim()).filter(Boolean);
    chain.forEach((title, idx) => {
      const isLastInChain = idx === chain.length - 1;
      const cleanTitle = title.replace(/\*+$/, "").replace(/\s*\(.*?\)\s*$/, "").trim();
      if (!cleanTitle) return;
      songs.push({
        title: cleanTitle,
        // Segue if not the last link of its chain, OR token ended with ">".
        segueIntoNext: !isLastInChain || /\>\s*$/.test(token),
      });
    });
  }
  return songs;
}

/**
 * Attempt to parse a structured setlist from a raw description string.
 * Returns null if no recognizable set structure is found.
 */
export function parseSetlist(description: string | null | undefined): SetlistSet[] | null {
  if (!description) return null;

  // Normalize line breaks; many descriptions use literal "\n" or <br>.
  const normalized = description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r/g, "\n");

  const lines = normalized.split("\n").map((l) => l.trim());

  const sets: SetlistSet[] = [];
  let current: SetlistSet | null = null;
  let matchedAnyHeader = false;

  for (const line of lines) {
    if (!line) continue;

    const header = SET_HEADER_PATTERNS.find((p) => p.re.test(line));
    if (header) {
      matchedAnyHeader = true;
      // Push prior set if it has songs.
      if (current && current.songs.length) sets.push(current);
      current = { label: header.label, songs: [] };
      // Songs may follow on the same line after the header.
      const remainder = line.replace(header.re, "").trim();
      if (remainder) current.songs.push(...parseSongs(remainder));
      continue;
    }

    // Non-header line: append to current set if we're inside one.
    if (current) current.songs.push(...parseSongs(line));
  }

  if (current && current.songs.length) sets.push(current);

  // Only treat as a real setlist if we found explicit set headers AND songs.
  if (!matchedAnyHeader || sets.length === 0) return null;
  const totalSongs = sets.reduce((n, s) => n + s.songs.length, 0);
  if (totalSongs === 0) return null;

  return sets;
}

/**
 * Convenience: produce a flat raw setlist string (for Show.setlistRaw and the
 * chat system prompt) or null if unparseable.
 */
export function extractSetlistRaw(description: string | null | undefined): string | null {
  const sets = parseSetlist(description);
  if (!sets) return null;
  return sets
    .map((set) => {
      const songs = set.songs
        .map((s) => (s.segueIntoNext ? `${s.title} >` : s.title))
        .join(", ");
      return `${set.label}: ${songs}`;
    })
    .join("\n");
}
