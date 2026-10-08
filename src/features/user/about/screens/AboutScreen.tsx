import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, Spacing } from '../../../../core/theme';
import { ContactHeader } from '../../contact';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import { AboutHero } from '../components/AboutHero';
import { AboutWorkGrid } from '../components/AboutWorkGrid';
import { HumanRightsMonitoringSection } from '../components/HumanRightsMonitoringSection';
import { AboutFinalCta } from '../components/AboutFinalCta';
import { ABOUT_CONTENT } from '../data/about-content';
import type { AboutWorkArea } from '../types/about.types';
import type { HomeTab } from '../../home/types/home.types';

export interface AboutScreenProps {
  /** Returns to the User Home screen (header back button + Home tab). */
  onBack?: () => void;
  onOpenRights?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
}

/**
 * Reference-locked About page ("What HRSJM Does") — a standalone User App
 * screen: header, navy community hero, the static 3x3 work-area grid, the
 * closing movement CTA and the shared six-tab bottom navigation with About
 * active. Content is preview-static until the backend integration phase.
 */
export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  onOpenRights,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
}) => {
  const showComingSoon = (feature: string) => {
    // UI PHASE ONLY placeholder for actions that ship with later phases.
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ContactHeader
        onBack={onBack}
        onPressSearch={() => showComingSoon('Search')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <AboutHero />
        </View>

        <View style={styles.gridSection}>
          <AboutWorkGrid
            areas={ABOUT_CONTENT.workAreas}
            onPressArea={(area: AboutWorkArea) =>
              showComingSoon(area.title.replace(/\n/g, ' '))
            }
          />
        </View>

        <HumanRightsMonitoringSection />

        <View style={styles.ctaSection}>
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
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  heroSection: {
    marginTop: Spacing.md,
  },
  gridSection: {
    marginTop: Spacing.lg,
  },
  ctaSection: {
    marginTop: Spacing.lg,
  },
});
