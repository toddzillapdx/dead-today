'use client';

import { useAudio } from '@/components/AudioProvider';

interface MiniPlayerProps {
  onExpand?: () => void;
}

export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { isPlaying, currentTime, duration, currentTrackTitle, togglePlay, seek, skipNext, skipPrevious, hasNext, hasPrevious } = useAudio();

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = duration - currentTime;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dt-black border-t border-dt-red px-4 py-3 flex items-center gap-4 h-20">
      {/* Transport Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={skipPrevious}
          className="w-8 h-8 flex items-center justify-center text-dt-bone hover:text-dt-red transition disabled:opacity-30"
          aria-label="Previous track"
          disabled={!hasPrevious && currentTime < 3}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-dt-red text-dt-black flex items-center justify-center hover:opacity-90 transition"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={skipNext}
          className="w-8 h-8 flex items-center justify-center text-dt-bone hover:text-dt-red transition disabled:opacity-30"
          aria-label="Next track"
          disabled={!hasNext}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className="text-dt-bone text-sm font-medium truncate">
          {currentTrackTitle || 'No track loaded'}
        </p>
        <p className="text-dt-text-subtle text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>

      {/* Seek Bar */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={isFinite(duration) ? duration : 0}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full h-1 bg-dt-text-subtle rounded-full appearance-none cursor-pointer accent-dt-red"
        />
      </div>

      {/* Time Remaining */}
      <div className="flex-shrink-0 text-dt-text-subtle text-xs min-w-12 text-right">
        -{formatTime(remainingTime > 0 ? remainingTime : 0)}
      </div>

      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-dt-red text-dt-black flex items-center justify-center hover:opacity-90 transition"
        aria-label="Expand player"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 14l5-5 5 5z" />
        </svg>
      </button>
    </div>
  );
}
