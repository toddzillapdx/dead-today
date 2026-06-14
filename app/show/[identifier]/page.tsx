import { notFound } from 'next/navigation';
import { SetDivider } from '@/components/SetDivider';
import { TrackList } from '@/components/TrackList';
import { StarRating } from '@/components/StarRating';
import { LightningBolt } from '@/components/LightningBolt';
import Link from 'next/link';

async function fetchShowMetadata(identifier: string) {
  try {
    const res = await fetch(
      `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://dead-today.vercel.app'}/api/metadata/${identifier}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

interface ShowParams {
  params: {
    identifier: string;
  };
}

export default async function ShowDetailPage({ params }: ShowParams) {
  const { identifier } = params;
  const showData = await fetchShowMetadata(identifier);

  if (!showData) {
    notFound();
  }

  const { show, tracks, setlist } = showData;

  // Group tracks by set
  const groupedTracks = groupTracksBySet(tracks, setlist);

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
                {show.date}
              </h1>
              <StarRating rating={show.avgRating} size="md" />
            </div>
            <p className="text-dt-text-subtle text-lg mb-2">
              {show.venue}
            </p>
            {show.city && (
              <p className="text-dt-text-subtle text-sm">{show.city}</p>
            )}
            {show.era && (
              <p className="text-dt-red text-sm font-medium mt-2">
                {show.era}
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

        {setlist && setlist.sets && setlist.sets.length > 0 ? (
          <div>
            {setlist.sets.map((set: any, idx: number) => (
              <div key={idx}>
                <SetDivider setNumber={set.name as any} />
                <TrackList
                  tracks={set.tracks || []}
                  onTrackClick={(track) => {
                    // Track click will be handled via audio context in the mini player
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-dt-text-subtle bg-opacity-5 rounded-lg p-6">
            <p className="text-dt-text-subtle text-sm">
              Setlist unavailable. See full track list below.
            </p>
          </div>
        )}
      </section>

      {/* Full Track List */}
      <section>
        <h2 className="text-2xl font-display font-bold uppercase mb-6">
          All Tracks
        </h2>
        <TrackList tracks={tracks} />
      </section>
    </main>
  );
}

function groupTracksBySet(tracks: any[], setlist: any) {
  if (!setlist || !setlist.sets) return [{ name: 'All Tracks', tracks }];
  return setlist.sets;
}
