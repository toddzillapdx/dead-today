'use client';

import { useState, useEffect } from 'react';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ExpandedPlayer } from '@/components/ExpandedPlayer';
import { useAudio } from '@/components/AudioProvider';

export function PlayerContainer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentShowIdentifier } = useAudio();
  const [showData, setShowData] = useState<{ date?: string; venue?: string; city?: string }>({});

  // Fetch show data when identifier changes
  useEffect(() => {
    if (!currentShowIdentifier) return;
    
    fetch(`/api/metadata/${currentShowIdentifier}`)
      .then(res => res.json())
      .then(data => {
        const metadata = data.metadata || {};
        const dateStr = metadata.date || '';
        const isoDate = dateStr.slice(0, 10);
        setShowData({
          date: isoDate,
          venue: metadata.venue || 'Unknown Venue',
          city: metadata.coverage || ''
        });
      })
      .catch(() => {
        setShowData({ date: 'Unknown', venue: 'Unknown Venue', city: '' });
      });
  }, [currentShowIdentifier]);

  return (
    <>
      {!isExpanded && <MiniPlayer onExpand={() => setIsExpanded(true)} />}
      {isExpanded && (
        <ExpandedPlayer 
          onCollapse={() => setIsExpanded(false)} 
          showDate={showData.date}
          showVenue={showData.venue}
          showCity={showData.city}
        />
      )}
    </>
  );
}
