import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing } from '../../../core/theme/spacing';

const LOGO_SOURCE = require('../../../assets/logo/logo.png');

interface AuthLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 'light' renders wordmark for navy backgrounds; 'dark' for light ones. */
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  layout?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

const SIZES = {
  xs: { width: 38, height: 30 },
  sm: { width: 50, height: 40 },
  md: { width: 80, height: 64 },
  lg: { width: 110, height: 88 },
} as const;

/**
 * Official HRSJM Brand Mark: Displays the official Golden Shield & Dove logo
 * with accompanying bilingual wordmark. Supports both vertical (auth screens)
 * and horizontal (top navigation headers) layouts.
 */
export const AuthLogo: React.FC<AuthLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showWordmark = true,
  layout = 'vertical',
  style,
}) => {
  const dimensions = SIZES[size];
  const isLight = variant === 'light';
  const isHorizontal = layout === 'horizontal';

  const wordmarkColor = isLight ? AdminColors.textOnDark : '#1A365D';
  const missionColor = isLight ? AdminColors.accentGoldLight : '#1A365D';
  const hindiColor = isLight ? AdminColors.accentGoldLight : '#2C3E50';

  return (
    <View
      style={[
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
    >
      <Image
        source={LOGO_SOURCE}
        style={{ width: dimensions.width, height: dimensions.height }}
        resizeMode="contain"
      />

      {showWordmark && (
        <View
          style={
            isHorizontal
              ? styles.horizontalWordmarkWrap
              : styles.verticalWordmarkWrap
          }
        >
          <Text
            style={[
              isHorizontal ? styles.horizontalWordmark : styles.verticalWordmark,
              { color: wordmarkColor },
            ]}
          >
            HRSJM
          </Text>
          <Text
            style={[
              isHorizontal ? styles.horizontalMission : styles.verticalMission,
              { color: missionColor },
            ]}
            numberOfLines={1}
          >
            HUMAN RIGHTS & SOCIAL JUSTICE MISSION
          </Text>
          <Text
            style={[
              isHorizontal ? styles.horizontalHindi : styles.verticalHindi,
              { color: hindiColor },
            ]}
            numberOfLines={1}
          >
            मानव अधिकार <Text style={styles.dot}>•</Text> सामाजिक न्याय
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalWordmarkWrap: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  horizontalWordmarkWrap: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  verticalWordmark: {
    ...(Typography.screenTitle as TextStyle),
    letterSpacing: 2,
    fontWeight: '800',
  },
  horizontalWordmark: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  verticalMission: {
    ...Typography.badge,
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  horizontalMission: {
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  verticalHindi: {
    ...Typography.secondaryMedium,
    marginTop: 2,
    textAlign: 'center',
  },
  horizontalHindi: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 1,
  },
  dot: {
    color: AdminColors.accentGold,
    fontWeight: '800',
  },
});

export default AuthLogo;