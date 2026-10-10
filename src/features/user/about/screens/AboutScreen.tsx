import React, { useRef } from 'react';
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
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { AboutApproachSection } from '../components/AboutApproachSection';
import { AboutFinalCta } from '../components/AboutFinalCta';
import { AboutHero } from '../components/AboutHero';
import { AboutImpactSection } from '../components/AboutImpactSection';
import { AboutWhoWeAreSection } from '../components/AboutWhoWeAreSection';
import { AboutWorkGrid } from '../components/AboutWorkGrid';
import { HumanRightsMonitoringSection } from '../components/HumanRightsMonitoringSection';
import { ABOUT_CONTENT } from '../data/about-content';
import type { AboutWorkArea } from '../types/about.types';
import type { WhatWeDoId } from '../../what-we-do';

export interface AboutScreenProps {
  onBack?: () => void;
  onOpenRights?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenWhatWeDo?: (contentId: WhatWeDoId) => void;
}

const SectionHeading: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => (
  <View style={styles.sectionHeadingRow}>
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  onOpenRights,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
  onOpenWhatWeDo,
}) => {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const monitoringOffset = useRef(0);

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
    if (area.id === 'monitoring') {
      scrollToMonitoring();
      return;
    }

    const pageIdMap: Record<string, WhatWeDoId> = {
      awareness: 'awareness-campaigns',
      workshops: 'workshops-training',
      community: 'community-activities',
      leadership: 'leadership-development',
      advocacy: 'advocacy-awareness',
      research: 'research-rights-education',
      legal: 'legal-rights-awareness',
      other: 'other-work-areas',
    };

    const pageId = pageIdMap[area.id];
    if (pageId) {
      onOpenWhatWeDo?.(pageId);
    }
  };

  const handleMonitoringLayout = (event: LayoutChangeEvent) => {
    monitoringOffset.current = event.nativeEvent.layout.y;
  };

  const scrollToMonitoring = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, monitoringOffset.current - Spacing.sm),
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        showNotificationDot
        notificationDotColor={AdminColors.accentGold}
        onPressSearch={() => showComingSoon('Search')}
        onPressNotifications={() => showComingSoon('Notifications')}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AboutHero content={ABOUT_CONTENT.hero} />

        <View style={styles.section}>
          <AboutWhoWeAreSection principles={ABOUT_CONTENT.principles} />
        </View>

        <View style={styles.section}>
          <SectionHeading
            title="What We Do"
            subtitle="Nine key areas of action"
          />
          <AboutWorkGrid
            areas={ABOUT_CONTENT.workAreas}
            onPressArea={handleAreaPress}
          />
        </View>

        <View style={styles.fullWidthBannerSection}>
          <HumanRightsMonitoringSection onLayout={handleMonitoringLayout} />
        </View>

        <View style={styles.section}>
          <AboutApproachSection content={ABOUT_CONTENT.approach} />
        </View>

        <View style={styles.section}>
          <AboutImpactSection content={ABOUT_CONTENT.impact} />
        </View>

        <View style={styles.fullWidthBannerSection}>
          <AboutFinalCta
            content={ABOUT_CONTENT.finalCta}
            onPress={() => showComingSoon(ABOUT_CONTENT.finalCta.buttonLabel)}
          />
        </View>
      </ScrollView>
      <UserBottomNavigation activeTab="about" onTabPress={handleTabPress} />
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
    paddingBottom: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
  },
  sectionHeadingRow: {
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    flexShrink: 0,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  fullWidthBannerSection: {
    marginTop: Spacing.lg,
  },
});
