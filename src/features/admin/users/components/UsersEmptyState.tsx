import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

interface UsersEmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
  resetLabel?: string;
  onSignUp?: () => void;
  onLoadDemo?: () => void;
}

export const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({
  title = 'No Users Found',
  message = 'No users match your active filters or search keyword.',
  onReset,
  resetLabel = 'Reset Filters',
  onSignUp,
  onLoadDemo,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>👥</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actionsRow}>
        {onSignUp && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSignUp}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go to Sign Up form"
          >
            <Text style={styles.primaryButtonText}>Register via Sign Up</Text>
          </TouchableOpacity>
        )}

        {onReset && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={onReset}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={resetLabel}
          >
            <Text style={styles.resetButtonText}>{resetLabel}</Text>
          </TouchableOpacity>
        )}

        {onLoadDemo && (
          <TouchableOpacity
            style={styles.demoButton}
            onPress={onLoadDemo}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Load sample users for preview"
          >
            <Text style={styles.demoButtonText}>Load Sample Users (Demo)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.sm,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 4,
  },
  message: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.base,
    maxWidth: 300,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0F2860',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
  },
  resetButtonText: {
    color: '#1E3A8A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  demoButtonText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
