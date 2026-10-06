import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon, ImageSlot } from '../../components';
import { SectionHeader } from './SectionHeader';
import { ABOUT_DESCRIPTION } from '../data/home-preview-data';

interface AboutSectionProps {
  onMorePress?: () => void;
  onMediaPress?: () => void;
}

/** Reference-locked "About HRSJM": description left, media card with play
 * button right. The intro video poster is a pending asset (ImageSlot). */
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
        <ImageSlot
          assetName="home/about-intro-video.png"
          height={92}
          radius={BorderRadius.lg}
          style={styles.mediaSlot}
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
    width: 124,
  },
  mediaSlot: {
    width: '100%',
  },
  playBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
