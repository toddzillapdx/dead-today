import { Show } from "./types";

export interface ShowGroup {
  date: string;
  venue: string;
  city: string;
  year: number;
  era: Show["era"];
  recordings: Show[];
}

export function groupShowsByDate(shows: Show[]): ShowGroup[] {
  const map = new Map<string, ShowGroup>();

  for (const show of shows) {
    const key = show.date;
    const existing = map.get(key);
    if (existing) {
      existing.recordings.push(show);
    } else {
      map.set(key, {
        date: show.date,
        venue: show.venue,
        city: show.city,
        year: show.year,
        era: show.era,
        recordings: [show],
      });
    }
  }

  const groups = Array.from(map.values());
  // Sort recordings within each group by rating desc
  for (const g of groups) {
    g.recordings.sort((a, b) => b.avgRating - a.avgRating);
  }
  return groups;
}
