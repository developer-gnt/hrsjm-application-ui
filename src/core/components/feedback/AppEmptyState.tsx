import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { AppButton } from '../common/AppButton';

interface AppEmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  title,
  description,
  icon = '📋',
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
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
