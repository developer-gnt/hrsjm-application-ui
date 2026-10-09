import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

const HERO_BG = require('../../../assets/membership_details_hero.png');

interface MembershipDetailsHeroProps {
  titlePrimary?: string;
  titleSecondary?: string;
  subtitle?: string;
}

export const MembershipDetailsHero: React.FC<MembershipDetailsHeroProps> = ({
  titlePrimary = 'Membership',
  titleSecondary = 'Details',
  subtitle = 'Your membership connects you with a stronger community, greater opportunities and a more just society.',
}) => {
  return (
    <View style={styles.heroOuterContainer}>
      <View style={styles.heroCard}>
        {/* Background Image */}
        <Image
          source={HERO_BG}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel="HRSJM Membership Banner"
        />

        {/* Navy Gradient / Shading Overlay */}
        <View style={styles.heroOverlay}>
          <View style={styles.contentContainer}>
            {/* Main Heading */}
            <Text style={styles.heroTitle}>
              <Text style={styles.titleWhite}>{titlePrimary}{'\n'}</Text>
              <Text style={styles.titleGold}>{titleSecondary}</Text>
            </Text>

            {/* Supporting Message */}
            <Text style={styles.heroDescription}>
              {subtitle}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroOuterContainer: {
    width: '100%',
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  heroCard: {
    width: '100%',
    minHeight: 180,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#071A3C',
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
    minHeight: 180,
    backgroundColor: 'rgba(7, 26, 60, 0.22)',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    justifyContent: 'center',
  },
  contentContainer: {
    maxWidth: '58%',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 31,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 12,
    lineHeight: 16.5,
    fontWeight: '500',
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
