'use client';

interface MessageLimitBarProps {
  count: number;
  max?: number;
}

export function MessageLimitBar({ count, max = 20 }: MessageLimitBarProps) {
  const percentage = (count / max) * 100;
  let state: 'green' | 'amber' | 'red' = 'green';
  
  if (count > 15) state = 'red';
  else if (count > 6) state = 'amber';

  const stateColors = {
    green: 'bg-green-600',
    amber: 'bg-yellow-600',
    red: 'bg-dt-red',
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-dt-text-subtle text-xs uppercase tracking-wider">
          Daily Limit
        </p>
        <p className="text-dt-bone text-sm font-medium">
          {count} / {max}
        </p>
      </div>
      <div className="w-full h-2 bg-dt-text-subtle bg-opacity-20 rounded-full overflow-hidden">
        <div
          className={`h-full ${stateColors[state]} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {count === max && (
        <p className="text-dt-red text-xs mt-2 font-medium">
          Daily limit reached. Try again tomorrow.
        </p>
      )}
    </div>
  );
}
