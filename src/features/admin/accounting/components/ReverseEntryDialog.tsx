import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core/theme';
import type { JournalEntryItem } from '../types/accounting.types';

interface ReverseEntryDialogProps {
  visible: boolean;
  entry: JournalEntryItem | null;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const ReverseEntryDialog: React.FC<ReverseEntryDialogProps> = ({
  visible,
  entry,
  onCancel,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!entry) return null;

  const handleReverse = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onCancel();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reverse entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⚠️</Text>
          </View>

          <Text style={styles.title}>Reverse Journal Entry?</Text>
          <Text style={styles.subtitle}>
            This will create a mirrored correction entry for {entry.entry_number} and update all account balances.
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.inputLabel}>Reason for Reversal (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Duplicate entry, incorrect voucher amount..."
            placeholderTextColor="#94A3B8"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Keep Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleReverse} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Reversal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: Spacing.md,
    height: 60,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
