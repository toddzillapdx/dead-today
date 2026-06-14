'use client';

import { useAudio } from '@/components/AudioProvider';

interface MiniPlayerProps {
  onExpand?: () => void;
}

export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { isPlaying, currentTime, duration, currentTrackTitle, togglePlay, seek } = useAudio();

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = duration - currentTime;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dt-black border-t border-dt-red px-4 py-3 flex items-center gap-4 h-20">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-dt-red text-dt-black flex items-center justify-center hover:opacity-90 transition"
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
