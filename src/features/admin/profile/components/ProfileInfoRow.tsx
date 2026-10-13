import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../../../core';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';

interface ProfileInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  /** Optional trailing element (e.g. the green Active badge). */
  trailing?: React.ReactNode;
  divider?: boolean;
  showValueWithTrailing?: boolean;
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({
  icon,
  label,
  value,
  trailing,
  divider = true,
  showValueWithTrailing = false,
}) => {
  const isLongValue = typeof value === 'string' && value.length > 20;

  return (
    <>
      <View style={styles.row}>
        {/* Left: Icon and Label */}
        <View style={styles.leftGroup}>
          <View style={styles.iconBox}>{icon}</View>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>

        {/* Right: Value and/or Trailing component */}
        <View style={styles.rightGroup}>
          {showValueWithTrailing && value ? (
            <Text
              style={[styles.value, isLongValue && styles.valueLong]}
              numberOfLines={2}
            >
              {value}
            </Text>
          ) : null}

          {trailing ? (
            <View style={styles.trailingBox}>{trailing}</View>
          ) : !showValueWithTrailing ? (
            <Text
              style={[styles.value, isLongValue && styles.valueLong]}
              numberOfLines={2}
            >
              {value}
            </Text>
          ) : null}
        </View>
      </View>
      {divider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingVertical: Spacing.xs + 2,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: Spacing.md,
  },
  iconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  rightGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  value: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '100%',
    flexShrink: 1,
    ...(Platform.OS === 'web'
      ? {
          wordBreak: 'break-all' as any,
          overflowWrap: 'anywhere' as any,
        }
      : {}),
  },
  valueLong: {
    fontSize: 13,
    lineHeight: 18,
  },
  trailingBox: {
    marginLeft: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: AdminColors.divider,
  },
});

export default ProfileInfoRow;
