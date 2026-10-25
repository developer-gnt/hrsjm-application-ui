/**
 * Spacing and Layout Tokens (Source of truth: docs/design.md §4 & §8)
 * 8px spacing system, restrained 12px radii, and subtle navy shadows.
 */
export const Spacing = {
  none: 0,
  space1: 4,  // space-1 (4px)
  space2: 8,  // space-2 (8px)
  space3: 12, // space-3 (12px)
  space4: 16, // space-4 (16px)
  space5: 24, // space-5 (24px)
  space6: 32, // space-6 (32px)
  space7: 48, // space-7 (48px)
  space8: 64, // space-8 (64px)
  space9: 80, // space-9 (80px)
  space10: 96,// space-10 (96px)
  containerWidth: 1200, // --container-width: 1200px (docs/design.md §4)

  // Standard aliases for component reuse
  xs: 4,      // space-1 (4px)
  sm: 8,      // space-2 (8px)
  md: 12,     // space-3 (12px)
  base: 16,   // space-4 (16px)
  lg: 20,
  xl: 24,     // space-5 (24px)
  xxl: 32,    // space-6 (32px)
  xxxl: 48,   // space-7 (48px)
} as const;

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  input: 10,  // standard form input border radius
  lg: 12,     // 10-14px standard card and button radius (docs/design.md §8)
  card: 12,   // --radius-card: 12px
  button: 12, // --radius-button: 12px
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMedium: {
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  floating: {
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

