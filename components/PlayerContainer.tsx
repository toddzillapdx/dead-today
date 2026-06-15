'use client';

import { useState } from 'react';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ExpandedPlayer } from '@/components/ExpandedPlayer';

export function PlayerContainer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {!isExpanded && <MiniPlayer onExpand={() => setIsExpanded(true)} />}
      {isExpanded && <ExpandedPlayer onCollapse={() => setIsExpanded(false)} />}
    </>
  );
}
