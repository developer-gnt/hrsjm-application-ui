import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils';
import type { LedgerTransaction } from '../types/accounting.types';

interface LedgerTransactionRowProps {
  transaction: LedgerTransaction;
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

export const LedgerTransactionRow: React.FC<LedgerTransactionRowProps> = ({
  transaction,
}) => {
  const isDebit = transaction.debit > 0;
  const isCredit = transaction.credit > 0;

  return (
    <View style={styles.card}>
      {/* Top line: Date + Entry Reference */}
      <View style={styles.headerRow}>
        <Text style={styles.dateText}>
          {formatDateDisplay(transaction.entry_date)}
        </Text>
        <View style={styles.refBadge}>
          <Text style={styles.refText}>{transaction.entry_number}</Text>
        </View>
      </View>

      {/* Narration & Account Info */}
      <View style={styles.contentRow}>
        <View style={styles.narrationBlock}>
          <Text style={styles.accountText}>
            {transaction.account_code ? `${transaction.account_code} • ` : ''}
            {transaction.account_name}
          </Text>
          <Text style={styles.narrationText} numberOfLines={2}>
            {transaction.narration || 'Journal transaction'}
          </Text>
        </View>

        {/* Amount & Running Balance */}
        <View style={styles.amountBlock}>
          {isDebit && (
            <Text style={styles.debitAmount}>
              + {formatINR(transaction.debit)}
            </Text>
          )}
          {isCredit && (
            <Text style={styles.creditAmount}>
              - {formatINR(transaction.credit)}
            </Text>
          )}

          <Text style={styles.runningBalance}>
            Bal: {formatINR(transaction.running_balance)}
          </Text>
        </View>
      </View>
    </View>
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
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  refBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  narrationBlock: {
    flex: 1,
  },
  accountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  narrationText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  debitAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  creditAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  runningBalance: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
});
