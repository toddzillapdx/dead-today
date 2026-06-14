"use client";

/**
 * Skeleton card with pulse animation.
 * Used for loading state while fetching shows.
 */
export function SkeletonCard() {
  return (
    <div
      className="rounded-dt-lg border border-dt p-dt-4 bg-dt-surface animate-dt-pulse"
      style={{ borderColor: "rgba(255,255,255,0.10)" }}
    >
      {/* Badge placeholder */}
      <div className="h-4 w-16 bg-dt-raised rounded-dt-sm mb-dt-2 animate-dt-pulse" />

      {/* Title placeholder */}
      <div className="h-5 w-3/4 bg-dt-raised rounded-dt-sm mb-dt-3 animate-dt-pulse" />

      {/* Vibe blurb placeholder */}
      <div className="h-4 w-full bg-dt-raised rounded-dt-sm mb-dt-2 animate-dt-pulse" />
      <div className="h-4 w-2/3 bg-dt-raised rounded-dt-sm mb-dt-3 animate-dt-pulse" />

      {/* Location & Source */}
      <div className="flex items-center justify-between mb-dt-3">
        <div className="h-4 w-1/3 bg-dt-raised rounded-dt-sm animate-dt-pulse" />
        <div className="h-5 w-12 bg-dt-raised rounded-dt-sm animate-dt-pulse" />
      </div>

      {/* Stars & reviews */}
      <div className="flex items-center gap-dt-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-dt-raised rounded-full animate-dt-pulse"
            />
          ))}
        </div>
        <div className="h-4 w-20 bg-dt-raised rounded-dt-sm animate-dt-pulse" />
      </div>
    </div>
  );
}
