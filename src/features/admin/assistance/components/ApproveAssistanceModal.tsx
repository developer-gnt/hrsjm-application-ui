import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppBottomSheet } from '../../../../core/components/common/AppBottomSheet';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { colors, spacing, typography } from '../../../../core/theme/theme';

interface ApproveAssistanceModalProps {
  visible: boolean;
  requesterName: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (note?: string) => void;
}

export function ApproveAssistanceModal({
  visible,
  requesterName,
  loading,
  error,
  onClose,
  onConfirm,
}: ApproveAssistanceModalProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setNote('');
    }
  }, [visible]);

  return (
    <AppBottomSheet
      visible={visible}
      title="Approve Assistance"
      onClose={loading ? () => undefined : onClose}>
      <Text style={styles.message}>
        Are you sure you want to approve the request from {requesterName}?
      </Text>

      <AppInput
        label="Note (optional)"
        placeholder="Add an optional note for this approval"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        style={styles.noteInput}
      />

      {error ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <AppButton title="Cancel" onPress={onClose} variant="ghost" fullWidth disabled={loading} />
        </View>
        <View style={styles.actionButton}>
          <AppButton
            title="Approve"
            onPress={() => onConfirm(note)}
            variant="success"
            fullWidth
            loading={loading}
          />
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
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
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

export default ApproveAssistanceModal;
