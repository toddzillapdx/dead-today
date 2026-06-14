"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Show, Era } from "@/lib/types";
import { ShowCard } from "@/components/ShowCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { ERA_RANGES } from "@/lib/era";
import Link from "next/link";

export function BrowsePage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [totalFound, setTotalFound] = useState(0);

  const eras = Object.keys(ERA_RANGES);
  const years = Array.from({ length: 1995 - 1965 + 1 }, (_, i) => 1965 + i)
    .reverse();

  // Search with 400ms debounce
  const performSearch = useCallback(
    async (q: string, era: string | null, year: string | null, offset = 0) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (year) params.set("year", year);
        else if (era) params.set("era", era);
        if (offset > 0) params.set("start", String(offset));

        const res = await fetch(`/api/shows?${params.toString()}`);

        if (!res.status.toString().startsWith("2")) {
          if (res.status === 404) {
            setShows(offset === 0 ? [] : shows);
            setHasMore(false);
            setTotalFound(0);
          } else {
            setError("Failed to load shows");
          }
        } else {
          const data = await res.json();
          const newShows = data.shows || [];
          setShows(offset === 0 ? newShows : [...shows, ...newShows]);
          setHasMore(newShows.length >= 20);
          setTotalFound(data.numFound || newShows.length);
        }
      } catch {
        setError("Archive unreachable");
      } finally {
        setLoading(false);
      }
    },
    [shows]
  );

  // Debounced search handler
  const handleSearch = useCallback(
    (q: string) => {
      setSearchTerm(q);
      setStart(0);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        performSearch(q, selectedEra, selectedYear, 0);
      }, 400); // 400ms debounce per spec
    },
    [selectedEra, selectedYear, performSearch]
  );

  // Handle era filter change
  const handleEraChange = (era: string | null) => {
    setSelectedEra(era);
    setSelectedYear(null);
    setStart(0);
    performSearch(searchTerm, era, null, 0);
  };

  // Handle year filter change
  const handleYearChange = (year: string | null) => {
    setSelectedYear(year);
    setSelectedEra(null);
    setStart(0);
    performSearch(searchTerm, null, year, 0);
  };

  // Load more pagination
  const handleLoadMore = () => {
    const nextStart = start + 20;
    setStart(nextStart);
    performSearch(searchTerm, selectedEra, selectedYear, nextStart);
  };

  return (
    <div className="space-y-dt-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-3xl mb-dt-2">Browse Shows</h2>
        <p className="text-dt-text-muted text-sm">
          Search concerts by venue, city, or era
        </p>
      </div>

      {/* Navigation hint */}
      <p className="text-dt-text-subtle text-xs">
        <Link
          href="/"
          className="text-dt-red hover:text-dt-red hover:opacity-80 underline"
        >
          Back to Today
        </Link>
      </p>

      {/* Search input */}
      <div>
        <input
          type="text"
          placeholder="Search venue, city, or show..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-dt-4 py-dt-3 bg-dt-surface border border-dt rounded-dt-md text-dt-bone placeholder-dt-text-muted text-sm focus:outline-none focus:border-dt-red focus:border-opacity-50"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
          }}
        />
      </div>

      {/* Filters */}
      <div className="space-y-dt-3">
        {/* Era filter */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-dt-text-muted mb-dt-2">
            Era
          </label>
          <div className="flex flex-wrap gap-dt-2">
            <button
              onClick={() => handleEraChange(null)}
              className={`text-xs px-dt-3 py-dt-1 rounded-dt-sm font-semibold uppercase tracking-wide transition-all ${
                selectedEra === null
                  ? "bg-dt-red text-dt-bone"
                  : "bg-dt-surface border border-dt text-dt-text-muted hover:border-opacity-100"
              }`}
              style={
                selectedEra === null
                  ? {}
                  : { borderColor: "rgba(255,255,255,0.10)" }
              }
            >
              All Eras
            </button>
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => handleEraChange(era)}
                className={`text-xs px-dt-3 py-dt-1 rounded-dt-sm font-semibold uppercase tracking-wide transition-all whitespace-nowrap ${
                  selectedEra === era
                    ? "bg-dt-red text-dt-bone"
                    : "bg-dt-surface border border-dt text-dt-text-muted hover:border-opacity-100"
                }`}
                style={
                  selectedEra === era
                    ? {}
                    : { borderColor: "rgba(255,255,255,0.10)" }
                }
              >
                {era.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Year filter */}
        {!selectedEra && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-dt-text-muted mb-dt-2">
              Year
            </label>
            <select
              value={selectedYear || ""}
              onChange={(e) => handleYearChange(e.target.value || null)}
              className="w-full px-dt-3 py-dt-2 bg-dt-surface border border-dt rounded-dt-md text-dt-bone text-sm focus:outline-none focus:border-dt-red focus:border-opacity-50"
              style={{
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && shows.length > 0 && (
        <p className="text-dt-text-muted text-xs">
          Showing {shows.length} of {totalFound} shows
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="p-dt-4 bg-dt-surface border border-dt border-opacity-30 rounded-dt-lg text-danger text-sm">
          {error}
        </div>
      )}

      {/* Loading state (for initial search) */}
      {loading && shows.length === 0 && (
        <div className="space-y-dt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {shows.length > 0 && (
        <div className="space-y-dt-3">
          {shows.map((show) => (
            <ShowCard key={show.identifier} show={show} />
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && shows.length > 0 && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full px-dt-4 py-dt-3 bg-dt-surface border border-dt rounded-dt-md text-dt-bone text-sm font-semibold uppercase tracking-wide hover:bg-dt-raised disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
          }}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {/* Empty state */}
      {!loading && shows.length === 0 && !error && (
        <EmptyState variant="no-results" searchTerm={searchTerm} />
      )}
    </div>
  );
}
