import React from 'react';
import {
  Image,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const sideBySide = width >= 380;

  return (
    <View
      style={[styles.panel, !sideBySide && styles.stackedPanel]}
      onLayout={onLayout}
    >
      <View
        style={[
          styles.imageFrame,
          sideBySide ? styles.sideImageFrame : styles.stackedImageFrame,
        ]}
      >
        <Image
          source={MONITORING_IMAGE}
          style={[
            styles.image,
            sideBySide ? styles.sideImage : styles.stackedImage,
          ]}
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
        <View style={styles.features}>
          {FEATURES.map(feature => (
            <View key={feature.id} style={styles.featureCard}>
              <AppIcon
                name={feature.icon}
                size={17}
                color={AdminColors.accentGold}
              />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    minHeight: 188,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.accentGoldLight,
    ...Shadows.card,
  },
  stackedPanel: {
    flexDirection: 'column',
  },
  imageFrame: {
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },
  sideImageFrame: {
    width: '39%',
    minHeight: 188,
    alignSelf: 'stretch',
  },
  stackedImageFrame: {
    width: '100%',
    height: 150,
  },
  image: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  sideImage: {
    left: '-140%',
    width: '300%',
    height: '100%',
  },
  stackedImage: {
    left: 0,
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.sm,
    minWidth: 0,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 3,
  },
  eyebrowLine: {
    width: 18,
    height: 2,
    backgroundColor: AdminColors.accentGold,
  },
  eyebrow: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  description: {
    marginTop: 3,
    color: AdminColors.textSecondary,
    fontSize: 8.5,
    lineHeight: 11,
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  featureCard: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF0C8',
  },
  featureTitle: {
    marginTop: 3,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
  },
});
