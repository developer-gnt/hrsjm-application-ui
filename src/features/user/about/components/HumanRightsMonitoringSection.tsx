import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../../../core/theme';
import { AboutMonitorBanner } from './AboutMonitorBanner';
import { AboutInfoSection } from './AboutInfoSection';
import { AboutImpactSection } from './AboutImpactSection';
import { ABOUT_CONTENT } from '../data/about-content';

/**
 * "Human-rights Monitoring" detail section (reference-locked), rendered on
 * the About page after the 9-card work-area grid: fullscreen hero banner,
 * the What We Do and Key Focus Areas tile rows and the Impact panel.
 * Composes the smaller About section components; all copy comes from the
 * About content model.
 */
export const HumanRightsMonitoringSection: React.FC = () => (
  <View>
    <View style={styles.bannerSection}>
      <AboutMonitorBanner content={ABOUT_CONTENT.monitorBanner} />
    </View>

    <View style={styles.infoSection}>
      <AboutInfoSection block={ABOUT_CONTENT.whatWeDo} />
    </View>

    <View style={styles.infoSection}>
      <AboutInfoSection block={ABOUT_CONTENT.focusAreas} />
    </View>

    <View style={styles.infoSection}>
      <AboutImpactSection block={ABOUT_CONTENT.impact} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  bannerSection: {
    marginTop: Spacing.lg,
  },
  infoSection: {
    marginTop: Spacing.lg,
  },
});
