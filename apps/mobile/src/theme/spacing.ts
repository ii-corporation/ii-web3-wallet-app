/**
 * Layout constants for programmatic use only
 *
 * IMPORTANT: For styling, prefer NativeWind/Tailwind classes:
 * - className="px-4" instead of style={{ paddingHorizontal: 16 }}
 * - className="gap-3" instead of style={{ gap: 12 }}
 *
 * Use these constants only when:
 * 1. Calculating dynamic dimensions
 * 2. Header heights for scroll offset
 * 3. Consistent screen padding for grid calculations
 */

export const layout = {
  // Screen padding - useful for grid calculations
  screen: {
    horizontal: 16,
  },

  // Header heights - useful for scroll content padding
  header: {
    default: 48,
    withTabs: 96,
    withSearch: 64,
  },

  // Grid gaps
  grid: {
    sm: 4,
    md: 8,
    lg: 12,
  },
} as const;

// Backwards compatibility
export const componentSpacing = {
  screen: layout.screen,
};
