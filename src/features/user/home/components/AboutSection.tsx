import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing, UserFontFamilies } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { SectionHeader } from './SectionHeader';
import { ABOUT_DESCRIPTION } from '../data/home-preview-data';

const ABOUT_PREVIEW_IMAGE = require('../../../../assets/images/about-hero-rally.jpg');

export interface AboutSectionProps {
  onMorePress?: () => void;
  onMediaPress?: () => void;
  description?: string;
  duration?: string;
  thumbnailUrl?: string;
  title?: string;
}

/**
 * Connected & Dynamic "About HRSJM":
 * - Dynamic description left
 * - Media card with play button, dynamic thumbnail, duration badge, and video trigger
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  onMorePress,
  onMediaPress,
  description = ABOUT_DESCRIPTION,
  duration = '3:45',
  thumbnailUrl,
  title = 'About HRSJM',
}) => (
  <View style={styles.section}>
    <SectionHeader title={title} linkLabel="View More" onLinkPress={onMorePress} />

    <View style={styles.body}>
      <Text style={styles.description}>{description}</Text>

      <TouchableOpacity
        style={styles.media}
        onPress={onMediaPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Play the HRSJM introduction video"
      >
        <Image
          source={thumbnailUrl ? { uri: thumbnailUrl } : ABOUT_PREVIEW_IMAGE}
          style={styles.mediaSlot}
          resizeMode="cover"
          accessible={false}
        />

        {/* Center Play Badge */}
        <View style={styles.playBadge}>
          <AppIcon name="play" size={13} color={AdminColors.primaryDark} strokeWidth={2} />
        </View>

        {/* Duration Badge */}
        {duration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}
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
    fontFamily: UserFontFamilies.sans,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
  media: {
    width: 98,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryLight,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  mediaSlot: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
