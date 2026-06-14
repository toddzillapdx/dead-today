'use client';

import { Show, Era } from '@/lib/types';
import { StarRating } from '@/components/StarRating';

interface ContextBannerProps {
  show: Show;
}

export function ContextBanner({ show }: ContextBannerProps) {
  return (
    <div className="bg-dt-text-subtle bg-opacity-5 rounded-lg p-6 mb-6 border-l-4 border-dt-red">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-dt-text-subtle text-xs uppercase tracking-wider mb-1">
            Date
          </p>
          <p className="text-dt-bone font-medium">{show.date}</p>
        </div>
        <div>
          <p className="text-dt-text-subtle text-xs uppercase tracking-wider mb-1">
            Rating
          </p>
          <StarRating rating={show.avgRating} size="sm" />
        </div>
        <div className="col-span-2">
          <p className="text-dt-text-subtle text-xs uppercase tracking-wider mb-1">
            Venue
          </p>
          <p className="text-dt-bone font-medium">{show.venue}</p>
          {show.city && (
            <p className="text-dt-text-subtle text-sm">{show.city}</p>
          )}
        </div>
        {show.era && (
          <div>
            <p className="text-dt-text-subtle text-xs uppercase tracking-wider mb-1">
              Era
            </p>
            <p className="text-dt-red font-medium">{show.era}</p>
          </div>
        )}
      </div>
    </div>
  );
}
