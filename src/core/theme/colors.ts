export const AdminColors = {
  // Primary & Secondary Brand Colors
  primary: '#1B3F8F',
  primaryDark: '#0F2860',
  primaryLight: '#EBF1FF',

  // Accent Colors
  accentGold: '#C9A227',
  accentGoldLight: '#FFF8E6',

  // Status Colors
  statusActive: '#10B981',
  statusActiveLight: '#E8F7F0',

  statusExpiring: '#F59E0B',
  statusExpiringLight: '#FFF3E6',

  statusInactive: '#EF4444',
  statusInactiveLight: '#FFF0F0',

  statusPending: '#3B82F6',
  statusPendingLight: '#EFF6FF',

  // Backgrounds & Surfaces
  background: '#F5F7FA',
  cardSurface: '#FFFFFF',
  headerBg: '#1B3F8F',

  // Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',

  // Navigation Colors
  navActive: '#1B3F8F',
  navInactive: '#94A3B8',
  navBg: '#FFFFFF',
  navBorder: '#E2E8F0',

  // Borders & Dividers
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Feedback Colors
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Shimmer / Skeletons
  shimmerHighlight: '#F8FAFC',
  shimmerBase: '#E2E8F0',
} as const;

export type ColorKeys = keyof typeof AdminColors;

/**
 * HRSJM Brand Palette — production brand direction.
 * Navy is the primary interactive/brand color; Gold is a sparing accent
 * (selected states, premium badges); green/amber/red are reserved for status meaning only.
 */
export const BrandColors = {
  // Navy brand scale
  navy: '#123B7A',
  navyDark: '#0B2854',
  navyDeep: '#071D3A',
  softBlue: '#EAF1FB',

  // Gold accent (sparing use)
  gold: '#D4A72C',
  goldDark: '#B88916',
  goldSoft: '#FFF6D9',

  // Surfaces & text
  background: '#F7F9FC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Semantic status
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
} as const;

export type BrandColorKeys = keyof typeof BrandColors;

/**
 * Paired tone tokens (soft tint background + accessible dark text + solid fill)
 * for status pills, stat cards, avatars and tinted surfaces. Single source of
 * truth so screens never hand-mix tints.
 */
export const StatusTones = {
  navy: {
    bg: BrandColors.softBlue,
    text: BrandColors.navy,
    solid: BrandColors.navy,
  },
  gold: {
    bg: BrandColors.goldSoft,
    text: BrandColors.goldDark,
    solid: BrandColors.gold,
  },
  success: {
    bg: '#E7F6EC',
    text: '#15803D',
    solid: BrandColors.success,
  },
  warning: {
    bg: '#FCF3E3',
    text: '#B45309',
    solid: BrandColors.warning,
  },
  danger: {
    bg: '#FCEBEB',
    text: '#B91C1C',
    solid: BrandColors.danger,
  },
  neutral: {
    bg: '#F1F5F9',
    text: BrandColors.textSecondary,
    solid: BrandColors.textSecondary,
  },
} as const;

export type StatusToneKey = keyof typeof StatusTones;
