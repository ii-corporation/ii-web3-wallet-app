/** @type {import('tailwindcss').Config} */

// Gradient color definitions for Tailwind CSS classes
// For components, import from src/theme/gradients.ts instead
const gradients = {
  primary: {
    start: "#9C2CF3",
    end: "#3A6FF9",
  },
};

module.exports = {
  darkMode: "class",
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary - Violet (from Figma)
        primary: {
          50: "#f5f3ff",
          100: "#f5f3ff",
          200: "#ddd6fe",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        // Semantic
        success: "#009d69",
        error: "#ee5261",
        // Accent
        lime: "#f1fc70",
        mint: "#27e7c4",
        // Background
        "bg-dark": "#111322",
        // Gradient colors (for reference in styles)
        "gradient-primary-start": gradients.primary.start,
        "gradient-primary-end": gradients.primary.end,
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
