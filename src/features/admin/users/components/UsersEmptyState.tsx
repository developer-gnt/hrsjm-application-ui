import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';

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
    borderColor: '#DBE5EE',
    marginTop: Spacing.sm,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 4,
  },
  message: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
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
    backgroundColor: '#FAD465',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButtonText: {
    fontFamily: FontFamilies.sans,
    color: '#011F39',
    fontSize: 13,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontFamily: FontFamilies.sans,
    color: '#06294D',
    fontSize: 13,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#DBE5EE',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    fontFamily: FontFamilies.sans,
    color: '#34516D',
    fontSize: 12,
    fontWeight: '600',
  },
});
