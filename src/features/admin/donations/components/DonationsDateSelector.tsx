import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import {
  AdminColors,
  Spacing,
  BorderRadius,
} from '../../../../core';

interface DonationsDateSelectorProps {
  /** Defaults to the current month, e.g. "Oct 2026". */
  label?: string;
  onPress?: () => void;
}

/**
 * Rounded month selector pill from the approved reference. Displays
 * the current month — no hardcoded month data. Dropdown behavior is
 * a placeholder until a shared date-filter component exists.
 */
export const DonationsDateSelector: React.FC<DonationsDateSelectorProps> = ({
  label,
  onPress,
}) => {
  const monthLabel =
    label ?? new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Select month, ${monthLabel}`}
    >
      <Text style={styles.calendarEmoji}>📅</Text>
      <Text style={styles.label}>{monthLabel}</Text>
      <Text style={styles.chevron}>▾</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    height: 44,
    gap: 4,
  },
  calendarEmoji: {
    fontSize: 14,
    marginRight: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
    marginLeft: 2,
  },
});