"use client";

import { useState, useEffect } from "react";
import { Show } from "@/lib/types";
import { ShowGroupCard } from "@/components/ShowGroupCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ToddsFavorites } from "@/components/ToddsFavorites";
import { groupShowsByDate, ShowGroup } from "@/lib/groupShows";
import { cache } from "@/lib/cache";

interface TodayPageProps {
  initialShows?: Show[];
  initialDate?: string;
  initialArchiveDown?: boolean;
}

function monthDayToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function formatDateDisplay(monthDay: string): string {
  const [month, day] = monthDay.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
}

export function TodayPage({
  initialShows = [],
  initialDate = monthDayToday(),
  initialArchiveDown = false,
}: TodayPageProps) {
  const [shows, setShows] = useState<Show[]>(initialShows);
  const [loading, setLoading] = useState(initialShows.length === 0 && !initialArchiveDown);

  useEffect(() => {
    if (initialShows.length > 0 || initialArchiveDown) return;

    const fetchTodayShows = async () => {
      try {
        // Check cache first
        const cached = await cache.getOnThisDay(initialDate);
        if (cached) {
          setShows(cached);
          setLoading(false);
          return;
        }

        // Fetch from API
        const res = await fetch(
          `/api/shows?monthDay=${encodeURIComponent(initialDate)}`
        );

        if (!res.ok) {
          // Either "no shows on this date" (404) or Archive.org is
          // unreachable (503) — both fall back to Todd's Favorites below,
          // no error message shown on the Today tab.
          setShows([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const shows = data.shows || [];
        setShows(shows);

        // Cache for future use
        if (shows.length > 0) {
          await cache.setOnThisDay(initialDate, shows);
        }
      } catch {
        setShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayShows();
  }, [initialDate, initialShows, initialArchiveDown]);

  const groups = groupShowsByDate(shows);
  const featuredGroup = groups[0];
  const otherGroups = groups.slice(1);

  return (
    <div className="space-y-dt-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-3xl mb-dt-2">On This Day</h2>
        <p className="text-dt-text-muted text-sm">
          Dead history for {formatDateDisplay(initialDate)}
          {!loading && groups.length > 0 && (
            <span className="ml-dt-2">· {groups.length} {groups.length === 1 ? "show" : "shows"}</span>
          )}
        </p>
        <p className="text-dt-text-subtle text-xs mt-dt-2">
          Thank you to archive.org and Deadheads around the world for sharing their recordings!
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-dt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Featured card */}
      {!loading && featuredGroup && (
        <div>
          <div className="text-xs uppercase tracking-wide text-dt-text-muted font-semibold mb-dt-2">
            ★ Featured
          </div>
          <ShowGroupCard group={featuredGroup} featured={true} />
        </div>
      )}

      {/* Other shows */}
      {!loading && otherGroups.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-dt-text-muted font-semibold mb-dt-2">
            More from this day
          </div>
          <div className="space-y-dt-3">
            {otherGroups.map((group) => (
              <ShowGroupCard key={group.date} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state: Todd's Favorites fallback (also covers Archive.org outages) */}
      {!loading && shows.length === 0 && <ToddsFavorites />}
    </div>
  );
}
