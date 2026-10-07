import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils';
import type { JournalEntryItem } from '../types/accounting.types';

interface JournalEntryLinesModalProps {
  visible: boolean;
  entry: JournalEntryItem | null;
  onClose: () => void;
  onReverse?: (entry: JournalEntryItem) => void;
}

const formatDateDisplay = (dateIso: string): string => {
  try {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return dateIso;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateIso;
  }
};

export const JournalEntryLinesModal: React.FC<JournalEntryLinesModalProps> = ({
  visible,
  entry,
  onClose,
  onReverse,
}) => {
  if (!entry) return null;

  const isReversible = !entry.is_reversed && entry.entry_type !== 'REVERSAL';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.entryNumber}>{entry.entry_number}</Text>
              <Text style={styles.entryDate}>
                Posted on {formatDateDisplay(entry.entry_date)}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                entry.is_reversed ? styles.statusBadgeReversed : styles.statusBadgePosted,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  entry.is_reversed ? styles.statusTextReversed : styles.statusTextPosted,
                ]}
              >
                {entry.is_reversed ? 'Reversed' : 'Posted'}
              </Text>
            </View>
          </View>

          {/* Narration Box */}
          {entry.narration ? (
            <View style={styles.narrationBox}>
              <Text style={styles.narrationLabel}>Narration / Description</Text>
              <Text style={styles.narrationContent}>{entry.narration}</Text>
            </View>
          ) : null}

          {/* Lines Table */}
          <Text style={styles.sectionTitle}>General Ledger Lines</Text>
          <ScrollView style={styles.linesScroll} showsVerticalScrollIndicator={false}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, styles.thAccount]}>Account</Text>
              <Text style={[styles.thCell, styles.thAmount]}>Debit (₹)</Text>
              <Text style={[styles.thCell, styles.thAmount]}>Credit (₹)</Text>
            </View>

            {/* Table Rows */}
            {entry.lines && entry.lines.length > 0 ? (
              entry.lines.map(line => {
                const debit = Number(line.debit_amount ?? (line as any).debit ?? 0);
                const credit = Number(line.credit_amount ?? (line as any).credit ?? 0);
                return (
                  <View key={line.id} style={styles.tableRow}>
                    <View style={styles.thAccount}>
                      <Text style={styles.lineAccountName}>
                        {line.account?.account_name || 'Account'}
                      </Text>
                      {line.account?.account_code && (
                        <Text style={styles.lineAccountCode}>
                          {line.account.account_code} • {line.account.account_type}
                        </Text>
                      )}
                    </View>

                    <Text style={[styles.thAmount, styles.debitText]}>
                      {debit > 0 ? formatINR(debit) : '—'}
                    </Text>

                    <Text style={[styles.thAmount, styles.creditText]}>
                      {credit > 0 ? formatINR(credit) : '—'}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyLines}>
                <Text style={styles.emptyLinesText}>
                  Total Debit: {formatINR(entry.total_debit)} • Total Credit: {formatINR(entry.total_credit)}
                </Text>
              </View>
            )}

            {/* Total Balanced Summary */}
            <View style={styles.tableTotalRow}>
              <Text style={[styles.thAccount, styles.totalLabel]}>Total</Text>
              <Text style={[styles.thAmount, styles.totalAmount]}>
                {formatINR(entry.total_debit)}
              </Text>
              <Text style={[styles.thAmount, styles.totalAmount]}>
                {formatINR(entry.total_credit)}
              </Text>
            </View>
          </ScrollView>

          {/* Action Button: Reverse Entry */}
          {isReversible && onReverse && (
            <TouchableOpacity
              style={styles.reverseBtn}
              onPress={() => {
                onClose();
                onReverse(entry);
              }}
            >
              <Text style={styles.reverseBtnText}>Reverse This Entry</Text>
            </TouchableOpacity>
          )}

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  entryDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgePosted: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeReversed: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPosted: {
    color: '#16A34A',
  },
  statusTextReversed: {
    color: '#DC2626',
  },
  narrationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  narrationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  narrationContent: {
    fontSize: 12,
    color: '#1E293B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  linesScroll: {
    maxHeight: 220,
    marginBottom: Spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  thAccount: {
    flex: 2,
  },
  thAmount: {
    flex: 1,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineAccountName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  lineAccountCode: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  debitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  creditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  tableTotalRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#EBF1FF',
    borderRadius: 6,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  emptyLines: {
    padding: 12,
    alignItems: 'center',
  },
  emptyLinesText: {
    fontSize: 12,
    color: '#64748B',
  },
  reverseBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  reverseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
