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
      <View style={styles.calendarIcon}>
        <View style={styles.calendarHeader} />
      </View>
      <Text style={styles.label}>{monthLabel}</Text>
      <Text style={styles.chevron}>⌄</Text>
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
  },
  calendarIcon: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: AdminColors.primary,
    marginRight: 6,
    overflow: 'hidden',
  },
  calendarHeader: {
    width: 15,
    height: 4,
    backgroundColor: AdminColors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  chevron: {
    fontSize: 12,
    color: AdminColors.primary,
    marginLeft: 4,
  },
});