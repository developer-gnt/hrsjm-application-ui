// Admin design system tokens (approved HRSJM admin palette)
export const colors = {
  primary: '#1B3F8F',
  primaryDark: '#0F2860',
  primaryLight: '#EBF1FF',
  accentGold: '#C9A227',

  active: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  background: '#F5F7FA',
  card: '#FFFFFF',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  divider: '#F1F5F9',

  white: '#FFFFFF',
} as const;

export const typography = {
  screenTitle: { fontSize: 22, fontWeight: '700' as const },
  sectionHeader: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  secondary: { fontSize: 12, fontWeight: '400' as const },
  badge: { fontSize: 11, fontWeight: '500' as const },
  button: { fontSize: 15, fontWeight: '600' as const },
  metric: { fontSize: 20, fontWeight: '700' as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  round: 999,
} as const;

export type StatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'gold';

export const toneColors: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: '#D1FAE5', fg: '#047857' },
  info: { bg: '#DBEAFE', fg: '#1D4ED8' },
  warning: { bg: '#FEF3C7', fg: '#B45309' },
  danger: { bg: '#FEE2E2', fg: '#B91C1C' },
  neutral: { bg: '#E2E8F0', fg: '#334155' },
  gold: { bg: '#F5EBD0', fg: '#8A6D14' },
};
