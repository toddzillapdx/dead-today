import { notFound } from 'next/navigation';
import { ShowDetailClient } from '@/components/ShowDetailClient';
import { ArchiveUnavailablePage } from '@/components/ArchiveUnavailablePage';
import { metadataUrl, normalizeTracks, fetchArchive } from '@/lib/archive';
import { deriveEra } from '@/lib/era';

interface ArchiveMetadata {
  identifier?: string;
  date?: string;
  venue?: string;
  coverage?: string;
  type?: string;
  title?: string;
}

type ShowMetadataResult =
  | { status: 'ok'; metadata: ArchiveMetadata; tracks: ReturnType<typeof normalizeTracks> }
  | { status: 'not_found' }
  | { status: 'unavailable' };

async function fetchShowMetadata(identifier: string): Promise<ShowMetadataResult> {
  try {
    const res = await fetchArchive(metadataUrl(identifier), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { status: 'not_found' };
    const data = await res.json();
    if (!data || !data.files) return { status: 'not_found' };

    const tracks = normalizeTracks(identifier, data.files);
    return {
      status: 'ok',
      metadata: data.metadata ?? {},
      tracks,
    };
  } catch {
    // Network failure or 10s timeout — Archive.org is unreachable.
    return { status: 'unavailable' };
  }
}

interface ShowParams {
  params: Promise<{
    identifier: string;
  }>;
}

export default async function ShowDetailPage({ params }: ShowParams) {
  const { identifier } = await params;
  const showData = await fetchShowMetadata(identifier);

  if (showData.status === 'not_found') {
    notFound();
  }

  if (showData.status === 'unavailable') {
    return <ArchiveUnavailablePage />;
  }

  const { metadata, tracks } = showData;

  // Normalize metadata to Show-like object
  const dateStr = metadata.date || 'Unknown Date';
  const isoDate = dateStr.slice(0, 10); // Handle "1977-05-08T..." format
  const year = parseInt(isoDate.slice(0, 4), 10) || 0;
  
  const show = {
    identifier: metadata.identifier || identifier,
    date: isoDate,
    venue: metadata.venue || 'Unknown Venue',
    city: metadata.coverage || metadata.type || '',
    avgRating: 3.5, // Placeholder (not in metadata)
    era: year > 0 ? deriveEra(year) : 'Unknown Era',
    title: metadata.title || 'Unknown Show',
  };

  return (
    <ShowDetailClient
      identifier={show.identifier}
      date={show.date}
      venue={show.venue}
      city={show.city}
      avgRating={show.avgRating}
      era={show.era}
      tracks={tracks || []}
    />
  );
}
