import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
// TODO: Replace with the official HRSJM people/partnership photograph.
// Temporary CTA image; keep the existing layout when replacing it.
import ContactCtaPeoplePlaceholder from '../../../../assets/images/contact-cta-hands.jpg';
import { CONTACT_FINAL_CTA } from '../data/contact-content';

/**
 * Home contact section, part 3 (reference-locked): dark navy closing CTA
 * banner — serif heading, supporting copy and the partnership artwork on
 * the right (dummy image carries a baked-in navy fade on its left edge).
 * FULL-BLEED like the hero above: edge-to-edge with no side margins, square
 * top and rounded bottom corners (xxl).
 */
export const ContactFinalCta: React.FC = () => (
  <View style={styles.banner}>
    <Image
      source={ContactCtaPeoplePlaceholder}
      style={styles.image}
      resizeMode="cover"
    />

    <View style={styles.content}>
      <Text style={styles.headline}>{CONTACT_FINAL_CTA.headline}</Text>
      <Text style={styles.description}>{CONTACT_FINAL_CTA.description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    height: 176,
    backgroundColor: AdminColors.primaryDark,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
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
    width: '58%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  headline: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  description: {
    fontSize: 11,
    lineHeight: 16,
    color: AdminColors.textOnDark,
    opacity: 0.85,
    marginTop: Spacing.sm,
  },
});
