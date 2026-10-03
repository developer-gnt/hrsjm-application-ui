import { Platform } from 'react-native';

// Admin design system tokens.
// Palette locked to the approved design (Donation Seekers mockup, Oct 2026).
export const colors = {
  primary: '#1B3B8C',
  primaryDark: '#0F2860',
  primaryLight: '#E9F0FC',
  accentGold: '#F0A12F',

  active: '#23A45F',
  warning: '#F5A623',
  danger: '#E5484D',
  info: '#3D6FE8',

  background: '#F7F8FB',
  card: '#FFFFFF',

  textPrimary: '#16274B',
  textSecondary: '#6B7280',
  textMuted: '#9AA3B2',

  border: '#E9EBF2',
  divider: '#EEF0F5',

  white: '#FFFFFF',

  // Approved-design accents
  periwinkle: '#7688D8',
  goldText: '#C08A00',
  goldSoft: '#FDF4DE',
  greenSoft: '#E7F6EE',
  redSoft: '#FDECEC',
  blueSoft: '#EAF1FE',
  viewBlue: '#2F6FEC',
  tableHeader: '#F8F9FC',
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

// The approved design uses a serif display face for the wordmark, page
// titles and stat numbers. Georgia is available on iOS out of the box;
// Android maps the generic 'serif' family to Noto Serif.
export const fontSerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
}) as string;

export const serif = { fontFamily: fontSerif } as const;

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
  gold: { bg: '#FDF0CE', fg: '#A67B08' },
};
