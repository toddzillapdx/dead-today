'use client';

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
  const { loadTrack } = useAudio();

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

      {/* Setlist */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold uppercase mb-6">
          Setlist
        </h2>
        <div className="bg-dt-text-subtle bg-opacity-5 rounded-lg p-6">
          <p className="text-dt-text-subtle text-sm mb-4">
            Setlist parsing from unstructured Archive data coming soon.
            Click a track below to play.
          </p>
        </div>
      </section>

      {/* Full Track List */}
      <section>
        <h2 className="text-2xl font-display font-bold uppercase mb-6">
          All Tracks
        </h2>
        <TrackList tracks={tracks} onTrackClick={handleTrackClick} />
      </section>
    </main>
  );
}
