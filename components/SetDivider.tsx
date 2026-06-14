'use client';

interface SetDividerProps {
  setNumber: 'SET 1' | 'SET 2' | 'ENCORE';
}

export function SetDivider({ setNumber }: SetDividerProps) {
  return (
    <div className="flex items-center gap-4 my-8 pt-6 pb-4">
      <div className="flex-1 h-px bg-dt-text-subtle" />
      <span className="font-display font-bold text-dt-bone text-lg uppercase tracking-wider">
        {setNumber}
      </span>
      <div className="flex-1 h-px bg-dt-text-subtle" />
    </div>
  );
}
