import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../../core/theme/spacing';
import { AboutColors } from '../theme';
import { AboutHeader } from '../components/AboutHeader';
import { AboutHeroSection } from '../components/AboutHeroSection';
import { WhoWeAreSection } from '../components/WhoWeAreSection';
import { BeliefSection } from '../components/BeliefSection';
import { MissionVisionSection } from '../components/MissionVisionSection';
import { ValuesSection } from '../components/ValuesSection';
import { LeadershipSection } from '../components/LeadershipSection';
import { ClosingCtaSection } from '../components/ClosingCtaSection';

export interface AboutScreenProps {
  /** Called by the header back button (wired to navigation.goBack by MoreNavigator). */
  onBack?: () => void;
  /** Navigate to an in-app route (used by the closing CTA). */
  onNavigate?: (target: string) => void;
}

/**
 * ============================================================================
 * ABOUT HRSJM SCREEN
 * ============================================================================
 *
 * Organization profile page (spec Phases 3–10, corrected against the
 * high-resolution approved reference). Sections compose exclusively from the
 * About design tokens (../theme) and the approved copy in
 * ../content/aboutContent:
 *
 *   AboutHeader (page-specific: chevron + serif title) — Phase 3
 *   AboutHeroSection                                   — Phase 4
 *   WhoWeAreSection                                    — Phase 5
 *   BeliefSection                                      — Phase 6
 *   MissionVisionSection                               — Phase 7
 *   ValuesSection                                      — Phase 8
 *   LeadershipSection                                  — Phase 9
 *   ClosingCtaSection (gold button → Donations route)  — Phase 10
 *
 * Layout relationship guaranteeing no content ever sits beneath the header:
 * the header is an in-flow flex sibling ABOVE the ScrollView (never
 * position:fixed), so the scroll area starts strictly below it.
 */
export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <AboutHeader onBack={onBack} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.base },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AboutHeroSection />
        <WhoWeAreSection />
        <BeliefSection />
        <MissionVisionSection />
        <ValuesSection />
        <LeadershipSection />
        <ClosingCtaSection onNavigate={onNavigate} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AboutColors.offWhite,
  },
  scrollContent: {
    paddingBottom: Spacing.base,
  },
});

export default AboutScreen;
