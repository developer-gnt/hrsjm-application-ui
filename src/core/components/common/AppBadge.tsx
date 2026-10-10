import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';

export type BadgeStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'EXPIRING'
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'SUCCESS'
  | 'ERROR'
  | 'WARNING'
  | 'INFO'
  | 'DEFAULT';

export interface AppBadgeProps {
  label: string;
  status?: BadgeStatus;
  customBg?: string;
  customTextColor?: string;
  bg?: string;
  fg?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  status = 'DEFAULT',
  customBg,
  customTextColor,
  bg,
  fg,
  style,
  textStyle,
}) => {
  const finalBg = bg || customBg;
  const finalFg = fg || customTextColor;

  const getBadgeColors = (): { bg: string; text: string } => {
    if (finalBg && finalFg) {
      return { bg: finalBg, text: finalFg };
    }

    switch (status) {
      case 'ACTIVE':
      case 'SUCCESS':
      case 'VERIFIED':
        return {
          bg: AdminColors.statusActiveLight,
          text: AdminColors.statusActive,
        };
      case 'EXPIRING':
      case 'WARNING':
        return {
          bg: AdminColors.statusExpiringLight,
          text: AdminColors.statusExpiring,
        };
      case 'INACTIVE':
      case 'FAILED':
      case 'ERROR':
        return {
          bg: AdminColors.statusInactiveLight,
          text: AdminColors.statusInactive,
        };
      case 'PENDING':
      case 'INFO':
        return {
          bg: AdminColors.statusPendingLight,
          text: AdminColors.statusPending,
        };
      case 'DEFAULT':
      default:
        return {
          bg: AdminColors.primaryLight,
          text: AdminColors.primary,
        };
    }
  };

  const badgeColors = getBadgeColors();

  return (
    <View style={[styles.badgeContainer, { backgroundColor: badgeColors.bg }, style]}>
      <Text style={[styles.badgeText, { color: badgeColors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...Typography.badge,
    textTransform: 'uppercase',
  },
});
