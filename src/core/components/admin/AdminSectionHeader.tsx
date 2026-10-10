import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface AdminSectionHeaderProps {
  title: string;
  /** Optional trailing action, e.g. "View All". */
  actionLabel?: string;
  onAction?: () => void;
}

/** Section title row with an optional trailing action link. */
export const AdminSectionHeader: React.FC<AdminSectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} hitSlop={8}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
  },
  action: {
    ...Typography.bodyMedium,
    color: AdminColors.primary,
  },
});
