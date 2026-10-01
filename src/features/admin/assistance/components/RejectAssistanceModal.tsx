import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppBottomSheet } from '../../../../core/components/common/AppBottomSheet';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { colors, spacing, typography } from '../../../../core/theme/theme';

interface RejectAssistanceModalProps {
  visible: boolean;
  requesterName: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectAssistanceModal({
  visible,
  requesterName,
  loading,
  error,
  onClose,
  onConfirm,
}: RejectAssistanceModalProps) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setReason('');
      setReasonError(null);
    }
  }, [visible]);

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError('Reason is required');
      return;
    }
    setReasonError(null);
    onConfirm(trimmed);
  };

  return (
    <AppBottomSheet
      visible={visible}
      title="Reject Assistance"
      onClose={loading ? () => undefined : onClose}>
      <Text style={styles.message}>
        Rejecting will close the request from {requesterName}. Please provide a reason.
      </Text>

      <AppInput
        label="Reason"
        required
        placeholder="Enter reason..."
        value={reason}
        onChangeText={text => {
          setReason(text);
          if (reasonError && text.trim()) {
            setReasonError(null);
          }
        }}
        multiline
        numberOfLines={3}
        error={reasonError}
        style={styles.reasonInput}
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
            title="Reject"
            onPress={handleConfirm}
            variant="danger"
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
  reasonInput: {
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

export default RejectAssistanceModal;
