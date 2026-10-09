import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { SectionHeader } from './SectionHeader';
import { ABOUT_DESCRIPTION } from '../data/home-preview-data';

const ABOUT_PREVIEW_IMAGE = require('../../../../assets/images/about-hero-community.png');

interface AboutSectionProps {
  onMorePress?: () => void;
  onMediaPress?: () => void;
}

/** Reference-locked "About HRSJM": description left, media card with play
 * button right. */
export const AboutSection: React.FC<AboutSectionProps> = ({
  onMorePress,
  onMediaPress,
}) => (
  <View style={styles.section}>
    <SectionHeader title="About HRSJM" linkLabel="View More" onLinkPress={onMorePress} />

    <View style={styles.body}>
      <Text style={styles.description}>{ABOUT_DESCRIPTION}</Text>

      <TouchableOpacity
        style={styles.media}
        onPress={onMediaPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Play the HRSJM introduction video"
      >
        <Image
          source={ABOUT_PREVIEW_IMAGE}
          style={styles.mediaSlot}
          resizeMode="cover"
          accessible={false}
        />
        <View style={styles.playBadge}>
          <AppIcon name="play" size={13} color={AdminColors.primaryDark} />
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.base,
  },
  body: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  description: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 19,
    color: AdminColors.textSecondary,
  },
  media: {
    width: 92,
    height: 68,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  mediaSlot: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
});
