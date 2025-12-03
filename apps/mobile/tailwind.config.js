/** @type {import('tailwindcss').Config} */
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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

