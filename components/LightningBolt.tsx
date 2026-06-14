// Dead Today — LightningBolt logo component.
// Source: Design System v0.2 §4. The EXACT canonical Grateful Dead bolt path.
// RULES (enforced here):
//   - Never modify path coordinates (viewBox 0 0 388 441)
//   - Fill only — never stroke
//   - Never rotate/skew/transform
//   - The only permitted change is fill color (via `fill` prop)

import React from "react";

// The one and only path. Do not edit these coordinates.
const BOLT_PATH =
  "M 58.0,437.5 L 55.5,437.0 L 105.5,332.0 L 50.5,333.0 L 119.5,268.0 " +
  "L 55.5,268.0 L 160.5,187.0 L 87.5,190.0 L 205.5,116.0 L 149.0,102.5 " +
  "L 238.5,58.0 L 221.0,48.5 L 316.0,2.5 L 285.5,69.0 L 334.5,63.0 " +
  "L 260.5,132.0 L 336.5,140.0 L 242.5,208.0 L 324.5,207.0 L 219.5,277.0 " +
  "L 292.5,282.0 L 187.0,337.5 L 187.0,341.5 L 220.5,351.0 L 142.5,384.0 " +
  "L 163.0,396.5 L 58.0,437.5 Z";

export type BoltVariant =
  | "standalone" // bolt, transparent bg
  | "app-icon" // bolt on rounded-rect void-black
  | "circle"; // bolt inside dark circle w/ red stroke

export interface LightningBoltProps {
  /** Fill color. Default Stealie red. Use "currentColor" to inherit. */
  fill?: string;
  /** Rendered size in px (width; height scales to viewBox ratio). */
  size?: number;
  variant?: BoltVariant;
  className?: string;
  title?: string;
}

const RED = "#C8102E";
const BLACK = "#1A1A1A";
const BONE = "#F5F0E8";

export function LightningBolt({
  fill = RED,
  size = 32,
  variant = "standalone",
  className,
  title = "Dead Today",
}: LightningBoltProps) {
  const ratio = 441 / 388;
  const height = Math.round(size * ratio);

  if (variant === "app-icon") {
    // Rounded rect (rx=80 at 388×441 scale), bolt red on void black.
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 388 441"
        width={size}
        height={height}
        className={className}
        role="img"
        aria-label={title}
      >
        <rect x="0" y="0" width="388" height="441" rx="80" fill={BLACK} />
        <path d={BOLT_PATH} fill={fill === "currentColor" ? RED : fill} />
      </svg>
    );
  }

  if (variant === "circle") {
    // Bone bolt inside dark circle with red stroke; viewBox expanded to show ring.
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-10 -10 408 461"
        width={size}
        height={height}
        className={className}
        role="img"
        aria-label={title}
      >
        <circle cx="194" cy="220.5" r="218" fill={BLACK} stroke={RED} strokeWidth="6" />
        <path d={BOLT_PATH} fill={fill === RED ? BONE : fill} />
      </svg>
    );
  }

  // standalone
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 388 441"
      width={size}
      height={height}
      className={className}
      role="img"
      aria-label={title}
    >
      <path d={BOLT_PATH} fill={fill} />
    </svg>
  );
}

export default LightningBolt;
