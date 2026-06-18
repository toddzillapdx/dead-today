"use client";

import { useState } from "react";
import { ShowGroup } from "@/lib/groupShows";
import { SourceBadge } from "./SourceBadge";
import { StarRating } from "./StarRating";
import Link from "next/link";

interface ShowGroupCardProps {
  group: ShowGroup;
  featured?: boolean;
}

export function ShowGroupCard({ group, featured = false }: ShowGroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const best = group.recordings[0];
  const hasMultiple = group.recordings.length > 1;

  if (!hasMultiple) {
    return (
      <Link href={`/show/${best.identifier}`}>
        <div
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
          <div className="pl-dt-4 p-dt-4">
            {featured && (
              <div className="text-dt-red font-display text-sm font-bold mb-dt-2">
                ★ FEATURED
              </div>
            )}
            <div className="font-display font-semibold text-base leading-tight mb-dt-2">
              {best.year} · {best.venue}
            </div>
            {best.vibeBlurb && (
              <div className="text-dt-text-muted text-sm italic mb-dt-3 line-clamp-2">
                &ldquo;{best.vibeBlurb}&rdquo;
              </div>
            )}
            <div className="flex items-center justify-between mb-dt-3">
              <div className="text-dt-text-muted text-xs">{best.city}</div>
              <SourceBadge sourceType={best.sourceType} />
            </div>
            <div className="flex items-center gap-dt-2">
              <StarRating rating={best.avgRating} />
              <span className="text-dt-text-muted text-xs">
                {best.numReviews} {best.numReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
            {best.setlistRaw && (
              <div className="text-dt-text-subtle text-xs mt-dt-2 font-mono">
                ✓ Setlist
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`
        rounded-dt-lg border border-dt overflow-hidden
        transition-all duration-200
        ${
          featured
            ? "bg-dt-raised border-dt-red border-opacity-100 border-2"
            : "bg-dt-surface border-opacity-50"
        }
      `}
      style={{
        borderColor: featured ? undefined : "rgba(255,255,255,0.10)",
      }}
    >
      <div
        className="pl-dt-4 p-dt-4 cursor-pointer hover:bg-dt-raised transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {featured && (
          <div className="text-dt-red font-display text-sm font-bold mb-dt-2">
            ★ FEATURED
          </div>
        )}
        <div className="flex items-center justify-between mb-dt-2">
          <div className="font-display font-semibold text-base leading-tight">
            {best.year} · {best.venue}
          </div>
          <div className="flex items-center gap-dt-2 text-dt-text-muted text-xs shrink-0 ml-dt-3">
            <span className="bg-dt-surface border border-dt rounded-dt-sm px-dt-2 py-0.5" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              {group.recordings.length} recordings
            </span>
            <span className="transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              ▾
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-dt-text-muted text-xs">{best.city}</div>
          <div className="flex items-center gap-dt-2">
            <StarRating rating={best.avgRating} />
            <span className="text-dt-text-muted text-xs">best rated</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-dt" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {group.recordings.map((show, i) => (
            <Link key={show.identifier} href={`/show/${show.identifier}`}>
              <div
                className={`px-dt-4 py-dt-3 hover:bg-dt-raised transition-colors cursor-pointer ${
                  i < group.recordings.length - 1 ? "border-b border-dt" : ""
                }`}
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center justify-between mb-dt-1">
                  <div className="flex items-center gap-dt-2">
                    <SourceBadge sourceType={show.sourceType} />
                    <span className="text-dt-bone text-sm font-medium">
                      {show.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-dt-3 text-xs text-dt-text-muted">
                  <div className="flex items-center gap-dt-1">
                    <StarRating rating={show.avgRating} />
                    <span>{show.numReviews} reviews</span>
                  </div>
                  <span>{show.downloads.toLocaleString()} downloads</span>
                  {show.setlistRaw && (
                    <span className="font-mono">✓ Setlist</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
