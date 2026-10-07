import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
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
 * Closing CTA (reference-locked): FULL-BLEED like the hero — edge-to-edge
 * with no side margins, square top and rounded bottom corners (hero
 * treatment). Deep navy with the community artwork toward the right, the
 * serif heading with the gold accent line, supporting copy and the gold
 * action button with a right-arrow icon (dark navy text). Copy comes from
 * the About content model. Reuses the CTA image already shipped with the
 * Contact page.
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
    />

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
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: AdminColors.primaryDark,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '56%',
    height: '100%',
  },
  content: {
    width: '60%',
    paddingVertical: Spacing.lg,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.lg,
  },
  headingLight: {
    fontFamily: FontFamilies.serif,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  headingAccent: {
    fontFamily: FontFamilies.serif,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    color: AdminColors.accentGold,
  },
  supporting: {
    fontSize: 10.5,
    lineHeight: 15,
    color: AdminColors.textOnDark,
    marginTop: Spacing.xs,
  },
  button: {
    marginTop: Spacing.md,
  },
});
