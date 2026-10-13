/**
 * RightsCategoryDetailScreen
 *
 * Reusable detail page for each of the six Women's Rights key-area categories.
 * A single component handles all six pages; the rendered content is driven
 * entirely by the typed category data object.
 *
 * Layout (top → bottom):
 *   1. HomeHeader (back button + HRSJM logo + search/notification actions)
 *   2. Scrollable body:
 *       a. Hero section  — pastel gradient, large icon, title, subtitle
 *       b. Resource list — 5 rows with icon, title, subtitle, chevron
 *       c. CTA panel     — full-width call-to-action button
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
import { findCategoryById } from '../data/rights-category-content';
import type {
  RightsCategoryContent,
  RightsCategoryResource,
} from '../data/rights-category-content';

/* ─────────────────────────── Props ─────────────────────────── */

export interface RightsCategoryDetailScreenProps {
  /** Stable category ID, e.g. 'safety-protection'. */
  categoryId: string;
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

/* ─────────────────────────── Helpers ───────────────────────── */

const showInfoAlert = (title: string) => {
  Alert.alert(
    title,
    'Detailed information for this resource is coming soon. Please contact HRSJM for further assistance.',
  );
};

/* ─────────────────────────── Sub-components ────────────────── */

const HeroSection: React.FC<{ content: RightsCategoryContent }> = ({
  content,
}) => (
  <View style={[styles.hero, { backgroundColor: content.heroTint }]}>
    {/* Decorative circle rings */}
    <View
      style={[
        styles.heroRingOuter,
        { borderColor: content.accentColor + '22' },
      ]}
    />
    <View
      style={[
        styles.heroRingInner,
        { borderColor: content.accentColor + '33' },
      ]}
    />

    {/* Icon bubble */}
    <View
      style={[styles.heroIconBubble, { backgroundColor: content.iconBgColor }]}
    >
      <AppIcon
        name={content.heroIcon}
        size={44}
        color={content.accentColor}
      />
    </View>

    {/* Text */}
    <Text
      style={[styles.heroTitle, { color: '#0B2F5B' }]}
      accessibilityRole="header"
    >
      {content.title}
    </Text>
    <Text style={styles.heroSubtitle}>{content.subtitle}</Text>
  </View>
);

const ResourceRow: React.FC<{
  resource: RightsCategoryResource;
  iconBgColor: string;
  accentColor: string;
  onPress: () => void;
  isLast: boolean;
}> = ({ resource, iconBgColor, accentColor, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.resourceRow, isLast && styles.resourceRowLast]}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={`${resource.title}. ${resource.subtitle}`}
    accessibilityHint={
      resource.actionType === 'navigate'
        ? 'Opens the relevant screen'
        : 'Shows more information'
    }
  >
    {/* Icon container */}
    <View style={[styles.resourceIcon, { backgroundColor: iconBgColor }]}>
      <AppIcon name={resource.icon} size={20} color={accentColor} />
    </View>

    {/* Copy */}
    <View style={styles.resourceCopy}>
      <Text style={styles.resourceTitle} numberOfLines={1}>
        {resource.title}
      </Text>
      <Text style={styles.resourceSubtitle} numberOfLines={2}>
        {resource.subtitle}
      </Text>
    </View>

    {/* Chevron */}
    <View style={styles.resourceChevron}>
      <AppIcon name="chevron-right" size={16} color={AdminColors.primaryDark} />
    </View>
  </TouchableOpacity>
);

const CtaPanel: React.FC<{
  label: string;
  onPress: () => void;
  accentColor: string;
}> = ({ label, onPress, accentColor }) => (
  <View style={[styles.ctaPanel, { borderTopColor: accentColor + '22' }]}>
    <TouchableOpacity
      style={[styles.ctaButton, { backgroundColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.ctaButtonText}>{label}</Text>
      <AppIcon name="arrow-right" size={15} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
);

/* ─────────────────────────── Main screen ───────────────────── */

export const RightsCategoryDetailScreen: React.FC<
  RightsCategoryDetailScreenProps
> = ({
  categoryId,
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
  const content = findCategoryById(categoryId);

  const handleResourcePress = (resource: RightsCategoryResource) => {
    if (resource.actionType === 'navigate') {
      switch (resource.navigateTo) {
        case 'file-complaint':
          onFileComplaint?.() ?? showInfoAlert(resource.title);
          break;
        case 'user-help':
          onOpenHelp?.() ?? showInfoAlert(resource.title);
          break;
        case 'contact':
          onOpenContact?.() ?? showInfoAlert(resource.title);
          break;
        case 'user-events':
          onOpenEvents?.() ?? showInfoAlert(resource.title);
          break;
        default:
          showInfoAlert(resource.title);
      }
    } else {
      showInfoAlert(resource.title);
    }
  };

  const handleCtaPress = () => {
    if (!content) {
      return;
    }
    const { cta } = content;
    if (cta.actionType === 'navigate') {
      switch (cta.navigateTo) {
        case 'file-complaint':
          onFileComplaint?.() ?? showInfoAlert(cta.label);
          break;
        case 'user-help':
          onOpenHelp?.() ?? showInfoAlert(cta.label);
          break;
        case 'contact':
          onOpenContact?.() ?? showInfoAlert(cta.label);
          break;
        case 'user-events':
          onOpenEvents?.() ?? showInfoAlert(cta.label);
          break;
        default:
          showInfoAlert(cta.label);
      }
    } else {
      showInfoAlert(cta.label);
    }
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

  /* ── Not found fallback ── */
  if (!content) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <HomeHeader onBack={onBack} onPressNotifications={() => undefined} />
        <View style={styles.errorState}>
          <AppIcon
            name="shield-check"
            size={40}
            color={AdminColors.textMuted}
          />
          <Text style={styles.errorTitle}>Category not found</Text>
          <Text style={styles.errorBody}>
            This category could not be loaded. Please go back and try again.
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
        {/* ── Hero ── */}
        <HeroSection content={content} />

        {/* ── Resource list ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Resources</Text>
          <View style={[styles.resourceList, Shadows.card]}>
            {content.resources.map((resource, index) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                iconBgColor={content.iconBgColor}
                accentColor={content.accentColor}
                onPress={() => handleResourcePress(resource)}
                isLast={index === content.resources.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── CTA ── */}
        <CtaPanel
          label={content.cta.label}
          onPress={handleCtaPress}
          accentColor={content.accentColor}
        />
      </ScrollView>

      <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

/* ─────────────────────────── Styles ───────────────────────── */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  /* ── Hero ── */
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
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
    top: -30,
    right: -50,
  },
  heroRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    top: 10,
    right: -10,
  },
  heroIconBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    ...Shadows.cardMedium,
  },
  heroTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0B2F5B',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#60728C',
    maxWidth: 280,
  },

  /* ── Section ── */
  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: AdminColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  /* ── Resource list ── */
  resourceList: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5EAF0',
    overflow: 'hidden',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    minHeight: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EAF0',
    gap: Spacing.md,
  },
  resourceRowLast: {
    borderBottomWidth: 0,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resourceCopy: {
    flex: 1,
    minWidth: 0,
  },
  resourceTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#102F5A',
  },
  resourceSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#60728C',
  },
  resourceChevron: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* ── CTA ── */
  ctaPanel: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.cardMedium,
  },
  ctaButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Error/not-found state ── */
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
