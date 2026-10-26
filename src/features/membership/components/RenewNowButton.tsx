import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

interface RenewNowButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  amount?: number;
  label?: string;
}

export const RenewNowButton: React.FC<RenewNowButtonProps> = ({
  onPress,
  disabled = false,
  amount,
  label,
}) => {
  const displayText = label
    ? label
    : amount !== undefined && amount > 0
    ? `Pay ₹${amount.toLocaleString('en-IN')} & Renew →`
    : 'Renew Now →';

  return (
    <View style={styles.buttonWrapper}>
      <TouchableOpacity
        style={[styles.primaryButton, disabled && styles.buttonDisabled]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={displayText}
      >
        <Text style={styles.buttonText}>{displayText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  primaryButton: {
    backgroundColor: '#FAD465',
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#011F39',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
