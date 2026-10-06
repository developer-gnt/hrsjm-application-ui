import { Platform, TextStyle } from 'react-native';

/**
 * System serif faces used by the user-facing Home reference (major section
 * headings and the hero headline). No custom font files ship with the app
 * yet; Georgia is preinstalled on iOS and `serif` resolves to Noto Serif on
 * Android. Replace with the brand font family once font assets are added.
 */
export const FontFamilies = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
} as const;

export const Typography = {
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,

  sectionHeader: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } as TextStyle,

  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  secondary: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  secondaryMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,

  badge: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  } as TextStyle,

  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  metric: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,

  metricLarge: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,

  caption: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
  } as TextStyle,
} as const;
