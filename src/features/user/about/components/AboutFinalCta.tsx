import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { GoldButton } from '../../home/components/GoldButton';
import ContactCtaHandsSource from '../../../../assets/images/contact-cta-hands.jpg';
import type { AboutContent } from '../types/about.types';

interface AboutFinalCtaProps {
  content: AboutContent['finalCta'];
  onPress?: () => void;
}

/**
 * Final About CTA with the bundled solidarity image on the right and
 * existing shared gold action button.
 */
export const AboutFinalCta: React.FC<AboutFinalCtaProps> = ({
  content,
  onPress,
}) => (
  <View style={styles.banner}>
    <Image
      source={ContactCtaHandsSource}
      style={styles.image}
      resizeMode="cover"
      accessible={false}
    />
    <View style={styles.overlay} />

    <View style={styles.content}>
      <Text style={styles.headingLight}>{content.headingLine}</Text>
      <Text style={styles.headingAccent}>{content.headingAccentLine}</Text>

      <Text style={styles.supporting}>{content.supporting}</Text>

      <View style={styles.button}>
        <GoldButton
          label={content.buttonLabel}
          compact
          textColor={AdminColors.primaryDark}
          onPress={onPress}
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    minHeight: 132,
    width: '100%',
    borderRadius: BorderRadius.xl,
    backgroundColor: AdminColors.primaryDark,
    overflow: 'hidden',
    ...Shadows.card,
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '58%',
    height: '100%',
    opacity: 0.75,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.22)',
  },
  content: {
    width: '72%',
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.md,
    zIndex: 1,
  },
  headingLight: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  headingAccent: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '700',
    color: AdminColors.accentGold,
  },
  supporting: {
    fontSize: 10,
    lineHeight: 13,
    color: AdminColors.textOnDark,
    marginTop: Spacing.xs,
  },
  button: {
    marginTop: Spacing.md,
  },
});
