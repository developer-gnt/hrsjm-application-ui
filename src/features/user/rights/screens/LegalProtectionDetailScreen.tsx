/**
 * LegalProtectionDetailScreen
 *
 * Reusable detail page for the four "Know Your Legal Protections" cards on
 * the Women's Rights page. A single component handles all four pages; content
 * is driven entirely by the typed LegalProtectionContent data object.
 *
 * Layout (top → bottom):
 *   1. HomeHeader  — back button + HRSJM logo + search/notification actions
 *   2. Scrollable body:
 *       a. Hero section       — pastel tint, large icon, title, description
 *       b. Highlight card     — circular icon, heading, description
 *       c. "Key Protections"  — gold-underline heading + 5 tappable rows
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
import {
  findLegalProtectionById,
} from '../data/legal-protection-data';
import type {
  LegalProtectionContent,
  LegalProtectionItem,
} from '../data/legal-protection-data';

/* ─────────────────────────────── Props ────────────────────────────────────── */

export interface LegalProtectionDetailScreenProps {
  /** Stable protection ID, e.g. 'constitutional-equality'. */
  protectionId: string;
  onBack: () => void;
  onOpenRights: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onFileComplaint?: () => void;
  onOpenHelp?: () => void;
}

/* ─────────────────────────── Sub-components ───────────────────────────────── */

/** Full-width hero with pastel tint, decorative rings, large icon and copy. */
const HeroSection: React.FC<{ content: LegalProtectionContent }> = ({
  content,
}) => (
  <View style={[styles.hero, { backgroundColor: content.heroTint }]}>
    {/* Decorative ring — outer */}
    <View
      style={[
        styles.heroRingOuter,
        { borderColor: content.accentColor + '22' },
      ]}
    />
    {/* Decorative ring — inner */}
    <View
      style={[
        styles.heroRingInner,
        { borderColor: content.accentColor + '33' },
      ]}
    />

    {/* Left text block */}
    <View style={styles.heroLeft}>
      <Text
        style={styles.heroTitle}
        accessibilityRole="header"
        accessibilityLabel={content.title.replace('\n', ' ')}
      >
        {content.title}
      </Text>

      {/* Gold accent divider */}
      <View
        style={[styles.heroDivider, { backgroundColor: content.accentColor }]}
      />

      <Text style={styles.heroDescription}>{content.description}</Text>
    </View>

    {/* Right icon bubble */}
    <View
      style={[styles.heroIconWrap, { backgroundColor: content.iconBgColor }]}
    >
      <AppIcon name={content.heroIcon} size={50} color={content.accentColor} />
    </View>
  </View>
);

/** Prominent rounded card with icon, heading and description. */
const HighlightCard: React.FC<{ content: LegalProtectionContent }> = ({
  content,
}) => (
  <View
    style={[
      styles.highlightCard,
      { backgroundColor: content.iconBgColor + 'BB' },
    ]}
  >
    <View
      style={[styles.highlightIcon, { backgroundColor: content.iconBgColor }]}
    >
      <AppIcon
        name={content.highlightIcon}
        size={24}
        color={content.accentColor}
      />
    </View>
    <View style={styles.highlightCopy}>
      <Text style={[styles.highlightHeading, { color: '#0B2F5B' }]}>
        {content.highlightHeading}
      </Text>
      <Text style={styles.highlightDescription}>
        {content.highlightDescription}
      </Text>
    </View>
  </View>
);

/** Section heading with gold accent underline. */
const SectionHeading: React.FC<{
  label: string;
  accentColor: string;
}> = ({ label, accentColor }) => (
  <View style={styles.sectionHeadingWrap}>
    <Text style={styles.sectionHeading}>{label}</Text>
    <View style={[styles.sectionUnderline, { backgroundColor: accentColor }]} />
  </View>
);

/** Single tappable protection row. */
const ProtectionRow: React.FC<{
  item: LegalProtectionItem;
  iconBgColor: string;
  accentColor: string;
  onPress: () => void;
  isLast: boolean;
}> = ({ item, iconBgColor, accentColor, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.protectionRow, isLast && styles.protectionRowLast]}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={`${item.title}. ${item.subtitle}`}
    accessibilityHint="Shows more information"
  >
    {/* Icon bubble */}
    <View style={[styles.rowIcon, { backgroundColor: iconBgColor }]}>
      <AppIcon name={item.icon} size={20} color={accentColor} />
    </View>

    {/* Copy */}
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.rowSubtitle} numberOfLines={2}>
        {item.subtitle}
      </Text>
    </View>

    {/* Chevron */}
    <View style={styles.rowChevron}>
      <AppIcon name="chevron-right" size={16} color={AdminColors.primaryDark} />
    </View>
  </TouchableOpacity>
);

/* ──────────────────────────── Main Screen ─────────────────────────────────── */

export const LegalProtectionDetailScreen: React.FC<
  LegalProtectionDetailScreenProps
> = ({
  protectionId,
  onBack,
  onOpenRights,
  onOpenHome,
  onOpenAbout,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
  onFileComplaint,
  onOpenHelp,
}) => {
  const content = findLegalProtectionById(protectionId);

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
          <AppIcon name="shield-check" size={40} color={AdminColors.textMuted} />
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
        <View style={styles.highlightSection}>
          <HighlightCard content={content} />
        </View>

        {/* ── 3. Key Protections ── */}
        <View style={styles.keyProtectionsSection}>
          <SectionHeading
            label="Key Protections"
            accentColor={content.accentColor}
          />

          <View style={[styles.protectionList, Shadows.card]}>
            {content.protections.map((item, index) => (
              <ProtectionRow
                key={item.id}
                item={item}
                iconBgColor={content.iconBgColor}
                accentColor={content.accentColor}
                onPress={() => showInfo(item.title)}
                isLast={index === content.protections.length - 1}
              />
            ))}
          </View>
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
    top: -40,
    right: -50,
  },
  heroRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    top: 5,
    right: -5,
  },
  heroLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  heroTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#0B2F5B',
  },
  heroDivider: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  heroDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#60728C',
    maxWidth: 220,
  },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Shadows.cardMedium,
  },

  /* ── Highlight card ── */
  highlightSection: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg + 2,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    color: '#0B2F5B',
  },
  highlightDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#60728C',
    marginTop: 2,
  },

  /* ── Key Protections ── */
  keyProtectionsSection: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  sectionHeadingWrap: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0B2F5B',
    marginBottom: 5,
  },
  sectionUnderline: {
    width: 36,
    height: 3,
    borderRadius: 2,
  },
  protectionList: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5EAF0',
    overflow: 'hidden',
  },
  protectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EAF0',
    gap: Spacing.md,
  },
  protectionRowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    color: '#60728C',
  },
  rowChevron: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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