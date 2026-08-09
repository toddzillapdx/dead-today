"use client";

import Link from "next/link";
import { ShowCard } from "@/components/ShowCard";
import { getToddsFavorites } from "@/lib/toddsFavorites";

export function ToddsFavorites() {
  const favorites = getToddsFavorites();

  return (
    <div>
      <div className="mb-dt-4">
        <h3 className="font-display font-bold text-xl mb-dt-1">
          Nothing on this date in Dead history.
        </h3>
        <p className="text-dt-text-muted text-sm">
          Here are three of Todd&apos;s favorites — shows with both Scarlet &gt;
          Fire and Morning Dew.
        </p>
      </div>
      <div className="space-y-dt-3">
        {favorites.map((show) => (
          <Link key={show.identifier} href={`/show/${show.identifier}`}>
            <ShowCard show={show} />
          </Link>
        ))}
      </div>
    </div>
  );
}
