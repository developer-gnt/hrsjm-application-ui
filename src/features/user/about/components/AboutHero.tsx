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
import type { AboutContent } from '../types/about.types';

interface AboutHeroProps {
  content: AboutContent['hero'];
}

export const AboutHero: React.FC<AboutHeroProps> = ({ content }) => {
  const { width } = useWindowDimensions();
  const height = Math.round(Math.min(170, Math.max(130, width * 0.36)));

  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={AboutHeroSource}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>{content.eyebrow}</Text>
          <View style={styles.eyebrowLine} />
        </View>
        <Text style={styles.title}>
          {content.titleLine}{' '}
          <Text style={styles.titleAccent}>{content.titleAccentLine}</Text>
        </Text>
        <Text style={styles.description}>{content.description}</Text>
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
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.18)',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '65%',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  eyebrow: {
    color: AdminColors.accentGold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  eyebrowLine: {
    width: 34,
    height: 2,
    backgroundColor: AdminColors.accentGold,
  },
  title: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
  },
  titleAccent: {
    color: AdminColors.accentGold,
  },
  description: {
    maxWidth: 245,
    marginTop: Spacing.sm,
    color: AdminColors.textOnDark,
    fontSize: 11,
    lineHeight: 15,
  },
});
