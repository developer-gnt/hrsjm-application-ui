export const AdminColors = {
  // Primary & Secondary Brand Colors
  primary: '#1B3F8F',
  primaryDark: '#0F2860',
  primaryLight: '#EBF1FF',

  // Accent Colors
  accentGold: '#C9A227',
  accentGoldLight: '#FFF8E6',
  accentPurple: '#8B5CF6',
  accentPurpleLight: '#F3EEFB',

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
