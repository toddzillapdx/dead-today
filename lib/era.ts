// Dead Today — Era derivation from show date.
// Source: Data Architecture v0.1 §3.3. Boundary years overlap in the spec
// (e.g. 1972, 1979, 1990); we resolve by checking ranges in chronological
// order with explicit upper bounds so each year maps to exactly one Era.

import { Era } from "./types";

export function deriveEra(year: number): Era {
  if (year <= 1969) return Era.EARLY; // 1965–1969
  if (year <= 1972) return Era.PIGPEN; // 1970–1972 (Pigpen d. 1973)
  if (year <= 1979) return Era.KEITH_DONNA; // 1972–1979
  if (year <= 1990) return Era.BRENT; // 1979–1990 (Brent d. 1990)
  if (year <= 1995) return Era.VINCE; // 1990–1995 (Jerry d. Aug 1995)
  return Era.POST_JERRY; // 1995+
}

// Era → [startYear, endYear] for Browse year-range constraints.
export const ERA_RANGES: Record<string, [number, number]> = {
  "Early (1965–69)": [1965, 1969],
  "Pigpen Era (1970–72)": [1970, 1972],
  "Keith & Donna Era (1972–79)": [1972, 1979],
  "Brent Era (1979–90)": [1979, 1990],
  "Vince Era (1990–95)": [1990, 1995],
  "Post-Jerry (1995+)": [1995, 1995],
};
