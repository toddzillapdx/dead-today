'use client';

import { useAudio } from '@/components/AudioProvider';

interface ExpandedPlayerProps {
  onCollapse?: () => void;
  showDate?: string;
  showVenue?: string;
}

export function ExpandedPlayer({ onCollapse, showDate, showVenue }: ExpandedPlayerProps) {
  const { isPlaying, currentTime, duration, currentTrackTitle, volume, togglePlay, seek, setVolume } = useAudio();

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-dt-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-6">
      {/* Close Button */}
      <button
        onClick={onCollapse}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-dt-red text-dt-black flex items-center justify-center hover:opacity-90 transition"
        aria-label="Collapse player"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Album Art Placeholder */}
      <div className="w-64 h-64 rounded-lg bg-gradient-to-br from-dt-red to-dt-black mb-8 flex flex-col items-center justify-center text-center p-6">
        <div className="text-4xl mb-4">♪</div>
        {showDate && <p className="text-dt-bone text-sm font-medium">{showDate}</p>}
        {showVenue && <p className="text-dt-text-subtle text-xs">{showVenue}</p>}
      </div>

      {/* Track Title */}
      <h2 className="text-2xl font-bold text-dt-bone text-center mb-2 max-w-2xl">
        {currentTrackTitle || 'No track loaded'}
      </h2>

      {/* Time Display */}
      <p className="text-dt-text-subtle text-sm mb-6">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mb-8">
        <input
          type="range"
          min="0"
          max={isFinite(duration) ? duration : 0}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full h-2 bg-dt-text-subtle rounded-full appearance-none cursor-pointer accent-dt-red"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-dt-red text-dt-black flex items-center justify-center hover:opacity-90 transition"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-dt-bone" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-dt-text-subtle rounded-full appearance-none cursor-pointer accent-dt-red"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
