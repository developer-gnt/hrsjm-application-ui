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

export const AboutFinalCta: React.FC<AboutFinalCtaProps> = ({
  content,
  onPress,
}) => {
  const { width } = useWindowDimensions();
  const height = Math.round(Math.min(215, Math.max(185, width * 0.48)));

  return (
    <View style={[styles.banner, { height }]}>
      <Image
        source={ContactCtaHandsSource}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>GET INVOLVED</Text>
          <View style={styles.eyebrowLine} />
        </View>

        <Text style={styles.title}>
          {content.headingLine}{' '}
          <Text style={styles.titleAccent}>{content.headingAccentLine}</Text>
        </Text>

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
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: AdminColors.primaryDark,
    ...Shadows.card,
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '62%',
    height: '100%',
    opacity: 0.72,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.36)',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '74%',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    zIndex: 1,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  eyebrow: {
    color: AdminColors.accentGold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  eyebrowLine: {
    width: 26,
    height: 2,
    backgroundColor: AdminColors.accentGold,
  },
  title: {
    fontFamily: FontFamilies.serif,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  titleAccent: {
    color: AdminColors.accentGold,
  },
  supporting: {
    fontSize: 13,
    lineHeight: 18,
    color: AdminColors.textOnDark,
    marginTop: 6,
    opacity: 0.95,
  },
  button: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
});
