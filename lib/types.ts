// Dead Today — Normalized data models.
// Source: Data Architecture v0.1 §3. Raw Archive.org responses are normalized
// into these typed objects in lib/archive.ts before storage or UI use.

export enum Era {
  EARLY = "Early Dead (1965–1969)",
  PIGPEN = "Pigpen Era (1970–1972)",
  KEITH_DONNA = "Keith & Donna Era (1972–1979)",
  BRENT = "Brent Era (1979–1990)",
  VINCE = "Vince Era (1990–1995)",
  POST_JERRY = "Post-Jerry / Other (1995+)",
}

export enum SourceType {
  SBD = "SBD", // Soundboard — cleanest
  MATRIX = "MATRIX", // Mixed SBD + audience
  FM = "FM", // FM broadcast
  AUD = "AUD", // Audience recording
  UNKNOWN = "?",
}

// One Show per Archive.org identifier (recording).
export interface Show {
  // Identity
  identifier: string; // Archive.org item ID — primary key
  title: string;

  // Date
  date: string; // ISO 8601: "1977-05-08"
  year: number;
  monthDay: string; // "05-08" — used for On This Day queries
  era: Era;

  // Location
  venue: string;
  city: string; // coverage field

  // Quality signals
  avgRating: number; // 0–5
  numReviews: number;
  downloads: number;
  sourceType: SourceType;

  // Content
  description: string; // Raw — may contain setlist
  setlistRaw: string | null; // Extracted setlist text if parseable

  // Loaded lazily when show is selected
  tracks?: Track[];
  vibeBlurb?: string; // AI one-liner (cached after first gen)
}

// One Track per MP3 file (VBR MP3 / 64Kbps MP3 only; other formats filtered).
export interface Track {
  filename: string; // "gd77-05-08d1t01.mp3"
  title: string;
  trackNumber: number;
  disc: number; // 1 (Set 1), 2 (Set 2), etc.
  duration: string; // "7:23"
  durationSecs: number;
  streamUrl: string; // Full Archive.org CDN URL
  sizeBytes: number;
}

export interface ChatMessage {
  id: string; // uuid
  role: "user" | "assistant";
  content: string;
  timestamp: number; // Unix ms
}

export interface ChatSession {
  showIdentifier: string;
  messages: ChatMessage[];
  systemPrompt: string; // Built at session start
}

// Parsed setlist structure (output of lib/setlist.ts).
export interface SetlistSet {
  label: string; // "SET 1", "SET 2", "ENCORE"
  songs: SetlistSong[];
}

export interface SetlistSong {
  title: string;
  segueIntoNext: boolean; // ">" notation
}
