"use client";

import { useState, useEffect } from "react";
import { Show } from "@/lib/types";
import { ShowCard } from "@/components/ShowCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { cache } from "@/lib/cache";
import Link from "next/link";

interface TodayPageProps {
  initialShows?: Show[];
  initialDate?: string;
  error?: string | null;
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
  error = null,
}: TodayPageProps) {
  const [shows, setShows] = useState<Show[]>(initialShows);
  const [loading, setLoading] = useState(initialShows.length === 0);
  const [err, setErr] = useState<string | null>(error);
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);

  useEffect(() => {
    if (initialShows.length > 0) return;

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
          if (res.status === 404) {
            setShows([]);
          } else {
            setErr("Failed to load shows");
          }
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
        setErr("Archive unreachable");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayShows();
  }, [initialDate, initialShows]);

  // Featured card: top-rated show
  const featuredShow = shows[0];
  const otherShows = shows.slice(1);

  return (
    <div className="space-y-dt-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-3xl mb-dt-2">On This Day</h2>
        <p className="text-dt-text-muted text-sm">
          Dead history for {formatDateDisplay(initialDate)}
          {!loading && shows.length > 0 && (
            <span className="ml-dt-2">· {shows.length} shows</span>
          )}
        </p>
      </div>

      {/* Navigation hint */}
      <p className="text-dt-text-subtle text-xs">
        <Link
          href="/browse"
          className="text-dt-red hover:text-dt-red hover:opacity-80 underline"
        >
          Browse all shows
        </Link>{" "}
        or filter by era/year
      </p>

      {/* Loading state */}
      {loading && (
        <div className="space-y-dt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {err && (
        <div className="p-dt-4 bg-dt-surface border border-dt border-opacity-30 rounded-dt-lg text-danger text-sm">
          {err}
        </div>
      )}

      {/* Featured card */}
      {!loading && featuredShow && (
        <div>
          <div className="text-xs uppercase tracking-wide text-dt-text-muted font-semibold mb-dt-2">
            ★ Featured
          </div>
          <ShowCard
            show={featuredShow}
            featured={true}
            onClick={() => setSelectedShowId(featuredShow.identifier)}
          />
        </div>
      )}

      {/* Other shows */}
      {!loading && otherShows.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-dt-text-muted font-semibold mb-dt-2">
            More from this day
          </div>
          <div className="space-y-dt-3">
            {otherShows.map((show) => (
              <ShowCard
                key={show.identifier}
                show={show}
                onClick={() => setSelectedShowId(show.identifier)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !err && shows.length === 0 && (
        <EmptyState
          variant="empty-date"
          date={formatDateDisplay(initialDate)}
        />
      )}

      {/* Selected show detail (modal/redirect could go here) */}
      {selectedShowId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-dt-4">
          <div className="bg-dt-surface rounded-dt-lg p-dt-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            {shows.find((s) => s.identifier === selectedShowId) && (
              <div>
                <h3 className="font-display font-bold text-xl mb-dt-4">
                  Show Details
                </h3>
                <pre className="text-xs text-dt-text-muted overflow-auto">
                  {JSON.stringify(
                    shows.find((s) => s.identifier === selectedShowId),
                    null,
                    2
                  )}
                </pre>
                <button
                  onClick={() => setSelectedShowId(null)}
                  className="mt-dt-4 px-dt-4 py-dt-2 bg-dt-red text-dt-bone rounded-dt-md text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
