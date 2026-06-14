"use client";

interface EmptyStateProps {
  variant: "no-results" | "empty-date";
  searchTerm?: string;
  date?: string;
}

/**
 * Graceful empty state fallback.
 * Variant: no-results (search/filter returned 0) or empty-date (no shows on specific day)
 */
export function EmptyState({
  variant,
  searchTerm,
  date,
}: EmptyStateProps) {
  if (variant === "no-results") {
    return (
      <div className="py-dt-10 px-dt-4 text-center border border-dt border-opacity-30 rounded-dt-lg bg-dt-surface">
        <div className="text-dt-text-muted text-sm mb-dt-2">
          No results found
        </div>
        {searchTerm && (
          <div className="text-dt-text-subtle text-xs">
            Try adjusting your search for "{searchTerm}"
          </div>
        )}
      </div>
    );
  }

  // empty-date variant: suggest browsing nearby days
  return (
    <div className="py-dt-10 px-dt-4 text-center border border-dt border-opacity-30 rounded-dt-lg bg-dt-surface">
      <div className="text-dt-text-muted text-sm mb-dt-3">
        No shows recorded for {date}
      </div>
      <p className="text-dt-text-subtle text-xs mb-dt-4">
        Try browsing ±3 days or use the Browse feature to explore other dates,
        venues, and eras.
      </p>
      <div className="inline-block">
        <a
          href="/browse"
          className="text-dt-red hover:text-danger text-xs font-semibold uppercase tracking-wide"
        >
          Browse All Shows →
        </a>
      </div>
    </div>
  );
}
