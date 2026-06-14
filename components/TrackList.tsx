'use client';

import { useAudio } from '@/components/AudioProvider';
import { Track } from '@/lib/types';

interface TrackListProps {
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
}

export function TrackList({ tracks, onTrackClick }: TrackListProps) {
  const { currentTrackId } = useAudio();

  const handleTrackClick = (track: Track) => {
    onTrackClick?.(track);
  };

  return (
    <div className="space-y-1">
      {tracks.map((track) => (
        <button
          key={track.filename}
          onClick={() => handleTrackClick(track)}
          className={`w-full text-left px-4 py-3 rounded-md transition flex items-center gap-4 ${
            currentTrackId === track.filename
              ? 'bg-dt-red text-dt-black'
              : 'text-dt-bone hover:bg-dt-text-subtle hover:bg-opacity-10'
          }`}
        >
          <span className="text-sm font-mono min-w-12">
            {track.disc}.{String(track.trackNumber).padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{track.title}</p>
            {track.durationSecs && (
              <p className={`text-xs ${currentTrackId === track.filename ? 'text-dt-black opacity-75' : 'text-dt-text-subtle'}`}>
                {formatDuration(track.durationSecs)}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
