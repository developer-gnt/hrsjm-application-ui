import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppBottomSheet } from '../../../../core/components/common/AppBottomSheet';
import { AppButton } from '../../../../core/components/common/AppButton';
import { colors, spacing, typography } from '../../../../core/theme/theme';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Logout flow per the phase plan: confirmation -> shared auth logout ->
// clear secure session -> Auth Navigator. The navigation switch happens in
// RootNavigator once the shared AuthContext status becomes unauthenticated.
export function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
  return (
    <AppBottomSheet visible={visible} title="Log Out" onClose={onClose}>
      <Text style={styles.message}>
        Are you sure you want to log out of the admin app? Your session will be
        cleared from this device.
      </Text>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <AppButton title="Cancel" onPress={onClose} variant="ghost" fullWidth />
        </View>
        <View style={styles.actionButton}>
          <AppButton title="Log Out" onPress={onConfirm} variant="danger" fullWidth />
        </View>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

export default LogoutModal;
