import type { Config } from "tailwindcss";

// Design tokens map 1:1 to Design System v0.2 §9.
// Components reference these via utility classes — never hardcode hex.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dt: {
          black: "#1A1A1A",
          surface: "#2C2C2C",
          raised: "#3D3D3D",
          bone: "#F5F0E8",
          red: "#C8102E",
          "red-deep": "#8B0000",
          "text-primary": "#F5F0E8",
          "text-muted": "#888888",
          "text-subtle": "#555555",
        },
        // Source-type badges (Design System §2.2)
        sbd: { bg: "#1A3D1A", text: "#6FCF6F" },
        aud: { bg: "#3D2E0A", text: "#F0A030" },
        fm: { bg: "#0E2A3D", text: "#4A90D9" },
        matrix: { bg: "#2A1040", text: "#9B59B6" },
        // UI semantic (§2.3)
        ok: "#27AE60",
        warn: "#F0A030",
        danger: "#C8102E",
        info: "#4A90D9",
      },
      fontFamily: {
        display: ["var(--font-display)", "Barlow Condensed", "sans-serif"],
        ui: ["var(--font-ui)", "Inter", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      borderColor: {
        dt: "rgba(255,255,255,0.10)",
      },
      borderRadius: {
        "dt-sm": "4px",
        "dt-md": "6px",
        "dt-lg": "10px",
        "dt-xl": "16px",
      },
      spacing: {
        "dt-1": "4px",
        "dt-2": "8px",
        "dt-3": "12px",
        "dt-4": "16px",
        "dt-6": "24px",
        "dt-10": "40px",
      },
      keyframes: {
        "dt-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        // Skeleton loaders — Design System §7 (1.4s ease-in-out infinite)
        "dt-pulse": "dt-pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
