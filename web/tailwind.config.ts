import type { Config } from "tailwindcss";

/**
 * Semantic color tokens mirror the mobile app's constants/colors.ts.
 * Theme-dependent tokens (background/surface/border/text) resolve from CSS
 * variables set in globals.css; accent colors are fixed across light + dark.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        primary: "#6366F1",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        priority: {
          high: "#EF4444",
          medium: "#F59E0B",
          low: "#6B7280",
        },
      },
      borderRadius: {
        card: "14px",
        sheet: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
