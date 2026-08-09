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
    identifier: "gd77-04-27.sbd.samaritano.20331.sbefail.shnf",
    date: "1977-04-27",
    venue: "Capitol Theatre",
    city: "Passaic, NJ",
    sourceType: SourceType.SBD,
    note:
      "Two weeks before Cornell on the same spring tour. Scarlet > Fire into Terrapin into Morning Dew. The band was locked in and nobody talks about it.",
  },
  {
    identifier: "gd1983-06-18.senn421.wise.miller.103285.flac16",
    date: "1983-06-18",
    venue: "Saratoga Performing Arts Center",
    city: "Saratoga Springs, NY",
    sourceType: SourceType.AUD,
    note:
      "Scarlet > Fire opens Set 2, then Playin' > Drums > Wheel > Morning Dew. One of the great Morning Dews ever. The whole second set is a monster.",
  },
  {
    identifier: "gd1995-06-21.sndchk.fm.gmb.91352.flac16",
    date: "1995-06-21",
    venue: "Knickerbocker Arena",
    city: "Albany, NY",
    sourceType: SourceType.SBD,
    note:
      "Scarlet > Fire into Playing in the Band > Morning Dew. Last summer tour before Jerry died that August. Listen knowing what you know.",
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
