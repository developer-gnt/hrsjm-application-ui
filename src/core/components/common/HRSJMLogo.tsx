import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '../../theme/colors';

interface HRSJMLogoProps {
  /** Diameter of the crest badge. */
  size?: number;
  /** Show the wordmark + tagline block next to the crest. */
  showWordmark?: boolean;
}

/**
 * HRSJM brand mark. The crest is a lightweight monogram placeholder with the
 * correct 1:1 aspect ratio — swap in the official logo asset via `crest`
 * once the brand image file is added to src/assets.
 */
export const HRSJMLogo: React.FC<HRSJMLogoProps> = ({ size = 40, showWordmark = true }) => {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.crest,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: Math.max(2, size * 0.075),
          },
        ]}
      >
        <Text style={[styles.crestMonogram, { fontSize: Math.round(size * 0.34) }]}>HJ</Text>
        <View style={[styles.crestStarDot, { top: size * 0.14 }]} />
      </View>

      {showWordmark && (
        <View style={styles.wordmark}>
          <Text style={styles.name}>HRSJM</Text>
          <Text style={styles.tagline} numberOfLines={1}>
            HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
          </Text>
          <Text style={styles.taglineLocal} numberOfLines={1}>
            हमारे अधिकार · सामाजिक न्याय
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crest: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.navyDeep,
    borderColor: BrandColors.gold,
  },
  crestMonogram: {
    fontWeight: '700',
    color: BrandColors.goldSoft,
    letterSpacing: 0.5,
  },
  crestStarDot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: BrandColors.gold,
  },
  wordmark: {
    marginLeft: 10,
    flexShrink: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: BrandColors.navyDeep,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 7.5,
    fontWeight: '600',
    color: BrandColors.navy,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  taglineLocal: {
    fontSize: 8,
    fontWeight: '500',
    color: BrandColors.goldDark,
    marginTop: 1,
  },
});

export default HRSJMLogo;
