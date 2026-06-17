import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b8ccff",
          300: "#8aa9ff",
          400: "#5b80ff",
          500: "#3658f5",
          600: "#2541d1",
          700: "#1d33a8",
          800: "#1b2c82",
          900: "#1a2868",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f6f7fb",
          border: "#e4e7ec",
        },
        ink: {
          900: "#0f1222",
          700: "#3a3f55",
          500: "#6b7080",
        },
        danger: {
          50: "#fef2f2",
          500: "#e23b3b",
          600: "#c92e2e",
        },
        success: {
          50: "#ecfdf5",
          500: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 18, 34, 0.04), 0 1px 8px -2px rgba(15, 18, 34, 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
