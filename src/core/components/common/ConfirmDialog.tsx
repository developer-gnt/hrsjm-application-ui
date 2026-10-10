import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle?: string;
  cancelTitle?: string;
  /** When set, the dialog asks for a reason text before confirming. */
  requiresReason?: boolean;
  reasonPlaceholder?: string;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

interface ReasonInputProps extends TextInputProps {
  label: string;
}

const ReasonInput: React.FC<ReasonInputProps> = props => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{props.label}</Text>
    <TextInput
      multiline
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor={AdminColors.textMuted}
    />
  </View>
);

/**
 * Confirmation dialog (spec §10 ConfirmDialog) with optional reason capture
 * (used for voucher cancellations that trigger backend reversals).
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
  requiresReason = false,
  reasonPlaceholder = 'Reason (optional)',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(requiresReason ? reason.trim() || undefined : undefined);
  };

  return (
    <AppModal visible={visible} onClose={onCancel} title={title}>
      <Text style={styles.message}>{message}</Text>
      {requiresReason ? (
        <ReasonInput
          label="Reason"
          placeholder={reasonPlaceholder}
          value={reason}
          onChangeText={setReason}
          editable={!loading}
          numberOfLines={3}
        />
      ) : null}
      <View style={styles.actions}>
        <AppButton
          title={cancelTitle}
          onPress={onCancel}
          variant="outline"
          style={styles.button}
          disabled={loading}
        />
        <AppButton
          title={confirmTitle}
          onPress={handleConfirm}
          variant="danger"
          style={styles.button}
          loading={loading}
          disabled={loading}
        />
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  message: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: 8,
    padding: Spacing.md,
    minHeight: 70,
    textAlignVertical: 'top',
    ...Typography.body,
    color: AdminColors.textPrimary,
    backgroundColor: AdminColors.cardSurface,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
  },
});