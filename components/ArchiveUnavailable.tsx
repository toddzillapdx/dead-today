"use client";

interface ArchiveUnavailableProps {
  onRetry: () => void;
  retrying?: boolean;
}

export function ArchiveUnavailable({ onRetry, retrying = false }: ArchiveUnavailableProps) {
  return (
    <div className="py-dt-10 px-dt-4 text-center border border-dt border-opacity-30 rounded-dt-lg bg-dt-surface">
      <div className="text-dt-bone text-sm mb-dt-4 max-w-md mx-auto">
        The Internet Archive is temporarily unavailable and that is why
        streaming Dead Today is not working. Try again in a few minutes.
        Consider this a set break!
      </div>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="px-dt-4 py-dt-2 bg-dt-red text-dt-bone rounded-dt-md text-sm font-semibold uppercase tracking-wide hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {retrying ? "Trying again..." : "Try again"}
      </button>
    </div>
  );
}
