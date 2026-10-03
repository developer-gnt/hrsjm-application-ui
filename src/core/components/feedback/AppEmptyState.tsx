import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { AppButton } from '../common/AppButton';

export interface AppEmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  icon?: any;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  title,
  description,
  message,
  icon = '📋',
  actionTitle,
  actionLabel,
  onAction,
  style,
}) => {
  const displayMsg = message || description;
  const displayBtn = actionLabel || actionTitle;
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {displayMsg && <Text style={styles.description}>{displayMsg}</Text>}
      {displayBtn && onAction && (
        <AppButton
          title={displayBtn}
          onPress={onAction}
          variant="primary"
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
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.base,
    maxWidth: 280,
  },
  button: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
});
