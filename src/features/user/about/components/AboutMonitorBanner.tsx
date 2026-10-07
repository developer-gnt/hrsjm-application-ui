import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import AboutBannerSource from '../../../../assets/images/about-hero-community.png';
import type { AboutContent } from '../types/about.types';

interface AboutMonitorBannerProps {
  content: AboutContent['monitorBanner'];
}

/**
 * "Human-rights Monitoring" banner (reference-locked), placed between the
 * work grid and the What We Do section: FULL-BLEED like the hero —
 * edge-to-edge with no side margins, square top and rounded bottom corners
 * (hero treatment). Explicit 210dp height so the banner can never collapse.
 * The bundled community artwork (HRSJM volunteer among villagers) is the
 * background; the white serif title and supporting copy sit on the left.
 * The artwork's own navy left zone keeps the text legible, so no extra
 * overlay is applied.
 */
export const AboutMonitorBanner: React.FC<AboutMonitorBannerProps> = ({
  content,
}) => (
  <View style={styles.container}>
    <Image
      source={AboutBannerSource}
      style={styles.image}
      resizeMode="cover"
    />

    <View style={styles.content}>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 210,
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
  title: {
    fontFamily: FontFamilies.serif,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 16,
    color: AdminColors.textOnDark,
    marginTop: Spacing.sm,
    maxWidth: 210,
  },
});
