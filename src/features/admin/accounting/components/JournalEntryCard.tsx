import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils';
import type { JournalEntryItem } from '../types/accounting.types';

interface JournalEntryCardProps {
  entry: JournalEntryItem;
  onPress: (entry: JournalEntryItem) => void;
  onReversePress?: (entry: JournalEntryItem) => void;
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

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  onReversePress,
}) => {
  const isReversed = entry.is_reversed || entry.entry_type === 'REVERSAL';
  const linesCount = entry.lines ? entry.lines.length : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(entry)}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.entryNumberBadge}>
          <Text style={styles.entryNumberText}>{entry.entry_number}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{formatDateDisplay(entry.entry_date)}</Text>
          <View
            style={[
              styles.statusBadge,
              isReversed ? styles.statusBadgeReversed : styles.statusBadgePosted,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isReversed ? styles.statusTextReversed : styles.statusTextPosted,
              ]}
            >
              {isReversed ? 'Reversed' : 'Posted'}
            </Text>
          </View>
        </View>
      </View>

      {/* Narration */}
      <Text style={styles.narrationText} numberOfLines={2}>
        {entry.narration || 'Journal Voucher Entry'}
      </Text>

      {/* Footer Info Row */}
      <View style={styles.footerRow}>
        <View style={styles.metaBlock}>
          {entry.reference_type && (
            <Text style={styles.refTag}>Ref: {entry.reference_type}</Text>
          )}
          {linesCount > 0 && (
            <Text style={styles.linesCountTag}>{linesCount} lines</Text>
          )}
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Total (Dr / Cr)</Text>
          <Text style={styles.amountValue}>
            {formatINR(entry.total_debit || entry.total_credit || 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryNumberBadge: {
    backgroundColor: '#EBF1FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  entryNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgePosted: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeReversed: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPosted: {
    color: '#16A34A',
  },
  statusTextReversed: {
    color: '#DC2626',
  },
  narrationText: {
    fontSize: 12,
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaBlock: {
    flexDirection: 'row',
    gap: 6,
  },
  refTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linesCountTag: {
    fontSize: 10,
    color: '#94A3B8',
    paddingVertical: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});
