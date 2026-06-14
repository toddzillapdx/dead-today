"use client";

import { Show } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";
import { StarRating } from "./StarRating";

interface ShowCardProps {
  show: Show;
  featured?: boolean;
  onClick?: () => void;
}

export function ShowCard({ show, featured = false, onClick }: ShowCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-dt-lg border border-dt overflow-hidden cursor-pointer
        transition-all duration-200 hover:border-opacity-100
        ${
          featured
            ? "bg-dt-raised border-dt-red border-opacity-100 border-2"
            : "bg-dt-surface border-opacity-50 hover:bg-dt-raised"
        }
      `}
      style={{
        borderColor: featured ? undefined : "rgba(255,255,255,0.10)",
      }}
    >
      {/* Left border accent (vibe blurb area) */}
      <div
        className="h-full border-l-2"
        style={{ borderColor: "#C8102E", position: "absolute", left: 0, top: 0 }}
      />

      <div className="pl-dt-4 p-dt-4">
        {/* Featured badge */}
        {featured && (
          <div className="text-dt-red font-display text-sm font-bold mb-dt-2">
            ★ FEATURED
          </div>
        )}

        {/* Title & Date */}
        <div className="font-display font-semibold text-base leading-tight mb-dt-2">
          {show.year} · {show.venue}
        </div>

        {/* Vibe blurb (if available) */}
        {show.vibeBlurb && (
          <div className="text-dt-text-muted text-sm italic mb-dt-3 line-clamp-2">
            "{show.vibeBlurb}"
          </div>
        )}

        {/* Location & Source */}
        <div className="flex items-center justify-between mb-dt-3">
          <div className="text-dt-text-muted text-xs">{show.city}</div>
          <SourceBadge sourceType={show.sourceType} />
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-dt-2">
          <StarRating rating={show.avgRating} />
          <span className="text-dt-text-muted text-xs">
            {show.numReviews} {show.numReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Setlist indicator */}
        {show.setlistRaw && (
          <div className="text-dt-text-subtle text-xs mt-dt-2 font-mono">
            ✓ Setlist
          </div>
        )}
      </div>
    </div>
  );
}
