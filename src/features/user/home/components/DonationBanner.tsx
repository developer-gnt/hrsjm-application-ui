import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import { GoldButton } from './GoldButton';
import { DONATION_CONTENT } from '../data/home-preview-data';

const DonationHands = require('../../../../assets/images/contact-cta-hands.jpg');

interface DonationBannerProps {
  onPress?: () => void;
}

/**
 * Full-width donation CTA with the joined-hands background and reference copy.
 */
export const DonationBanner: React.FC<DonationBannerProps> = ({ onPress }) => (
  <View style={styles.banner}>
    <Image
      source={DonationHands}
      style={styles.background}
      resizeMode="cover"
    />

    <View style={styles.content}>
      <Text style={styles.headline}>{DONATION_CONTENT.headline}</Text>
      <Text style={styles.description}>{DONATION_CONTENT.description}</Text>
      <View style={styles.cta}>
        <GoldButton
          label={DONATION_CONTENT.ctaLabel}
          onPress={onPress}
          compact
          textColor={AdminColors.primaryDark}
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    aspectRatio: 3.1,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    width: '72%',
  },
  headline: {
    fontFamily: FontFamilies.serif,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  description: {
    fontSize: 9,
    lineHeight: 12,
    color: AdminColors.textOnDark,
    opacity: 0.85,
    marginTop: Spacing.xs,
    maxWidth: 230,
  },
  cta: {
    marginTop: Spacing.sm,
  },
});
