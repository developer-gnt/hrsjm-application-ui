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
}

export const RenewNowButton: React.FC<RenewNowButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <View style={styles.buttonWrapper}>
      <TouchableOpacity
        style={[styles.primaryButton, disabled && styles.buttonDisabled]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Renew Now"
      >
        <Text style={styles.buttonText}>Renew Now →</Text>
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
    backgroundColor: '#0F2860',
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
