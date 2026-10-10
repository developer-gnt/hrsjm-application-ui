import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { AppButton } from '../common/AppButton';

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: ViewStyle;
}

export const AppErrorState: React.FC<AppErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  description,
  onRetry,
  retryTitle = 'Try Again',
  style,
}) => {
  const displayMsg = message || description || 'We encountered an error loading this information. Please try again.';
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <AppButton
          title={retryTitle}
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 44,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.error,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.base,
    maxWidth: 290,
  },
  button: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderColor: AdminColors.error,
  },
});
