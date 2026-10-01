import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, serif } from '../../theme/theme';

// Official HRSJM crest (extracted from the approved design) + wordmark.
const LOGO_SOURCE = require('../../../assets/hrsjm-logo.png');

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 44 }: AppLogoProps) {
  return (
    <View style={styles.row} accessibilityLabel="HRSJM — Human Rights & Social Justice Mission">
      <Image source={LOGO_SOURCE} style={{ width: size, height: size * (132 / 130) }} resizeMode="contain" />
      <View style={styles.wordmark}>
        <Text style={[styles.name, { fontSize: size * 0.52 }]}>HRSJM</Text>
        <Text style={[styles.fullName, { fontSize: size * 0.185 }]}>
          HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
        </Text>
        <Text style={[styles.tagline, { fontSize: size * 0.25 }]}>मानव अधिकार • सामाजिक न्याय</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    marginLeft: 8,
  },
  name: {
    ...serif,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: undefined,
  },
  fullName: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  tagline: {
    color: colors.accentGold,
    fontWeight: '600',
    marginTop: 1,
  },
});

export default AppLogo;
