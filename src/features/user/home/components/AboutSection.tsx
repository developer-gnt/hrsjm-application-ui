import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { SectionHeader } from './SectionHeader';
import { ABOUT_DESCRIPTION } from '../data/home-preview-data';

const ABOUT_PREVIEW_IMAGE = require('../../../../assets/images/about-hero-rally.jpg');

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
          <AppIcon name="play" size={12} color="#0B2F5B" />
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
    alignItems: 'center',
    gap: Spacing.md,
  },
  description: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
  },
  media: {
    width: 98,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  mediaSlot: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -13 }, { translateY: -13 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
