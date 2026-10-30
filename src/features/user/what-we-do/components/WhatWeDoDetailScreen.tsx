import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  Shadows,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { getWhatWeDoContent } from '../data/what-we-do-content';
import type { WhatWeDoId } from '../types/what-we-do.types';
import { aboutService, type DynamicAreaItem } from '../../about/services/about.service';

export interface WhatWeDoDetailScreenProps {
  contentId: WhatWeDoId;
  onBack: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
  showBottomNav?: boolean;
  hideBottomNav?: boolean;
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
  onOpenEvents,
  onOpenNews,
  onOpenContact,
  showBottomNav = false,
  hideBottomNav = true,
}) => {
  const content = getWhatWeDoContent(contentId);
  const { width } = useWindowDimensions();
  const heroHeight = Math.min(220, Math.max(190, width * 0.55));

  const [dynamicData, setDynamicData] = useState<{ title: string; items: DynamicAreaItem[] }>({
    title: '',
    items: [],
  });
  const [loadingDynamic, setLoadingDynamic] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingDynamic(true);
    aboutService
      .getRelatedDynamicItems(contentId)
      .then(data => {
        if (isMounted) {
          setDynamicData(data);
          setLoadingDynamic(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingDynamic(false);
      });
    return () => {
      isMounted = false;
    };
  }, [contentId]);

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
      onOpenRights?.();
    } else {
      onOpenContact?.();
    }
  };

  const handleDynamicItemPress = (item: DynamicAreaItem) => {
    if (item.linkType === 'rights' && onOpenRights) {
      onOpenRights();
    } else if (item.linkType === 'events' && onOpenEvents) {
      onOpenEvents();
    } else if (item.linkType === 'news' && onOpenNews) {
      onOpenNews();
    } else if (item.linkType === 'causes' && onOpenContact) {
      onOpenContact();
    } else {
      Alert.alert(item.title, item.description || item.category || 'HRSJM Initiative');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        activeNav="what-we-do"
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

        {/* Dynamic Database Content Section */}
        {loadingDynamic ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={AdminColors.primaryDark} />
            <Text style={styles.loadingText}>Connecting live database resources...</Text>
          </View>
        ) : dynamicData.items.length > 0 ? (
          <View style={styles.dynamicSection}>
            <View style={styles.dynamicHeaderRow}>
              <Text style={styles.dynamicSectionTitle}>{dynamicData.title}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>Live Database</Text>
              </View>
            </View>
            <View style={styles.dynamicCardList}>
              {dynamicData.items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.dynamicCard}
                  onPress={() => handleDynamicItemPress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dynamicCardTop}>
                    {item.category ? (
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{item.category}</Text>
                      </View>
                    ) : null}
                    {item.date ? (
                      <Text style={styles.dynamicDate}>{item.date}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.dynamicCardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={styles.dynamicCardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <View style={styles.dynamicCardFooter}>
                    <Text style={styles.actionLabel}>
                      {item.actionLabel || 'View Details'}
                    </Text>
                    <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

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
      {showBottomNav && !hideBottomNav && (
        <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
      )}
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
    fontFamily: UserFontFamilies.heading,
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
    fontFamily: UserFontFamilies.heading,
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
    marginTop: Spacing.xs,
  },
  activityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
  },
  activityIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: AdminColors.accentGoldLight,
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
  },
  activityDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 9,
    lineHeight: 11,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.md,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 12,
    color: AdminColors.textSecondary,
  },
  dynamicSection: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
    padding: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  dynamicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dynamicSectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  dynamicCardList: {
    gap: 8,
  },
  dynamicCard: {
    padding: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  dynamicCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryPill: {
    backgroundColor: AdminColors.accentGoldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AdminColors.accentGold,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  dynamicDate: {
    fontSize: 10,
    color: AdminColors.textSecondary,
  },
  dynamicCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    lineHeight: 17,
  },
  dynamicCardDesc: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 14,
    color: AdminColors.textSecondary,
  },
  dynamicCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primaryLight,
  },
  whyIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: AdminColors.accentGoldLight,
  },
  whyText: {
    flex: 1,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  participationList: {
    gap: Spacing.xs,
  },
  participationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
  },
  participationText: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  ctaWrap: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
  },
  cta: {
    width: '100%',
    minHeight: 130,
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primaryDark,
  },
  ctaImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.45)',
  },
  ctaContent: {
    padding: Spacing.sm,
    justifyContent: 'center',
  },
  ctaTitle: {
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
