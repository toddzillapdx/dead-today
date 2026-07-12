// Geolocation utilities — get user timezone from IP address
// Uses ip-api.com (free tier, no API key required, 45 req/min)

import { headers } from "next/headers";

/**
 * Get user's IP address from request headers.
 * Works on Vercel and standard Node.js servers.
 */
export async function getUserIp(): Promise<string> {
  const headersList = await headers();
  
  // Vercel: x-forwarded-for, otherwise use cf-connecting-ip (Cloudflare) or x-real-ip
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-real-ip") ||
    "127.0.0.1"; // fallback for local dev

  return ip;
}

/**
 * Get timezone string (e.g., "America/Los_Angeles") from IP address.
 * Cached for the request lifetime to avoid multiple API calls.
 */
let cachedTimezone: string | null = null;

export async function getUserTimezone(): Promise<string> {
  // Return cached result if available (same request)
  if (cachedTimezone) return cachedTimezone;

  try {
    const ip = await getUserIp();
    
    // Skip geolocation for localhost
    if (ip === "127.0.0.1" || ip === "::1") {
      cachedTimezone = "America/Los_Angeles"; // default for dev
      return cachedTimezone;
    }

    const res = await fetch(`https://ip-api.com/json/${ip}?fields=timezone`, {
      // Don't cache — timezone can vary per request
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      cachedTimezone = "America/Los_Angeles";
      return cachedTimezone;
    }

    const data = (await res.json()) as { timezone?: string };
    cachedTimezone = data.timezone || "America/Los_Angeles";
    return cachedTimezone;
  } catch {
    // Fallback to default timezone on error
    cachedTimezone = "America/Los_Angeles";
    return cachedTimezone;
  }
}

/**
 * Get today's date in the user's timezone as MM-DD format.
 * (Used to query Grateful Dead archive for "on this day" shows)
 */
export async function getLocalDateString(): Promise<string> {
  const timezone = await getUserTimezone();

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";

  return `${month}-${day}`;
}
