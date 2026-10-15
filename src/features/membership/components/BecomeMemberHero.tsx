import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

const HERO_BG = require('../../../assets/become_member_hero.png');

interface BecomeMemberHeroProps {
  onCtaPress?: () => void;
}

export const BecomeMemberHero: React.FC<BecomeMemberHeroProps> = () => {
  return (
    <View style={styles.heroOuterContainer}>
      <View style={styles.heroCard}>
        {/* Background Image */}
        <Image
          source={HERO_BG}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel="HRSJM Members Banner"
        />

        {/* Left Dark Blue Gradient / Shading Overlay to ensure crystal clear text contrast */}
        <View style={styles.heroOverlay}>
          <View style={styles.contentContainer}>
            {/* Main Heading */}
            <Text style={styles.heroTitle}>
              <Text style={styles.titleWhite}>Become a{'\n'}</Text>
              <Text style={styles.titleGold}>Member</Text>
            </Text>

            {/* Supporting Message */}
            <Text style={styles.heroDescription}>
              Be a part of a movement for a fairer, more just and equal society. Join HRSJM and help us protect human rights and create positive change.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroOuterContainer: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  heroCard: {
    width: '100%',
    minHeight: 215,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#0A204C',
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    minHeight: 215,
    backgroundColor: 'rgba(10, 32, 76, 0.42)',
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  contentContainer: {
    maxWidth: '64%', // Keeps text over the navy gradient on left side
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleWhite: {
    color: '#FFFFFF',
  },
  titleGold: {
    color: '#F4B843',
  },
  heroDescription: {
    color: '#F1F5F9',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
