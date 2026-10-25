import { Platform } from 'react-native';
import { DesignTokens } from './colors';

// Design system tokens calibrated to docs/design.md.
export const colors = {
  primary: DesignTokens.navy900, // #06294D
  primaryDark: DesignTokens.navy950, // #011F39
  primaryLight: DesignTokens.blue100, // #EDF2F7
  accentGold: DesignTokens.gold500, // #FAD465
  goldDark: DesignTokens.gold600, // #E9B82E
  goldIcon: DesignTokens.gold700, // #C9971A

  active: DesignTokens.statusSuccess,
  warning: DesignTokens.statusWarning,
  danger: DesignTokens.statusDanger,
  info: DesignTokens.statusInfo,

  background: DesignTokens.ivory50, // #FAF7F0
  card: DesignTokens.white, // #FFFFFF

  textPrimary: DesignTokens.textPrimary, // #0B2F52
  textSecondary: DesignTokens.textBody, // #34516D
  textMuted: DesignTokens.textMuted, // #718096

  border: DesignTokens.border, // #DCE4EC
  divider: DesignTokens.divider, // #DBE5EE

  white: DesignTokens.white,

  // Approved-design accents
  periwinkle: DesignTokens.navy700,
  goldText: '#8F6600',
  goldSoft: DesignTokens.goldSoft,
  greenSoft: DesignTokens.statusSuccessLight,
  redSoft: DesignTokens.statusDangerLight,
  blueSoft: DesignTokens.blue100,
  viewBlue: DesignTokens.navy700,
  tableHeader: DesignTokens.ivory50,
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

// The approved design uses Playfair Display / serif for headlines, page titles, and stats.
export const fontSerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: "'NormalAmpersand', 'Playfair Display', Georgia, serif",
  default: "'NormalAmpersand', serif",
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
  md: 12, // 12px standard card and button radius per design.md
  lg: 16,
  round: 999,
} as const;

export type StatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'gold';

export const toneColors: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: DesignTokens.statusSuccessLight, fg: '#15803D' },
  info: { bg: DesignTokens.blue100, fg: DesignTokens.navy900 },
  warning: { bg: DesignTokens.statusWarningLight, fg: '#B45309' },
  danger: { bg: DesignTokens.statusDangerLight, fg: '#B91C1C' },
  neutral: { bg: DesignTokens.blue100, fg: DesignTokens.textBody },
  gold: { bg: DesignTokens.goldSoft, fg: '#8F6600' },
};
