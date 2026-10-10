import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppBottomSheet } from '../../../../core/components/common/AppBottomSheet';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { colors, spacing, typography } from '../../../../core/theme/theme';

type ActionKind = 'START_REVIEW' | 'RESOLVE' | 'CLOSE';

const ACTION_COPY: Record<ActionKind, { title: string; question: string; confirm: string; noteLabel: string; placeholder: string }> = {
  START_REVIEW: {
    title: 'Start Review',
    question: 'Mark this ticket as In Progress and take over the review?',
    confirm: 'Start Review',
    noteLabel: 'Note (optional)',
    placeholder: 'Add an optional note to the conversation',
  },
  RESOLVE: {
    title: 'Resolve Ticket',
    question: 'Mark this ticket as Resolved? You can add a resolution note.',
    confirm: 'Resolve',
    noteLabel: 'Resolution note (optional)',
    placeholder: 'Describe how the issue was resolved',
  },
  CLOSE: {
    title: 'Close Ticket',
    question: 'Close this ticket? A closed ticket can no longer be reopened.',
    confirm: 'Close Ticket',
    noteLabel: 'Note (optional)',
    placeholder: 'Add an optional closing note',
  },
};

interface TicketStatusModalProps {
  visible: boolean;
  action: ActionKind;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (note?: string) => void;
}

// Confirmation bottom sheet for the supported status transitions. The
// RESOLVED note becomes a conversation message server-side (confirmed
// contract), so it doubles as the resolution note required by the phase plan.
export function TicketStatusModal({
  visible,
  action,
  loading,
  error,
  onClose,
  onConfirm,
}: TicketStatusModalProps) {
  const [note, setNote] = useState('');
  const copy = ACTION_COPY[action];

  useEffect(() => {
    if (!visible) {
      setNote('');
    }
  }, [visible]);

  return (
    <AppBottomSheet
      visible={visible}
      title={copy.title}
      onClose={loading ? () => undefined : onClose}>
      <Text style={styles.message}>{copy.question}</Text>

      <AppInput
        label={copy.noteLabel}
        placeholder={copy.placeholder}
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
            title={copy.confirm}
            onPress={() => onConfirm(note)}
            variant={action === 'CLOSE' ? 'danger' : 'success'}
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

export default TicketStatusModal;
