// Dead Today — IndexedDB cache.
// Source: Data Architecture v0.1 §4.1. Caches shows (24h), tracks (7d), and
// vibeBlurbs (30d). Falls back to no-op when IndexedDB is unavailable (SSR).

import type { Show, Track } from "./types";

const DB_NAME = "deadtoday-v1";
const DB_VERSION = 1;

const STORE_SHOWS = "shows";
const STORE_TRACKS = "tracks";
const STORE_VIBES = "vibeBlurbs";

const TTL = {
  shows: 24 * 60 * 60 * 1000, // 24h
  tracks: 7 * 24 * 60 * 60 * 1000, // 7d
  vibes: 30 * 24 * 60 * 60 * 1000, // 30d
};

interface Wrapped<T> {
  key: string;
  value: T;
  cachedAt: number;
}

function hasIDB(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SHOWS))
        db.createObjectStore(STORE_SHOWS, { keyPath: "key" });
      if (!db.objectStoreNames.contains(STORE_TRACKS))
        db.createObjectStore(STORE_TRACKS, { keyPath: "key" });
      if (!db.objectStoreNames.contains(STORE_VIBES))
        db.createObjectStore(STORE_VIBES, { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put<T>(store: string, key: string, value: T): Promise<void> {
  if (!hasIDB()) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put({ key, value, cachedAt: Date.now() } as Wrapped<T>);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function get<T>(store: string, key: string, ttl: number): Promise<T | null> {
  if (!hasIDB()) return null;
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => {
      const row = req.result as Wrapped<T> | undefined;
      if (!row) return resolve(null);
      if (Date.now() - row.cachedAt > ttl) return resolve(null); // stale
      resolve(row.value);
    };
    req.onerror = () => resolve(null);
  });
}

// ---- Public API ----
export const cache = {
  getOnThisDay: (monthDay: string) =>
    get<Show[]>(STORE_SHOWS, `onThisDay-${monthDay}`, TTL.shows),
  setOnThisDay: (monthDay: string, shows: Show[]) =>
    put(STORE_SHOWS, `onThisDay-${monthDay}`, shows),

  getTracks: (identifier: string) =>
    get<Track[]>(STORE_TRACKS, identifier, TTL.tracks),
  setTracks: (identifier: string, tracks: Track[]) =>
    put(STORE_TRACKS, identifier, tracks),

  getVibe: (identifier: string) =>
    get<string>(STORE_VIBES, identifier, TTL.vibes),
  setVibe: (identifier: string, blurb: string) =>
    put(STORE_VIBES, identifier, blurb),
};
