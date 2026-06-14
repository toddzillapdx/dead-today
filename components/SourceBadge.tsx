"use client";

import { SourceType } from "@/lib/types";

interface SourceBadgeProps {
  sourceType: SourceType;
}

// Design System §5: color-coded source types
const SOURCE_COLORS: Record<SourceType, { bg: string; text: string }> = {
  [SourceType.SBD]: { bg: "rgb(26, 61, 26)", text: "rgb(111, 207, 111)" },
  [SourceType.MATRIX]: {
    bg: "rgb(42, 16, 64)",
    text: "rgb(155, 89, 182)",
  },
  [SourceType.FM]: { bg: "rgb(14, 42, 61)", text: "rgb(74, 144, 217)" },
  [SourceType.AUD]: { bg: "rgb(61, 46, 10)", text: "rgb(240, 160, 48)" },
  [SourceType.UNKNOWN]: {
    bg: "rgb(45, 45, 45)",
    text: "rgb(136, 136, 136)",
  },
};

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  const colors = SOURCE_COLORS[sourceType];
  const label =
    sourceType === SourceType.UNKNOWN ? "?" : (sourceType as string);

  return (
    <span
      className="text-xs font-semibold px-dt-2 py-1 rounded-dt-sm font-mono uppercase tracking-wide"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {label}
    </span>
  );
}
