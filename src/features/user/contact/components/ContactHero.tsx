import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
// TODO: Replace with the official HRSJM campus/office photograph.
// TEMPORARY ASSET: AI-generated campus visual with the hero-navy fade baked
// into its left edge (src/assets/images/contact-hero-building.jpg) — swap
// the require below, layout stays unchanged.
import ContactHeroBuilding from '../../../../assets/images/contact-hero-building.jpg';

/**
 * Reference-locked Contact hero: the campus/building photograph as a
 * full-bleed background (the asset carries a baked-in navy fade on its
 * left edge so the copy zone stays navy), serif "Contact Us" heading with
 * the gold "Us" and the supporting copy — rounded bottom corners.
 */
export const ContactHero: React.FC = () => (
  <View style={styles.container}>
    <Image source={ContactHeroBuilding} style={styles.image} resizeMode="cover" />

    <View style={styles.content}>
      <Text style={styles.headline}>
        Contact <Text style={styles.headlineGold}>Us</Text>
      </Text>
      <Text style={styles.supporting}>
        We are here to listen, support and work together for a fairer, more
        just and equal society.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 224,
    backgroundColor: AdminColors.primaryDark,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '62%',
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
  },
  headline: {
    fontFamily: FontFamilies.serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  headlineGold: {
    color: AdminColors.accentGold,
  },
  supporting: {
    fontSize: 11.5,
    lineHeight: 17,
    color: AdminColors.textOnDark,
    marginTop: Spacing.sm,
    maxWidth: 170,
  },
});
