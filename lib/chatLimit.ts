// Dead Today — Daily chat limit (localStorage).
// Source: Data Architecture v0.1 §4.2. Soft guardrail: 20 messages/day,
// resets at midnight (local). Enforced entirely client-side.

const KEY_DATE = "dt_chat_date";
const KEY_COUNT = "dt_chat_count";
export const DAILY_LIMIT = 20;

function today(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** Current message count for today (auto-resets on a new day). */
export function getChatCount(): number {
  if (!isBrowser()) return 0;
  const storedDate = localStorage.getItem(KEY_DATE);
  if (storedDate !== today()) {
    localStorage.setItem(KEY_DATE, today());
    localStorage.setItem(KEY_COUNT, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(KEY_COUNT) ?? "0", 10) || 0;
}

export function isLimitReached(): boolean {
  return getChatCount() >= DAILY_LIMIT;
}

/** Increment after a successful send. Returns the new count. */
export function incrementChatCount(): number {
  if (!isBrowser()) return 0;
  const next = getChatCount() + 1;
  localStorage.setItem(KEY_DATE, today());
  localStorage.setItem(KEY_COUNT, String(next));
  return next;
}

/** Threshold color for the message counter (Design System §2.3). */
export function countColor(count: number): "ok" | "warn" | "danger" {
  if (count >= 19) return "danger";
  if (count >= 15) return "warn";
  return "ok";
}
