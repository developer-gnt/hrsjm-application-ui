import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils/currency';
import type { AccountTreeNode, AccountType } from '../types/accounting.types';
import type { TrialBalanceAccountItem } from '../../reports/types/reports.types';

interface AccountNodeRowProps {
  node: AccountTreeNode;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onPress: (node: AccountTreeNode) => void;
  balance?: TrialBalanceAccountItem;
}

const TYPE_CONFIG: Record<AccountType, { label: string; bg: string; color: string }> = {
  ASSET: { label: 'Asset', bg: '#E0F2FE', color: '#0369A1' },
  LIABILITY: { label: 'Liability', bg: '#FEF3C7', color: '#B45309' },
  FUND_EQUITY: { label: 'Equity', bg: '#F3E8FF', color: '#7E22CE' },
  INCOME: { label: 'Income', bg: '#DCFCE7', color: '#15803D' },
  EXPENSE: { label: 'Expense', bg: '#FEE2E2', color: '#B91C1C' },
};

export const AccountNodeRow: React.FC<AccountNodeRowProps> = ({
  node,
  isExpanded,
  onToggleExpand,
  onPress,
  balance,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const config = TYPE_CONFIG[node.account_type] || {
    label: node.account_type,
    bg: '#F1F5F9',
    color: '#475569',
  };

  const indentPadding = Math.min(node.level * 14, 42);

  const grossCredit = balance?.gross_credit ?? 0;
  const grossDebit = balance?.gross_debit ?? 0;
  const isDebitNormal = node.account_type === 'ASSET' || node.account_type === 'EXPENSE';
  const closingBalance = isDebitNormal
    ? (balance?.debit_balance ?? 0)
    : (balance?.credit_balance ?? 0);

  return (
    <TouchableOpacity
      style={[styles.container, { paddingLeft: Spacing.sm + indentPadding }]}
      onPress={() => onPress(node)}
      activeOpacity={0.8}
    >
      {/* Header Row: Expand/bullet + Code/Name + Badges + Chevron */}
      <View style={styles.headerRow}>
        {/* Expand/collapse icon or bullet */}
        <TouchableOpacity
          style={styles.expandHitbox}
          onPress={() => hasChildren && onToggleExpand(node.id)}
          disabled={!hasChildren}
          activeOpacity={0.7}
        >
          {hasChildren ? (
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          ) : (
            <View style={styles.bulletDot} />
          )}
        </TouchableOpacity>

        {/* Account Code & Name */}
        <View style={styles.titleWrap}>
          <View style={styles.titleRow}>
            {node.account_code ? (
              <Text style={styles.codeText}>{node.account_code}</Text>
            ) : null}
            <Text
              style={[
                styles.nameText,
                node.level === 0 && styles.nameTextRoot,
                !node.is_active && styles.nameTextInactive,
              ]}
              numberOfLines={1}
            >
              {node.account_name}
            </Text>
          </View>
          {node.description ? (
            <Text style={styles.descText} numberOfLines={1}>
              {node.description}
            </Text>
          ) : null}
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.typeBadgeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          {!node.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactive</Text>
            </View>
          )}
          <Text style={styles.chevronIcon}>›</Text>
        </View>
      </View>

      {/* Financial Figures Pill Row */}
      <View style={styles.financialRow}>
        <View style={[styles.finMetric, styles.creditFinMetric]}>
          <Text style={styles.finLabel}>Incoming / Credit</Text>
          <Text style={styles.creditValue} numberOfLines={1}>
            {grossCredit > 0 ? `+ ${formatINR(grossCredit, { noDecimals: true })}` : '—'}
          </Text>
        </View>

        <View style={[styles.finMetric, styles.debitFinMetric]}>
          <Text style={styles.finLabel}>Expense / Debit</Text>
          <Text style={styles.debitValue} numberOfLines={1}>
            {grossDebit > 0 ? `- ${formatINR(grossDebit, { noDecimals: true })}` : '—'}
          </Text>
        </View>

        <View style={[styles.finMetric, styles.closingFinMetric]}>
          <Text style={styles.finLabel}>Closing Balance</Text>
          <Text style={styles.closingValue} numberOfLines={1}>
            {formatINR(closingBalance, { noDecimals: true })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingRight: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandHitbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  expandIcon: {
    fontSize: 10,
    color: '#64748B',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  titleWrap: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flexShrink: 1,
  },
  nameTextRoot: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 14,
  },
  nameTextInactive: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  descText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inactiveBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  chevronIcon: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '400',
    marginLeft: 2,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingLeft: 28,
  },
  finMetric: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  creditFinMetric: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  debitFinMetric: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  closingFinMetric: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  finLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  creditValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 1,
  },
  debitValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 1,
  },
  closingValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
});
