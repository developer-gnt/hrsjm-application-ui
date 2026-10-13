/**
 * ResourceDetailScreen
 *
 * Reusable detail page for the three "Useful Resources" cards.
 * A single component handles all three pages; content is driven by
 * ResourcePageContent data.
 *
 * Layout (top → bottom):
 *   1. HomeHeader  — back button + HRSJM logo + search/notification actions
 *   2. Scrollable body:
 *       a. Hero section      — pale-blue tint, large icon, title, description
 *       b. Highlight card    — circular icon, heading, description
 *       c. Section heading   — "What You'll Find" with gold underline
 *       d. 5 tappable rows
 *       e. Gold CTA button
 *   3. UserBottomNavigation (activeTab = 'rights')
 */
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { findResourcePageById } from '../data/resource-content';
import type { ResourcePageContent, ResourceItem } from '../data/resource-content';

/* ─────────────────────────────── Props ────────────────────────────────────── */

export interface ResourceDetailScreenProps {
  /** Stable resource ID, e.g. 'government-schemes'. */
  resourceId: string;
  onBack: () => void;
  onOpenRights: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onFileComplaint?: () => void;
}

/* ─────────────────────────── Sub-components ───────────────────────────────── */

const GOLD = '#D9A514';
const BLUE_BG = '#EAF0FF';
const BLUE_ICON = '#3B6FD4';
const NAVY = '#0B2F5B';
const SECONDARY = '#60728C';

/** Full-width hero with pale-blue tint, large icon, title and description. */
const HeroSection: React.FC<{ content: ResourcePageContent }> = ({
  content,
}) => (
  <View style={[styles.hero, { backgroundColor: content.accentColor }]}>
    {/* Decorative rings */}
    <View style={styles.heroRingOuter} />
    <View style={styles.heroRingInner} />

    {/* Left text block */}
    <View style={styles.heroLeft}>
      <Text
        style={styles.heroTitle}
        accessibilityRole="header"
        accessibilityLabel={content.title}
      >
        {content.title}
      </Text>
      <View style={styles.heroDivider} />
      <Text style={styles.heroDescription}>{content.description}</Text>
    </View>

    {/* Right icon bubble */}
    <View style={styles.heroIconWrap}>
      <AppIcon name={content.highlightIcon} size={50} color={BLUE_ICON} />
    </View>
  </View>
);

/** Prominent rounded card below the hero with icon, heading and description. */
const HighlightCard: React.FC<{ content: ResourcePageContent }> = ({
  content,
}) => (
  <View style={styles.highlightCard}>
    <View style={styles.highlightIcon}>
      <AppIcon name={content.highlightIcon} size={24} color={BLUE_ICON} />
    </View>
    <View style={styles.highlightCopy}>
      <Text style={styles.highlightHeading}>{content.highlightTitle}</Text>
      <Text style={styles.highlightDescription}>
        {content.highlightDescription}
      </Text>
    </View>
  </View>
);

/** Section heading with gold accent underline. */
const SectionHeading: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.sectionHeadingWrap}>
    <Text style={styles.sectionHeading}>{label}</Text>
    <View style={styles.sectionUnderline} />
  </View>
);

/** Single tappable content row. */
const ContentRow: React.FC<{
  item: ResourceItem;
  onPress: () => void;
  isLast: boolean;
}> = ({ item, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.contentRow, isLast && styles.contentRowLast]}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={`${item.title}. ${item.description}`}
    accessibilityHint="Shows more information"
  >
    {/* Icon bubble */}
    <View style={styles.rowIcon}>
      <AppIcon name={item.icon} size={20} color={BLUE_ICON} />
    </View>

    {/* Copy */}
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.rowSubtitle} numberOfLines={2}>
        {item.description}
      </Text>
    </View>

    {/* Chevron */}
    <View style={styles.rowChevron}>
      <AppIcon name="chevron-right" size={16} color={NAVY} />
    </View>
  </TouchableOpacity>
);

/* ──────────────────────────── Main Screen ─────────────────────────────────── */

export const ResourceDetailScreen: React.FC<ResourceDetailScreenProps> = ({
  resourceId,
  onBack,
  onOpenRights,
  onOpenHome,
  onOpenAbout,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
}) => {
  const content = findResourcePageById(resourceId);

  const showInfo = (title: string) => {
    Alert.alert(
      title,
      'Detailed information for this item is coming soon. Please contact HRSJM for further assistance.',
    );
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'rights') {
      onOpenRights();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  /* ── Not-found fallback ── */
  if (!content) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <HomeHeader onBack={onBack} onPressNotifications={() => undefined} />
        <View style={styles.errorState}>
          <AppIcon name="link" size={40} color={AdminColors.textMuted} />
          <Text style={styles.errorTitle}>Page not found</Text>
          <Text style={styles.errorBody}>
            This page could not be loaded. Please go back and try again.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader onBack={onBack} onPressNotifications={() => undefined} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Hero ── */}
        <HeroSection content={content} />

        {/* ── 2. Highlight card ── */}
        <View style={styles.section}>
          <HighlightCard content={content} />
        </View>

        {/* ── 3. What You'll Find ── */}
        <View style={styles.section}>
          <SectionHeading label={content.sectionHeading} />

          <View style={[styles.contentList, Shadows.card]}>
            {content.items.map((item, index) => (
              <ContentRow
                key={item.id}
                item={item}
                onPress={() => showInfo(item.title)}
                isLast={index === content.items.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── 4. CTA button ── */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => showInfo(content.ctaLabel)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={content.ctaLabel}
          >
            <AppIcon name={content.highlightIcon} size={18} color={NAVY} />
            <Text style={styles.ctaButtonText}>{content.ctaLabel} →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

/* ────────────────────────────── Styles ────────────────────────────────────── */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  /* ── Hero ── */
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    overflow: 'hidden',
    position: 'relative',
  },
  heroRingOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(59,111,212,0.12)',
    top: -40,
    right: -50,
  },
  heroRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(59,111,212,0.2)',
    top: 5,
    right: -5,
  },
  heroLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  heroTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: NAVY,
  },
  heroDivider: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: GOLD,
  },
  heroDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: SECONDARY,
  },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(59,111,212,0.15)',
    ...Shadows.cardMedium,
  },

  /* ── Shared section wrapper ── */
  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
  },

  /* ── Highlight card ── */
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg + 2,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: BLUE_BG + 'BB',
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: BLUE_BG,
  },
  highlightCopy: {
    flex: 1,
    minWidth: 0,
  },
  highlightHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: NAVY,
  },
  highlightDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: SECONDARY,
    marginTop: 2,
  },

  /* ── Section heading ── */
  sectionHeadingWrap: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 5,
  },
  sectionUnderline: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
  },

  /* ── Content list ── */
  contentList: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5EAF0',
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EAF0',
    gap: Spacing.md,
  },
  contentRowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: BLUE_BG,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: '#102F5A',
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 16,
    color: SECONDARY,
  },
  rowChevron: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* ── CTA button ── */
  ctaSection: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: BorderRadius.md,
    backgroundColor: GOLD,
    ...Shadows.card,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },

  /* ── Error state ── */
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
    color: AdminColors.textSecondary,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryDark,
  },
  errorButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
});
