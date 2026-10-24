import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Spacing } from '../../../../core/theme/spacing';

/**
 * ============================================================================
 * ABOUT PAGE DESIGN SYSTEM (spec Phase 2, corrected against the
 * high-resolution approved reference)
 * ============================================================================
 *
 * Source of truth: the approved About HRSJM reference design + spec §3.
 * Values that already exist in the shared core theme (Spacing scale) are
 * reused, not duplicated. These tokens are scoped to the About feature on
 * purpose: the admin app tokens (AdminColors / BrandColors) stay untouched.
 *
 * Fonts: the repo ships no font files (no .ttf/.otf/.woff, no fontFamily
 * anywhere — re-verified during the correction pass), so no font asset can be
 * loaded. The reference's serif display headings are reproduced with the
 * platforms' built-in serif faces (Georgia on iOS, Noto Serif via the generic
 * 'serif' family on Android, Georgia on web) — zero new dependencies, no fake
 * weights (serif families expose real 400/700 + italics). Body text stays on
 * the system sans-serif. See docs/HRSJM_About_Implementation_Map.md (A1).
 */

/** Built-in serif stack for display/headings (Playfair Display on web, Georgia on iOS, serif on Android). */
export const AboutFonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: "'NormalAmpersand', 'Playfair Display', Georgia, 'Times New Roman', serif",
    default: "'NormalAmpersand', 'Playfair Display', Georgia, 'Times New Roman', serif",
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  quote: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: "'NormalAmpersand', 'Caveat', 'Playfair Display', cursive, serif",
    default: "'NormalAmpersand', 'Caveat', 'Playfair Display', cursive, serif",
  }),
} as const;

/** Spec §2 & docs/design.md tokens. */
export const AboutColors = {
  primaryNavy: '#06294D',
  secondaryNavy: '#123F68',
  navy950: '#011F39',
  navy700: '#174A78',
  accentGold: '#FAD465',
  accentGoldDark: '#E9B82E',
  goldSoft: '#FFF9E6',

  /** Page background (design.md: color-ivory-50). */
  offWhite: '#FAF7F0',
  /** Card surfaces. */
  warmCream: '#FAF7F0',
  surface: '#FFFFFF',

  bodyText: '#34516D',
  mutedText: '#718096',
  border: '#DCE4EC',
  /** Light neutral chip / pale blue (color-blue-100). */
  softChip: '#EDF2F7',

  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.78)',
  textOnGold: '#011F39',

  /** Hero/CTA image overlay treatment per design.md (color-overlay: #031B31 / rgba(3, 27, 49, 0.65)). */
  scrim: 'rgba(3, 27, 49, 0.65)',
} as const;

export type AboutColorKey = keyof typeof AboutColors;

/**
 * Card/block radii per design.md Section 8:
 * Cards: 10–14px (standard 12px), Buttons: 12px, Hero/Banners: 20px.
 */
export const AboutRadius = {
  sm: 8,
  md: 12,
  lg: 12,
  xl: 20,
  pill: 9999,
} as const;

/**
 * Page layout metrics. Gutter 16 matches the reference margins and
 * Spacing.base (spec range 16–24); the content column caps at the spec's
 * ~1180px desktop width so the web preview renders a centered column.
 */
export const AboutLayout = {
  contentMaxWidth: 1180,
  gutter: Spacing.base,
  sectionGap: Spacing.xxl,
  blockGap: Spacing.base,
} as const;

/**
 * Typography hierarchy. Serif faces are applied to display/headings/quote per
 * the reference; body/UI text stays on the system sans-serif. Colors are
 * applied by the screens, not baked in (same convention as core Typography).
 */
export const AboutTypography = {
  /** Stacked hero words: "People. Rights. Justice. Change." */
  heroDisplay: {
    fontFamily: AboutFonts.serif,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
  } as TextStyle,

  /** Supporting line inside the hero. */
  heroCaption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  } as TextStyle,

  /** Section headings (serif per reference): "Who We Are", "Leadership", … */
  pageTitle: {
    fontFamily: AboutFonts.serif,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 29,
  } as TextStyle,

  /** Intro line under a section heading. */
  sectionLead: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  } as TextStyle,

  /** Mission/Vision card titles. */
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  } as TextStyle,

  /** Value-card titles (2-across grid). */
  valueTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  } as TextStyle,

  /** Value-card descriptions. */
  valueBody: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  } as TextStyle,

  /** Paragraph copy. */
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,

  /** Pull-quote (serif italic per reference). */
  quote: {
    fontFamily: AboutFonts.serif,
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 24,
  } as TextStyle,

  /** CTA button label. */
  button: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  } as TextStyle,

  /** CTA supporting line. */
  ctaBody: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  } as TextStyle,

  /** Leadership card name. */
  leaderName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  } as TextStyle,

  /** Leadership card role. */
  leaderRole: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  /** Captions / meta. */
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
} as const;

/**
 * Shared section primitives composed by every About section (Phases 3–10).
 * The page background is off-white; content cards are warm cream (reference).
 */
export const AboutStyles = StyleSheet.create({
  /** Centered content column: capped desktop width + gutter. */
  section: {
    width: '100%',
    maxWidth: AboutLayout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: AboutLayout.gutter,
    marginTop: AboutLayout.sectionGap,
  } as ViewStyle,

  /** Warm cream card (values / mission / vision). */
  card: {
    backgroundColor: AboutColors.warmCream,
    borderRadius: AboutRadius.lg,
    padding: Spacing.base,
  } as ViewStyle,

  /** White bordered card (leadership). */
  cardBordered: {
    backgroundColor: AboutColors.surface,
    borderRadius: AboutRadius.lg,
    borderWidth: 1,
    borderColor: AboutColors.border,
    padding: Spacing.base,
  } as ViewStyle,

  /** Soft gold pull-quote card. */
  quoteCard: {
    backgroundColor: AboutColors.goldSoft,
    borderRadius: AboutRadius.lg,
    padding: Spacing.base,
  } as ViewStyle,

  /** 1px rule (kept for potential dividers). */
  divider: {
    height: 1,
    backgroundColor: AboutColors.border,
  } as ViewStyle,
});
