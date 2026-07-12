'use client';

import { useState } from 'react';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ExpandedPlayer } from '@/components/ExpandedPlayer';
import { useAudio } from '@/components/AudioProvider';

export function PlayerContainer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentShowIdentifier, showVenue, showDate, showCity } = useAudio();

  return (
    <>
      {!isExpanded && <MiniPlayer onExpand={() => setIsExpanded(true)} />}
      {isExpanded && (
        <ExpandedPlayer 
          onCollapse={() => setIsExpanded(false)} 
          showDate={showDate}
          showVenue={showVenue}
          showCity={showCity}
        />
      )}
    </>
  );
}
