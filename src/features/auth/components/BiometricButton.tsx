import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { AppButton } from '../../../core/components/common/AppButton';
import { Spacing } from '../../../core/theme/spacing';
import { BiometryLabel } from '../hooks/useBiometrics';

interface BiometricButtonProps {
  biometryLabel: BiometryLabel;
  /** Hidden when disabled or unavailable (never show a dead button). */
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Trigger for the stored-session biometric unlock (BRD TC-ADMIN-004).
 * Rendered by LoginScreen only when biometrics are enabled AND the device
 * sensor is available.
 */
export const BiometricButton: React.FC<BiometricButtonProps> = ({
  biometryLabel,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => (
  <AppButton
    title={`Unlock with ${biometryLabel}`}
    onPress={onPress}
    variant="secondary"
    size="lg"
    loading={loading}
    disabled={disabled}
    icon={<Text style={styles.icon}>🔒</Text>}
    style={[styles.button, style]}
  />
);

const styles = StyleSheet.create({
  button: {
    marginTop: Spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
});