import { notFound } from 'next/navigation';
import { ShowDetailClient } from '@/components/ShowDetailClient';

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

  const { metadata, tracks } = showData;
  
  // Normalize metadata to Show-like object
  const show = {
    identifier: metadata.identifier || identifier,
    date: metadata.date || 'Unknown Date',
    venue: metadata.venue || 'Unknown Venue',
    city: metadata.coverage || metadata.type || '',
    avgRating: 3.5, // Placeholder (not in metadata)
    era: 'Unknown Era',
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
