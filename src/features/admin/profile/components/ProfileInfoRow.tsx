/**
 * Label/value row with a leading icon and hairline divider — the
 * standard row style inside the profile section cards.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({
  icon,
  label,
  value,
  trailing,
  divider = true,
}) => {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {trailing ? (
          <View style={styles.valueTrailing}>{trailing}</View>
        ) : (
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        )}
      </View>
      {divider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingVertical: Spacing.xs,
  },
  iconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginLeft: Spacing.sm,
    flexShrink: 0,
  },
  value: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
    fontWeight: '600',
    marginLeft: 'auto',
    textAlign: 'right',
    flex: 1,
    flexWrap: 'wrap',
  },
  valueTrailing: {
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: AdminColors.divider,
  },
});

export default ProfileInfoRow;
