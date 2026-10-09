import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
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
import { getWhatWeDoContent } from '../data/what-we-do-content';
import type { WhatWeDoId } from '../types/what-we-do.types';

export interface WhatWeDoDetailScreenProps {
  contentId: WhatWeDoId;
  onBack: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenRightsIndex?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
}

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeading}>{title}</Text>
);

export const WhatWeDoDetailScreen: React.FC<WhatWeDoDetailScreenProps> = ({
  contentId,
  onBack,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenRightsIndex,
  onOpenEvents,
  onOpenNews,
  onOpenContact,
}) => {
  const content = getWhatWeDoContent(contentId);
  const { width } = useWindowDimensions();
  const heroHeight = Math.min(220, Math.max(190, width * 0.55));

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    }
  };

  const handleCtaPress = () => {
    if (content.ctaDestination === 'rights') {
      if (onOpenRightsIndex) {
        onOpenRightsIndex();
      } else {
        onOpenRights?.();
      }
    } else {
      onOpenContact?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        showNotificationDot
        notificationDotColor={AdminColors.accentGold}
        onPressSearch={() => Alert.alert('Search', '"Search" is part of an upcoming phase.')}
        onPressNotifications={() =>
          Alert.alert('Notifications', '"Notifications" are part of an upcoming phase.')
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            source={content.heroImage}
            style={styles.heroImage}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.accentLine} />
            <Text style={styles.heroTitle}>{content.title}</Text>
            <Text style={styles.heroDescription}>{content.heroDescription}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Overview" />
          <Text style={styles.overview}>{content.overview}</Text>
        </View>

        <View style={styles.activitySection}>
          <View style={styles.activitySectionHeading}>
            <SectionHeading title="Our Key Activities" />
          </View>
          <View style={styles.activityGrid}>
            {content.activities.map(activity => (
              <View key={activity.title} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <AppIcon
                    name={activity.icon}
                    size={20}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Why It Matters" />
          <View style={styles.whyRow}>
            <View style={styles.whyIcon}>
              <AppIcon
                name={content.whyIcon}
                size={19}
                color={AdminColors.primaryDark}
              />
            </View>
            <Text style={styles.whyText}>{content.whyItMatters}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="How You Can Participate" />
          <View style={styles.participationList}>
            {content.participationItems.map(item => (
              <View key={item.text} style={styles.participationRow}>
                <AppIcon
                  name={item.icon}
                  size={17}
                  color={AdminColors.primaryDark}
                />
                <Text style={styles.participationText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <View style={styles.cta}>
            <Image
              source={content.ctaImage}
              style={styles.ctaImage}
              resizeMode="cover"
              accessible={false}
            />
            <View style={styles.ctaOverlay} />
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>{content.ctaTitle}</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleCtaPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={content.ctaButtonLabel}
              >
                <Text style={styles.ctaButtonText}>
                  {content.ctaButtonLabel}
                </Text>
                <AppIcon
                  name="arrow-right"
                  size={15}
                  color={AdminColors.primaryDark}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: AdminColors.primaryDark,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.2)',
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '72%',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  accentLine: {
    width: 28,
    height: 2,
    marginBottom: Spacing.sm,
    backgroundColor: AdminColors.accentGold,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
  },
  heroDescription: {
    marginTop: Spacing.sm,
    color: AdminColors.textOnDark,
    fontSize: 11,
    lineHeight: 15,
  },
  section: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
  },
  sectionHeading: {
    marginBottom: Spacing.xs,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  overview: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  activitySection: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.sm,
    padding: Spacing.xs,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.accentGoldLight,
  },
  activitySectionHeading: {
    marginHorizontal: Spacing.xs,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  activityCard: {
    width: '48.5%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  activityIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    color: AdminColors.primaryDark,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '700',
  },
  activityDescription: {
    marginTop: 3,
    color: AdminColors.textSecondary,
    fontSize: 8.5,
    lineHeight: 11,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  whyIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
  },
  whyText: {
    flex: 1,
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  participationList: {
    gap: Spacing.xs,
  },
  participationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 20,
  },
  participationText: {
    flex: 1,
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  ctaWrap: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.sm,
  },
  cta: {
    minHeight: 112,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BorderRadius.xl,
    backgroundColor: AdminColors.primaryDark,
    ...Shadows.card,
  },
  ctaImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '65%',
    height: '100%',
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.4)',
  },
  ctaContent: {
    width: '77%',
    padding: Spacing.md,
  },
  ctaTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  ctaButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGold,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
});
