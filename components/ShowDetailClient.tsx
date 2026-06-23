'use client';

import { useEffect } from 'react';
import { Track } from '@/lib/types';
import { TrackList } from '@/components/TrackList';
import { StarRating } from '@/components/StarRating';
import { useAudio } from '@/components/AudioProvider';
import Link from 'next/link';

interface ShowDetailClientProps {
  identifier: string;
  date: string;
  venue: string;
  city: string;
  avgRating: number;
  era: string;
  tracks: Track[];
}

export function ShowDetailClient({
  identifier,
  date,
  venue,
  city,
  avgRating,
  era,
  tracks,
}: ShowDetailClientProps) {
  const { loadTrack, setPlaylist } = useAudio();

  // Register the full playlist when tracks load
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      setPlaylist(tracks.map(t => ({
        url: t.streamUrl,
        title: t.title,
        trackId: t.filename,
      })), 0, identifier);
    }
  }, [tracks, setPlaylist]);

  const handleTrackClick = (track: Track) => {
    loadTrack(track.streamUrl, track.title, track.filename);
  };

  return (
    <main className="min-h-screen bg-dt-black text-dt-bone px-6 py-10 max-w-3xl mx-auto pb-32">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-dt-red hover:opacity-75 transition mb-8 text-sm uppercase font-display"
      >
        <span>&larr;</span> Back to Today
      </Link>

      {/* Show Header */}
      <header className="mb-10">
        <div className="flex items-start gap-6 mb-6">
        <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
          <img
            src="/dead-today/tape-spines.jpg"
            alt={`${venue} - ${date}`}
            className="w-full h-full object-cover"
          />
        </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold uppercase">
                {date}
              </h1>
              <StarRating rating={avgRating} size="md" />
            </div>
            <p className="text-dt-text-subtle text-lg mb-2">
              {venue}
            </p>
            {city && (
              <p className="text-dt-text-subtle text-sm">{city}</p>
            )}
            {era && (
              <p className="text-dt-red text-sm font-medium mt-2">
                {era}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Track List */}
      <section>
        <h2 className="text-2xl font-display font-bold uppercase mb-6">
          Tracks
        </h2>
        <TrackList tracks={tracks} onTrackClick={handleTrackClick} />
      </section>
    </main>
  );
}
