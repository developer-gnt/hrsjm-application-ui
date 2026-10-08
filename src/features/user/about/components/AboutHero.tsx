import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import AboutHeroSource from '../../../../assets/images/about-hero-community.png';

/**
 * Reference-locked About hero: FULL-BLEED (edge-to-edge under the header,
 * rounded bottom corners only) — the deep-navy community artwork (HRSJM
 * volunteer among villagers — the supplied text-free HD image) as the
 * background with the serif "What / HRSJM Does" headline and supporting
 * copy on the left. The artwork's own navy left zone keeps the white/gold
 * text legible, so no extra overlay is applied.
 */
export const AboutHero: React.FC = () => {
  const { width } = useWindowDimensions();
  const height = Math.round(Math.min(220, Math.max(170, width * 0.42)));

  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={AboutHeroSource}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.titleLight}>What</Text>
        <Text style={styles.titleAccent}>HRSJM Does</Text>
        <Text style={styles.description}>
          We work on multiple fronts to protect human rights, promote social
          justice and support marginalised communities across India.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: AdminColors.primaryDark,
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
    left: 0,
    top: 0,
    bottom: 0,
    width: '62%',
    justifyContent: 'center',
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
  },
  titleLight: {
    fontFamily: FontFamilies.serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  titleAccent: {
    fontFamily: FontFamilies.serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: AdminColors.accentGold,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 16,
    color: AdminColors.textOnDark,
    marginTop: Spacing.sm,
    maxWidth: 210,
  },
});
