// Dead Today — Hard-coded fallback shows for the "Todd's Favorites" section.
// Shown only when On This Day returns zero results for the current date.

import { Show, SourceType } from "./types";
import { deriveEra } from "./era";

interface FavoriteShow {
  identifier: string;
  date: string;
  venue: string;
  city: string;
  sourceType: SourceType;
  note: string;
}

const FAVORITES: FavoriteShow[] = [
  {
    identifier: "gd1977-04-27.sbd.braverman.7799.shnf",
    date: "1977-04-27",
    venue: "Capitol Theatre",
    city: "Passaic, NJ",
    sourceType: SourceType.SBD,
    note:
      "Two weeks before Cornell on the same spring tour. Scarlet > Fire into Terrapin into Morning Dew. The band was locked in and nobody talks about it.",
  },
  {
    identifier: "gd1991-08-17.141289.sbd.miller.flac2496",
    date: "1991-08-17",
    venue: "Shoreline Amphitheatre",
    city: "Mountain View, CA",
    sourceType: SourceType.SBD,
    note:
      "The opening is absolute fire: Help > Slip > Franklin's into Wang Dang Doodle. Bruce Hornsby on piano for this one.",
  },
];

export function getToddsFavorites(): Show[] {
  return FAVORITES.map((f) => {
    const year = parseInt(f.date.slice(0, 4), 10);
    const monthDay = f.date.slice(5, 10);
    return {
      identifier: f.identifier,
      title: `Grateful Dead Live at ${f.venue} on ${f.date}`,
      date: f.date,
      year,
      monthDay,
      era: deriveEra(year),
      venue: f.venue,
      city: f.city,
      avgRating: 5,
      numReviews: 0,
      downloads: 0,
      sourceType: f.sourceType,
      description: f.note,
      setlistRaw: null,
      vibeBlurb: f.note,
    };
  });
}
