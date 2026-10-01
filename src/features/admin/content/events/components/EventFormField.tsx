import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors, Spacing, Typography } from '../../../../../core/theme';

interface EventFormFieldProps {
  label: string;
  required?: boolean;
  optionalHint?: boolean;
  error?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Label + field + inline-error wrapper for Create Event form fields.
 * Error styling mirrors AppInput's error presentation.
 */
export const EventFormField: React.FC<EventFormFieldProps> = ({
  label,
  required = false,
  optionalHint = false,
  error,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.requiredStar}>*</Text> : null}
        {optionalHint ? <Text style={styles.optionalHint}>(Optional)</Text> : null}
      </View>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    flexShrink: 1,
  },
  requiredStar: {
    color: AdminColors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  optionalHint: {
    ...Typography.caption,
    color: AdminColors.textMuted,
  },
  errorText: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: Spacing.xs,
  },
});