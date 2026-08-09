"use client";

interface EmptyStateProps {
  variant: "no-results";
  searchTerm?: string;
}

/**
 * Graceful empty state fallback for zero search/filter results.
 */
export function EmptyState({ searchTerm }: EmptyStateProps) {
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
