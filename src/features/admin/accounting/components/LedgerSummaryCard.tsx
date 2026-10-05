import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, BorderRadius, Shadows, Spacing } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils';
import type { LedgerSummary } from '../types/accounting.types';

interface LedgerSummaryCardProps {
  summary: LedgerSummary;
  accountName?: string;
  accountCode?: string | null;
}

export const LedgerSummaryCard: React.FC<LedgerSummaryCardProps> = ({
  summary,
  accountName,
  accountCode,
}) => {
  return (
    <View style={styles.card}>
      {accountName ? (
        <View style={styles.headerRow}>
          <Text style={styles.accountTitle} numberOfLines={1}>
            {accountCode ? `${accountCode} — ` : ''}
            {accountName}
          </Text>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.accountTitle}>Global Organization Ledger</Text>
        </View>
      )}

      {/* 4-KPI Grid */}
      <View style={styles.grid}>
        <View style={[styles.kpiBox, styles.kpiBoxNeutral]}>
          <Text style={styles.kpiLabel}>Opening Balance</Text>
          <Text style={styles.kpiValueNeutral}>
            {formatINR(summary.opening_balance)}
          </Text>
        </View>

        <View style={[styles.kpiBox, styles.kpiBoxDebit]}>
          <Text style={styles.kpiLabel}>Total Debits (Dr)</Text>
          <Text style={styles.kpiValueDebit}>
            + {formatINR(summary.total_debit)}
          </Text>
        </View>

        <View style={[styles.kpiBox, styles.kpiBoxCredit]}>
          <Text style={styles.kpiLabel}>Total Credits (Cr)</Text>
          <Text style={styles.kpiValueCredit}>
            - {formatINR(summary.total_credit)}
          </Text>
        </View>

        <View style={[styles.kpiBox, styles.kpiBoxPrimary]}>
          <Text style={styles.kpiLabel}>Closing Balance</Text>
          <Text style={styles.kpiValuePrimary}>
            {formatINR(summary.closing_balance)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    marginBottom: Spacing.sm,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  kpiBoxNeutral: {
    backgroundColor: '#F8FAFC',
  },
  kpiBoxDebit: {
    backgroundColor: '#EFF6FF',
  },
  kpiBoxCredit: {
    backgroundColor: '#FFF7ED',
  },
  kpiBoxPrimary: {
    backgroundColor: '#EBF1FF',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  kpiValueNeutral: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  kpiValueDebit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  kpiValueCredit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  kpiValuePrimary: {
    fontSize: 15,
    fontWeight: '800',
    color: AdminColors.primary,
  },
});
