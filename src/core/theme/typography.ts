import { Platform, TextStyle } from 'react-native';

/**
 * HRSJM Design System Typography Tokens (Source of truth: docs/design.md §3)
 * - Playfair Display for editorial display headings and section introductions
 * - Inter for interface, buttons, labels, and functional body copy
 * - Caveat for decorative pull-quotes
 */
export const FontFamilies = {
  display: Platform.select({
    ios: 'Playfair Display',
    android: 'serif',
    web: 'NormalAmpersand, "Playfair Display", Georgia, "Times New Roman", serif',
    default: 'NormalAmpersand, "Playfair Display", Georgia, serif',
  }),
  serif: Platform.select({
    ios: 'Playfair Display',
    android: 'serif',
    web: 'NormalAmpersand, "Playfair Display", Georgia, "Times New Roman", serif',
    default: 'NormalAmpersand, "Playfair Display", Georgia, serif',
  }),
  sans: Platform.select({
    ios: 'Inter',
    android: 'sans-serif',
    web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'Inter, sans-serif',
  }),
  quote: Platform.select({
    ios: 'Caveat',
    android: 'cursive',
    web: 'NormalAmpersand, Caveat, cursive',
    default: 'NormalAmpersand, Caveat, cursive',
  }),
} as const;

export const UserFontFamilies = {
  heading: FontFamilies.display,
  serif: FontFamilies.serif,
  sans: FontFamilies.sans,
  quote: FontFamilies.quote,
} as const;

export const Typography = {
  // Hero headline (Playfair Display 600-700)
  display: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } as TextStyle,

  // Major section heading (Playfair Display 600-700)
  headingXl: {
    fontFamily: FontFamilies.display,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  } as TextStyle,

  // Section and page headings (Playfair Display 600-700)
  headingLg: {
    fontFamily: FontFamilies.display,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 27,
  } as TextStyle,

  // Card or subsection headings (Playfair Display 600)
  headingMd: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Large page heading (e.g. "Members", "Donations")
  pageTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  } as TextStyle,

  // Screen title for headers
  screenTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  } as TextStyle,

  // Section header for content groups
  sectionHeader: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
  } as TextStyle,

  // Card title
  cardTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,

  // Small uppercase letter-spaced eyebrow label
  eyebrow: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } as TextStyle,

  // Primary body text (Inter 400 14-16px / 1.5-1.7)
  body: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
  } as TextStyle,

  bodyMedium: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  } as TextStyle,

  bodyBold: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,

  // Button text (Inter 600-700 13-15px / 1.2)
  button: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  } as TextStyle,

  // Eyebrow and section labels (Inter 600-700 11-13px / 1.4; letter spacing 0.12-0.18em)
  label: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  } as TextStyle,

  // Small / Breadcrumbs and secondary details (Inter 400-500 12-13px / 1.4-1.5)
  small: {
    fontFamily: FontFamilies.sans,
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 18,
  } as TextStyle,

  // Secondary descriptions, captions, and breadcrumbs
  secondary: {
    fontFamily: FontFamilies.sans,
    fontSize: 12.5,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  secondaryMedium: {
    fontFamily: FontFamilies.sans,
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 18,
  } as TextStyle,

  badge: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.5,
  } as TextStyle,

  caption: {
    fontFamily: FontFamilies.sans,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
  } as TextStyle,

  // Statistic card value (Playfair Display 700)
  statValue: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,

  // Statistic card label
  statLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,

  // Decorative quotes (Caveat 500-600)
  quote: {
    fontFamily: FontFamilies.quote,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    fontStyle: 'italic',
  } as TextStyle,

  rowTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  metric: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,

  metricLarge: {
    fontFamily: FontFamilies.display,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,
} as const;

export const FontFamily = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'NormalAmpersand, "Playfair Display", Georgia, serif',
  quote: 'NormalAmpersand, "Caveat", cursive',
};
