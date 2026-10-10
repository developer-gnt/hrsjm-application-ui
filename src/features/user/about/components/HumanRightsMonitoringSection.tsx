import React from 'react';
import {
  Image,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';

const MONITORING_IMAGE = require('../../../../assets/images/about-hero-community.png');

const FEATURES = [
  {
    id: 'field-visits',
    title: 'Field Visits',
    description: 'Understand real situations.',
    icon: 'map-pin',
  },
  {
    id: 'case-documentation',
    title: 'Case Documentation',
    description: 'Record and verify information.',
    icon: 'file-text',
  },
  {
    id: 'community-follow-up',
    title: 'Community Follow-up',
    description: 'Stay engaged for lasting change.',
    icon: 'users',
  },
] as const;

interface HumanRightsMonitoringSectionProps {
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const HumanRightsMonitoringSection: React.FC<
  HumanRightsMonitoringSectionProps
> = ({ onLayout }) => {
  return (
    <View style={styles.panel} onLayout={onLayout}>
      <View style={styles.topRow}>
        <View style={styles.imageFrame}>
          <Image
            source={MONITORING_IMAGE}
            style={styles.image}
            resizeMode="cover"
            accessible={false}
          />
        </View>
        <View style={styles.copy}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowLine} />
            <Text style={styles.eyebrow}>ON THE GROUND</Text>
          </View>
          <Text style={styles.title}>Human-rights Monitoring</Text>
          <Text style={styles.description}>
            We track, document and highlight human-rights issues to ensure that
            the voices of marginalised communities are heard and addressed.
          </Text>
        </View>
      </View>

      <View style={styles.features}>
        {FEATURES.map(feature => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={styles.featureIconBubble}>
              <AppIcon
                name={feature.icon}
                size={18}
                color={AdminColors.primaryDark}
              />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>
              {feature.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1,
    borderColor: '#FBE8B3',
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageFrame: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  eyebrowLine: {
    width: 18,
    height: 2,
    backgroundColor: AdminColors.accentGold,
  },
  eyebrow: {
    color: AdminColors.primaryDark,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
  },
  description: {
    marginTop: 3,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16.5,
  },
  features: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF0C8',
    borderWidth: 1,
    borderColor: '#FBE5A5',
  },
  featureIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBE8B3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 14.5,
    textAlign: 'center',
  },
});
