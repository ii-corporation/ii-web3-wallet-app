/**
 * Colors for programmatic use only
 *
 * IMPORTANT: For styling, prefer NativeWind/Tailwind classes:
 * - className="text-slate-800" instead of style={{ color: colors.slate[800] }}
 * - className="bg-primary-100" instead of style={{ backgroundColor: colors.primary[100] }}
 *
 * Use these constants only when:
 * 1. Passing colors to components (icons, SVGs, charts)
 * 2. Using with LinearGradient
 * 3. Dynamic color calculations
 */

export const colors = {
  // Primary brand colors - for icons, gradients, charts
  primary: {
    start: "#9C2CF3",  // Gradient start (purple)
    end: "#3A6FF9",    // Gradient end (blue)
    main: "#AD42FF",   // Solid primary color
  },

  // Common icon/text colors that need programmatic access
  icon: {
    default: "#64748B",  // slate-500
    dark: "#1E293B",     // slate-800
    light: "#475569",    // slate-600
  },

  // Border colors for style prop (shadows need inline styles)
  border: {
    light: "#E2E8F0",    // slate-200
    subtle: "rgba(226, 232, 240, 0.5)",
  },

  // Overlay for blur views
  overlay: {
    light: "rgba(248, 250, 252, 0.8)",
    dark: "rgba(15, 23, 42, 0.8)",
  },
} as const;
