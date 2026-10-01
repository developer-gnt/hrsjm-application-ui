import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { colors, spacing } from '../../theme/theme';

interface AppErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

// Standard error presentation. Raw server errors/stack traces are never shown.
export function AppErrorState({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again.',
  onRetry,
}: AppErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLabel={`${title}. ${message}`}>
      <Text style={styles.icon}>
        ⚠️
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <AppButton title="Retry" onPress={onRetry} variant="primary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default AppErrorState;
