"use client";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

/**
 * 5-star display (read-only).
 * Renders filled/partial/empty stars for a 0-5 rating.
 */
export function StarRating({ rating = 0, size = "sm" }: StarRatingProps) {
  const clampedRating = Math.min(Math.max(rating, 0), 5);
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    if (clampedRating >= starValue) return "full";
    if (clampedRating > i) return "partial";
    return "empty";
  });

  const iconSize = size === "sm" ? 14 : 18;
  const starSpacing = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <div className={`flex ${starSpacing}`}>
      {stars.map((fill, i) => (
        <svg
          key={i}
          className="inline-block"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 20 20"
          fill="none"
        >
          {fill === "full" ? (
            <path
              d="M10 2l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8L10 2z"
              fill="#C8102E"
            />
          ) : fill === "partial" ? (
            <>
              <path
                d="M10 2l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8L10 2z"
                fill="#C8102E"
                opacity="0.4"
              />
              <path
                d="M10 2l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5v-15z"
                fill="#C8102E"
              />
            </>
          ) : (
            <path
              d="M10 2l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8L10 2z"
              fill="none"
              stroke="#555555"
              strokeWidth="1"
            />
          )}
        </svg>
      ))}
    </div>
  );
}
