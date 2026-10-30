import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { WHAT_WE_DO_IDS, type WhatWeDoActivity, type WhatWeDoId } from '../types/what-we-do.types';

export interface WhatWeDoDetailScreenProps {
  contentId: WhatWeDoId;
  onBack: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
  onOpenJoin?: () => void;
  onOpenWhatWeDo?: (contentId: WhatWeDoId) => void;
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
  onOpenJoin,
  onOpenWhatWeDo,
  showBottomNav = false,
  hideBottomNav = true,
}) => {
  const [activeContentId, setActiveContentId] = useState<WhatWeDoId>(contentId);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    setActiveContentId(contentId);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [contentId]);

  const content = getWhatWeDoContent(activeContentId);
  const { width } = useWindowDimensions();
  const heroHeight = Math.min(220, Math.max(190, width * 0.55));
  const [selectedActivity, setSelectedActivity] = useState<WhatWeDoActivity | null>(null);

  const handleSelectArea = (otherId: WhatWeDoId) => {
    setActiveContentId(otherId);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    onOpenWhatWeDo?.(otherId);
  };

  const otherWorkAreas = WHAT_WE_DO_IDS
    .filter(id => id !== activeContentId)
    .map(id => getWhatWeDoContent(id));

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
    } else if (
      content.ctaButtonLabel.toLowerCase().includes('join') ||
      content.ctaButtonLabel.toLowerCase().includes('movement') ||
      content.ctaButtonLabel.toLowerCase().includes('involved')
    ) {
      if (onOpenJoin) {
        onOpenJoin();
      } else {
        onOpenContact?.();
      }
    } else {
      onOpenContact?.();
    }
  };

  const handleParticipationPress = (item: { text: string; icon: any }) => {
    const textLower = item.text.toLowerCase();
    if (textLower.includes('attend') || textLower.includes('session') || textLower.includes('programme') || textLower.includes('training')) {
      onOpenEvents?.();
    } else if (textLower.includes('advocacy') || textLower.includes('rights') || textLower.includes('law')) {
      onOpenRights?.();
    } else if (textLower.includes('volunteer') || textLower.includes('participate') || textLower.includes('contribute')) {
      if (onOpenJoin) {
        onOpenJoin();
      } else {
        onOpenContact?.();
      }
    } else {
      onOpenContact?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        activeNav="what-we-do"
        onBack={onBack}
        showNotificationDot
        notificationDotColor={AdminColors.accentGold}
        onPressSearch={() => onOpenRights?.()}
      />
      <ScrollView
        ref={scrollRef}
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
              <TouchableOpacity
                key={activity.title}
                style={styles.activityCard}
                onPress={() => setSelectedActivity(activity)}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={activity.title}
              >
                <View style={styles.activityHeaderRow}>
                  <View style={styles.activityIcon}>
                    <AppIcon
                      name={activity.icon}
                      size={18}
                      color={AdminColors.primaryDark}
                    />
                  </View>
                  <View style={styles.activityArrow}>
                    <AppIcon
                      name="arrow-right"
                      size={12}
                      color={AdminColors.primaryDark}
                    />
                  </View>
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {activity.description}
                  </Text>
                </View>
              </TouchableOpacity>
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
              <TouchableOpacity
                key={item.text}
                style={styles.participationRow}
                onPress={() => handleParticipationPress(item)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={item.text}
              >
                <AppIcon
                  name={item.icon}
                  size={17}
                  color={AdminColors.primaryDark}
                />
                <Text style={styles.participationText}>{item.text}</Text>
                <View style={styles.participationArrow}>
                  <AppIcon
                    name="arrow-right"
                    size={12}
                    color={AdminColors.primaryDark}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Work Areas Grid */}
        <View style={styles.section}>
          <SectionHeading title="Explore Other Work Areas" />
          <View style={styles.otherAreasGrid}>
            {otherWorkAreas.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.otherAreaCard}
                onPress={() => handleSelectArea(item.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={styles.otherAreaIconWrap}>
                  <AppIcon name={item.whyIcon || 'users'} size={18} color={AdminColors.primaryDark} />
                </View>
                <View style={styles.otherAreaCopy}>
                  <Text style={styles.otherAreaTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.otherAreaDescription} numberOfLines={2}>
                    {item.heroDescription}
                  </Text>
                </View>
                <View style={styles.otherAreaArrow}>
                  <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
                </View>
              </TouchableOpacity>
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

      {/* Activity Detail Modal */}
      <Modal
        visible={Boolean(selectedActivity)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <AppIcon
                  name={selectedActivity?.icon || 'users'}
                  size={20}
                  color={AdminColors.primaryDark}
                />
              </View>
              <View style={styles.modalHeaderTitleWrap}>
                <Text style={styles.modalBadge}>HRSJM FIELD INITIATIVE</Text>
                <Text style={styles.modalTitle}>{selectedActivity?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedActivity(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <AppIcon name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                {selectedActivity?.description}
              </Text>

              <View style={styles.modalPillars}>
                <Text style={styles.modalSectionLabel}>Operational Scope & Implementation</Text>
                <View style={styles.modalBulletRow}>
                  <Text style={styles.modalBulletDot}>•</Text>
                  <Text style={styles.modalBulletText}>
                    Conducted in coordination with verified district coordinators and volunteer teams.
                  </Text>
                </View>
                <View style={styles.modalBulletRow}>
                  <Text style={styles.modalBulletDot}>•</Text>
                  <Text style={styles.modalBulletText}>
                    Free materials, legal references, and practical handbooks distributed to participants.
                  </Text>
                </View>
                <View style={styles.modalBulletRow}>
                  <Text style={styles.modalBulletDot}>•</Text>
                  <Text style={styles.modalBulletText}>
                    Direct escalation to HRSJM National Council for serious grievances identified during drives.
                  </Text>
                </View>
              </View>

              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.modalJoinBtn}
                  onPress={() => {
                    setSelectedActivity(null);
                    if (onOpenJoin) onOpenJoin();
                    else onOpenContact?.();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalJoinBtnText}>Get Involved / Volunteer</Text>
                  <AppIcon name="arrow-right" size={13} color="#06294D" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalContactBtn}
                  onPress={() => {
                    setSelectedActivity(null);
                    onOpenContact?.();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalContactBtnText}>Contact Regional Coordinator</Text>
                  <AppIcon name="arrow-right" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    ...StyleSheet.absoluteFill as any,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill as any,
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
    width: 24,
    height: 3,
    backgroundColor: AdminColors.accentGold,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
  },
  heroDescription: {
    marginTop: Spacing.xs,
    color: AdminColors.textOnDark,
    fontSize: 10,
    lineHeight: 14,
    opacity: 0.9,
  },
  section: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  sectionHeading: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  overview: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  activitySection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  activitySectionHeading: {
    marginBottom: Spacing.xs,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  activityCard: {
    width: '48.5%',
    minHeight: 88,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  activityHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  activityIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
  },
  activityArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    width: '100%',
  },
  activityTitle: {
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  activityDescription: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 9.5,
    lineHeight: 13,
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
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  participationText: {
    flex: 1,
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  participationArrow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(6, 39, 77, 0.4)',
  },
  ctaContent: {
    width: '77%',
    padding: Spacing.md,
  },
  ctaTitle: {
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
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
  otherAreasGrid: {
    gap: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  otherAreaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  otherAreaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  otherAreaCopy: {
    flex: 1,
  },
  otherAreaTitle: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: 2,
  },
  otherAreaDescription: {
    fontSize: 10.5,
    lineHeight: 14,
    color: AdminColors.textSecondary,
  },
  otherAreaArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 23, 44, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    elevation: 6,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF8E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalHeaderTitleWrap: {
    flex: 1,
  },
  modalBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    marginTop: 6,
  },
  modalDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
  },
  modalPillars: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: 6,
  },
  modalBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  modalBulletDot: {
    fontSize: 12,
    color: AdminColors.accentGold,
    marginRight: 6,
    lineHeight: 16,
  },
  modalBulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: '#475569',
  },
  modalActionButtons: {
    marginTop: 16,
    gap: 8,
  },
  modalJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAD465',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  modalJoinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06294D',
  },
  modalContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06294D',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  modalContactBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
