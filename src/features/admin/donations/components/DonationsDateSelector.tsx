import React from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  AdminColors,
  BorderRadius,
} from '../../../../core';
import { Calendar } from '../../../../core/components/icons';

interface DonationsDateSelectorProps {
  /** Defaults to the current month, e.g. "Oct 2026". */
  label?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Responsive date selector pill with truncation support so it never overflows
 * adjacent buttons on mobile screens.
 */
export const DonationsDateSelector: React.FC<DonationsDateSelectorProps> = ({
  label,
  onPress,
  style,
}) => {
  const monthLabel =
    label ?? new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity
      style={[styles.pill, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Select date range, ${monthLabel}`}
    >
      <Calendar size={15} color={AdminColors.primaryDark} strokeWidth={2} style={styles.calendarIcon} />
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {monthLabel}
      </Text>
      <Text style={styles.chevron}>▾</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 10,
    height: 44,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarIcon: {
    marginRight: 2,
    flexShrink: 0,
  },
  label: {
    flexShrink: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
    marginLeft: 2,
    flexShrink: 0,
  },
});

export default DonationsDateSelector;
