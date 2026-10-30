import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { AboutApproachSection } from '../components/AboutApproachSection';
import { AboutCoreValuesSection } from '../components/AboutCoreValuesSection';
import { AboutFinalCta } from '../components/AboutFinalCta';
import { AboutHero } from '../components/AboutHero';
import { AboutImpactSection } from '../components/AboutImpactSection';
import { AboutVisionMissionSection } from '../components/AboutVisionMissionSection';
import { AboutWhoWeAreSection } from '../components/AboutWhoWeAreSection';
import { AboutWorkGrid } from '../components/AboutWorkGrid';
import { HumanRightsMonitoringSection } from '../components/HumanRightsMonitoringSection';
import { ABOUT_CONTENT } from '../data/about-content';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppRoutes } from '../../../../core/constants/routes';
import type { AboutWorkArea } from '../types/about.types';
import { WhatWeDoDetailScreen, type WhatWeDoId } from '../../what-we-do';
import { aboutService, type DynamicAboutStats } from '../services/about.service';

export interface AboutScreenProps {
  onBack?: () => void;
  /** Navigate to an in-app route (used by the closing CTA). */
  onNavigate?: (target: string) => void;
  onOpenMyApplication?: () => void;
  onOpenStatus?: () => void;
  onOpenRights?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenWhatWeDo?: (contentId: WhatWeDoId) => void;
  showBottomNav?: boolean;
  useAdminHeader?: boolean;
}

const SectionHeading: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => (
  <View style={styles.sectionHeadingRow}>
    <View style={styles.sectionHeading}>
      <View style={styles.titleUnderline} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  onNavigate,
  onOpenMyApplication,
  onOpenStatus,
  onOpenRights,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
  onOpenWhatWeDo,
  showBottomNav = false,
  useAdminHeader = false,
}) => {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const monitoringOffset = useRef(0);
  const [selectedContentId, setSelectedContentId] = useState<WhatWeDoId | null>(null);
  const [dynamicStats, setDynamicStats] = useState<DynamicAboutStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    aboutService.getDynamicAboutStats().then(stats => {
      if (isMounted) {
        setDynamicStats(stats);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const dynamicWorkAreas = useMemo(() => {
    return ABOUT_CONTENT.workAreas.map(area => ({
      ...area,
      badge: dynamicStats?.areaBadges[area.id] || undefined,
    }));
  }, [dynamicStats]);

  const dynamicImpactContent = useMemo(() => {
    if (!dynamicStats) return ABOUT_CONTENT.impact;
    return {
      ...ABOUT_CONTENT.impact,
      stats: ABOUT_CONTENT.impact.stats.map(s => {
        if (s.id === 'communities') {
          return { ...s, value: dynamicStats.impactMetrics.communities };
        }
        if (s.id === 'people') {
          return { ...s, value: dynamicStats.impactMetrics.people };
        }
        if (s.id === 'rights-issues') {
          return { ...s, value: dynamicStats.impactMetrics.rightsIssues };
        }
        return s;
      }),
    };
  }, [dynamicStats]);

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `"${feature}" is part of an upcoming phase.`);
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onBack?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  const handleAreaPress = (area: AboutWorkArea) => {
    const pageIdMap: Record<string, WhatWeDoId> = {
      monitoring: 'human-rights-monitoring',
      'human-rights-monitoring': 'human-rights-monitoring',
      awareness: 'awareness-campaigns',
      'awareness-campaigns': 'awareness-campaigns',
      workshops: 'workshops-training',
      'workshops-training': 'workshops-training',
      community: 'community-activities',
      'community-activities': 'community-activities',
      leadership: 'leadership-development',
      'leadership-development': 'leadership-development',
      advocacy: 'advocacy-awareness',
      'advocacy-awareness': 'advocacy-awareness',
      research: 'research-rights-education',
      'research-rights-education': 'research-rights-education',
      legal: 'legal-rights-awareness',
      'legal-rights-awareness': 'legal-rights-awareness',
      other: 'other-work-areas',
      'other-work-areas': 'other-work-areas',
    };

    const pageId = pageIdMap[area.id] || (area.id as WhatWeDoId);
    if (onOpenWhatWeDo) {
      onOpenWhatWeDo(pageId);
    } else {
      setSelectedContentId(pageId);
    }
  };

  const handleMonitoringLayout = (event: LayoutChangeEvent) => {
    monitoringOffset.current = event.nativeEvent.layout.y;
  };

  if (selectedContentId) {
    return (
      <WhatWeDoDetailScreen
        contentId={selectedContentId}
        onBack={() => setSelectedContentId(null)}
        onOpenHome={() => {
          setSelectedContentId(null);
          onBack?.();
        }}
        onOpenAbout={() => setSelectedContentId(null)}
        onOpenRights={onOpenRights}
        onOpenEvents={onOpenEvents}
        onOpenNews={onOpenNews}
        onOpenContact={onOpenContact}
        showBottomNav={showBottomNav}
        hideBottomNav={!showBottomNav}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {useAdminHeader ? (
        <AdminHeader
          showBack={Boolean(onBack)}
          onBack={onBack}
          title={onBack ? 'About HRSJM' : undefined}
        />
      ) : (
        <HomeHeader
          activeNav="about"
          onBack={onBack}
          showNotificationDot
          notificationDotColor={AdminColors.accentGold}
          onOpenDonate={() => onNavigate?.('donations')}
          onPressSearch={() => onNavigate?.('search') || showComingSoon('Search')}
          onPressNotifications={() => onNavigate?.('notifications') || showComingSoon('Notifications')}
        />
      )}
      <ScrollView
        ref={scrollRef as any}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AboutHero content={ABOUT_CONTENT.hero} />

        <View style={styles.section}>
          <AboutWhoWeAreSection principles={ABOUT_CONTENT.principles} />
        </View>

        <View style={styles.section}>
          <AboutVisionMissionSection />
        </View>

        <View style={styles.section}>
          <SectionHeading
            title="What We Do"
            subtitle="Nine key areas of action"
          />
          <AboutWorkGrid
            areas={dynamicWorkAreas}
            onPressArea={handleAreaPress}
          />
        </View>

        <View style={styles.section}>
          <HumanRightsMonitoringSection
            onLayout={handleMonitoringLayout}
            onOpenDetails={() => handleAreaPress({ id: 'monitoring' } as any)}
          />
        </View>

        <View style={styles.section}>
          <AboutApproachSection content={ABOUT_CONTENT.approach} />
        </View>

        <View style={styles.section}>
          <AboutCoreValuesSection />
        </View>

        <View style={styles.section}>
          <AboutImpactSection content={dynamicImpactContent} />
        </View>

        <View style={styles.ctaSection}>
          <AboutFinalCta
            content={ABOUT_CONTENT.finalCta}
            onPress={() => {
              if (onOpenMyApplication) {
                onOpenMyApplication();
              } else if (onOpenStatus) {
                onOpenStatus();
              } else if (onNavigate) {
                onNavigate(AppRoutes.DONATIONS);
              } else {
                showComingSoon(ABOUT_CONTENT.finalCta.buttonLabel);
              }
            }}
          />
        </View>
      </ScrollView>
      {showBottomNav ? (
        <UserBottomNavigation activeTab="about" onTabPress={handleTabPress} />
      ) : null}
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
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
  },
  ctaSection: {
    marginTop: Spacing.xl + 4,
    width: '100%',
  },
  sectionHeadingRow: {
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  titleUnderline: {
    width: 24,
    height: 3,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 1.5,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
  },
});

export default AboutScreen;
