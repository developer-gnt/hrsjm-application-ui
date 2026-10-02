import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';

interface EventSelectFieldProps {
  /** Selected value; null/undefined shows the placeholder. */
  value?: string | null;
  placeholder: string;
  error?: boolean;
  onPress: () => void;
}

/** Dropdown-style select box for Create Event dropdown fields. */
export const EventSelectField: React.FC<EventSelectFieldProps> = ({
  value,
  placeholder,
  error = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.field, error ? styles.fieldError : null]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(value) }}
      accessibilityLabel={placeholder}
    >
      <Text
        style={[styles.value, !value && styles.placeholder]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Text style={styles.chevron}>⌄</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  fieldError: {
    borderColor: AdminColors.error,
  },
  value: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    flexShrink: 1,
  },
  placeholder: {
    color: AdminColors.textMuted,
  },
  chevron: {
    fontSize: 13,
    color: AdminColors.textMuted,
    marginLeft: Spacing.sm,
  },
});