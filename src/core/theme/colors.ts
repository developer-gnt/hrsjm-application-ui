/**
 * ============================================================================
 * HRSJM DESIGN SYSTEM COLOR TOKENS (Source of truth: docs/design.md)
 * ============================================================================
 * Deep navy-blue paired with warm ivory surfaces and warm golden yellow accents.
 * Use only the colors defined here across Admin, Member, Seeker, and User views.
 */
export const DesignTokens = {
  // Navy scale
  navy950: '#011F39', // Deepest hero backgrounds, dark overlays
  navy900: '#06294D', // Primary navy background and strong dark surfaces
  navy800: '#123F68', // Secondary navy surfaces and supporting graphics
  navy700: '#174A78', // Links or navy accents where the darkest navy is too strong

  // Pale blue panels and dividers
  blue100: '#EDF2F7', // Pale blue panels and subtle section backgrounds
  blue200: '#DBE5EE', // Light borders and dividers

  // Gold accent scale
  gold500: '#FAD465', // Main gold accent, navigation strip, prominent buttons
  gold600: '#E9B82E', // Gold emphasis on dark backgrounds and highlighted headline text
  gold700: '#C9971A', // Gold icons, fine rules, and decorative details
  goldSoft: '#FFF9E6', // Warm light gold surface/pill tint

  // Editorial surfaces
  ivory50: '#FAF7F0', // Main warm page background and editorial content sections
  white: '#FFFFFF', // Cards, navigation header, button text where applicable

  // Text tokens
  textPrimary: '#0B2F52', // Main headings and primary text on light surfaces
  textBody: '#34516D', // Paragraphs and descriptive text
  textMuted: '#718096', // Secondary descriptions, breadcrumbs, helper text
  textOnDark: '#FFFFFF', // High-contrast text on navy surfaces

  // Outlines, dividers & overlays
  border: '#DCE4EC', // Card outlines, separators, input borders
  divider: '#DBE5EE', // Fine group and section separators
  overlay: '#031B31', // Image overlays; use with transparency over photography

  // Semantic status tokens (dignified nonprofit palette)
  statusSuccess: '#16A34A',
  statusSuccessLight: '#EAF7EE',
  statusWarning: '#D97706',
  statusWarningLight: '#FEF6E7',
  statusDanger: '#DC2626',
  statusDangerLight: '#FDEEEF',
  statusInfo: '#174A78',
  statusInfoLight: '#EDF2F7',
} as const;

export type DesignTokenKey = keyof typeof DesignTokens;

/**
 * Exact CSS color token names from docs/design.md §2 & §13
 */
export const ColorTokens = {
  'color-navy-950': DesignTokens.navy950,
  'color-navy-900': DesignTokens.navy900,
  'color-navy-800': DesignTokens.navy800,
  'color-navy-700': DesignTokens.navy700,
  'color-blue-100': DesignTokens.blue100,
  'color-blue-200': DesignTokens.blue200,
  'color-gold-500': DesignTokens.gold500,
  'color-gold-600': DesignTokens.gold600,
  'color-gold-700': DesignTokens.gold700,
  'color-ivory-50': DesignTokens.ivory50,
  'color-white': DesignTokens.white,
  'color-text-primary': DesignTokens.textPrimary,
  'color-text-body': DesignTokens.textBody,
  'color-text-muted': DesignTokens.textMuted,
  'color-border': DesignTokens.border,
  'color-overlay': DesignTokens.overlay,
} as const;

/**
 * Universal application colors consumed throughout Admin, Member, Seeker, and User views.
 */
export const AdminColors = {
  // Primary & Secondary Brand Colors
  primary: DesignTokens.navy900, // #06294D
  primaryDark: DesignTokens.navy950, // #011F39
  primaryLight: DesignTokens.blue100, // #EDF2F7

  // Accent Colors
  accentGold: DesignTokens.gold500, // #FAD465
  accentGoldDark: DesignTokens.gold600, // #E9B82E
  accentGoldIcon: DesignTokens.gold700, // #C9971A
  accentGoldLight: DesignTokens.goldSoft, // #FFF9E6
  accentPurple: DesignTokens.navy700, // Normalized to navy accent per design.md rules
  accentPurpleLight: DesignTokens.blue100,

  // Status Colors
  statusActive: DesignTokens.statusSuccess,
  statusActiveLight: DesignTokens.statusSuccessLight,

  statusExpiring: DesignTokens.statusWarning,
  statusExpiringLight: DesignTokens.statusWarningLight,

  statusInactive: DesignTokens.statusDanger,
  statusInactiveLight: DesignTokens.statusDangerLight,

  statusPending: DesignTokens.statusInfo,
  statusPendingLight: DesignTokens.statusInfoLight,

  // Backgrounds & Surfaces
  background: DesignTokens.ivory50, // #FAF7F0 (Main warm editorial background)
  cardSurface: DesignTokens.white, // #FFFFFF (Cards & contained surfaces)
  headerBg: DesignTokens.navy900, // #06294D (Primary dark header surface)

  // Text Colors
  textPrimary: DesignTokens.textPrimary, // #0B2F52
  textSecondary: DesignTokens.textBody, // #34516D
  textMuted: DesignTokens.textMuted, // #718096
  textOnDark: DesignTokens.textOnDark, // #FFFFFF

  // Navigation Colors
  navActive: DesignTokens.gold600, // #E9B82E
  navInactive: DesignTokens.textMuted, // #718096
  navBg: DesignTokens.white,
  navBorder: DesignTokens.divider, // #DBE5EE

  // Borders & Dividers
  border: DesignTokens.border, // #DCE4EC
  divider: DesignTokens.divider, // #DBE5EE

  // Feedback Colors
  error: DesignTokens.statusDanger,
  errorLight: DesignTokens.statusDangerLight,
  success: DesignTokens.statusSuccess,
  successLight: DesignTokens.statusSuccessLight,
  warning: DesignTokens.statusWarning,
  warningLight: DesignTokens.statusWarningLight,
  info: DesignTokens.statusInfo,
  infoLight: DesignTokens.statusInfoLight,

  // Shimmer / Skeletons
  shimmerHighlight: DesignTokens.ivory50,
  shimmerBase: DesignTokens.border,
} as const;

export type ColorKeys = keyof typeof AdminColors;

/**
 * HRSJM Brand Palette — production brand direction calibrated against docs/design.md.
 */
export const BrandColors = {
  // Navy brand scale
  navy: DesignTokens.navy900, // #06294D
  navyDark: DesignTokens.navy950, // #011F39
  navyDeep: DesignTokens.navy950, // #011F39
  navySecondary: DesignTokens.navy800, // #123F68
  navyLight: DesignTokens.navy700, // #174A78
  softBlue: DesignTokens.blue100, // #EDF2F7

  // Gold accent
  gold: DesignTokens.gold500, // #FAD465
  goldDark: DesignTokens.gold600, // #E9B82E
  goldIcon: DesignTokens.gold700, // #C9971A
  goldSoft: DesignTokens.goldSoft, // #FFF9E6

  // Surfaces & text
  background: DesignTokens.ivory50, // #FAF7F0
  surface: DesignTokens.white, // #FFFFFF
  cardSurface: DesignTokens.white, // #FFFFFF
  border: DesignTokens.border, // #DCE4EC
  divider: DesignTokens.divider, // #DBE5EE
  textPrimary: DesignTokens.textPrimary, // #0B2F52
  textSecondary: DesignTokens.textBody, // #34516D
  textMuted: DesignTokens.textMuted, // #718096
  textOnDark: DesignTokens.textOnDark, // #FFFFFF

  // Semantic status
  success: DesignTokens.statusSuccess,
  warning: DesignTokens.statusWarning,
  danger: DesignTokens.statusDanger,
  info: DesignTokens.statusInfo,
} as const;

export type BrandColorKeys = keyof typeof BrandColors;

/**
 * Paired tone tokens (soft tint background + accessible dark text + solid fill)
 * for status pills, stat cards, avatars and tinted surfaces.
 */
export const StatusTones = {
  navy: {
    bg: DesignTokens.blue100,
    text: DesignTokens.navy900,
    solid: DesignTokens.navy900,
  },
  gold: {
    bg: DesignTokens.goldSoft,
    text: '#8F6600',
    solid: DesignTokens.gold600,
  },
  success: {
    bg: DesignTokens.statusSuccessLight,
    text: '#15803D',
    solid: DesignTokens.statusSuccess,
  },
  warning: {
    bg: DesignTokens.statusWarningLight,
    text: '#B45309',
    solid: DesignTokens.statusWarning,
  },
  danger: {
    bg: DesignTokens.statusDangerLight,
    text: '#B91C1C',
    solid: DesignTokens.statusDanger,
  },
  neutral: {
    bg: DesignTokens.blue100,
    text: DesignTokens.textBody,
    solid: DesignTokens.textBody,
  },
} as const;

export type StatusToneKey = keyof typeof StatusTones;
