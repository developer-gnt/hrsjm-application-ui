import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Shadows } from '../../../../core/theme';
import { ChevronRight, ChevronDown } from '../../../../core/components/icons';
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

const TYPE_CONFIG: Record<AccountType, { label: string; bg: string; color: string; border: string }> = {
  ASSET: { label: 'Asset', bg: '#EFF6FF', color: '#2563EB', border: '#DBEAFE' },
  LIABILITY: { label: 'Liability', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  FUND_EQUITY: { label: 'Equity', bg: '#FAF5FF', color: '#9333EA', border: '#F3E8FF' },
  INCOME: { label: 'Income', bg: '#ECFDF5', color: '#16A34A', border: '#D1FAE5' },
  EXPENSE: { label: 'Expense', bg: '#FEF2F2', color: '#DC2626', border: '#FEE2E2' },
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
    border: '#E2E8F0',
  };

  const indentPadding = Math.min(node.level * 10, 30);

  const grossCredit = balance?.gross_credit ?? 0;
  const grossDebit = balance?.gross_debit ?? 0;
  const isDebitNormal = node.account_type === 'ASSET' || node.account_type === 'EXPENSE';
  const closingBalance = isDebitNormal
    ? (balance?.debit_balance ?? 0)
    : (balance?.credit_balance ?? 0);

  return (
    <View style={[styles.wrapper, { paddingLeft: indentPadding }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(node)}
        activeOpacity={0.8}
      >
        {/* Header Row: Expand/bullet + Code + Name + Category Badge + Chevron */}
        <View style={styles.headerRow}>
          {/* Expand/collapse icon or bullet */}
          {hasChildren ? (
            <TouchableOpacity
              style={styles.expandHitbox}
              onPress={() => onToggleExpand(node.id)}
              activeOpacity={0.7}
            >
              {isExpanded ? (
                <ChevronDown size={14} color="#64748B" />
              ) : (
                <ChevronRight size={14} color="#64748B" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.bulletDot} />
          )}

          {/* Account Code Chip */}
          {node.account_code ? (
            <View style={styles.codeChip}>
              <Text style={styles.codeText}>{node.account_code}</Text>
            </View>
          ) : null}

          {/* Account Name */}
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

          {/* Type Badge & Actions */}
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
              <Text style={[styles.typeBadgeText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
            {!node.is_active && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
            <ChevronRight size={16} color="#94A3B8" />
          </View>
        </View>

        {/* Description if present */}
        {node.description ? (
          <Text style={styles.descText} numberOfLines={1}>
            {node.description}
          </Text>
        ) : null}

        {/* Financial Metrics Strip */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>INCOMING / CREDIT</Text>
            <Text
              style={[
                styles.metricVal,
                grossCredit > 0 ? styles.creditVal : styles.neutralVal,
              ]}
              numberOfLines={1}
            >
              {grossCredit > 0 ? `+ ${formatINR(grossCredit, { noDecimals: true })}` : '—'}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>EXPENSE / DEBIT</Text>
            <Text
              style={[
                styles.metricVal,
                grossDebit > 0 ? styles.debitVal : styles.neutralVal,
              ]}
              numberOfLines={1}
            >
              {grossDebit > 0 ? `- ${formatINR(grossDebit, { noDecimals: true })}` : '—'}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>CLOSING BALANCE</Text>
            <Text style={[styles.metricVal, styles.closingVal]} numberOfLines={1}>
              {formatINR(closingBalance, { noDecimals: true })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandHitbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginHorizontal: 4,
  },
  codeChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  nameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  nameTextRoot: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2C59',
  },
  nameTextInactive: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  descText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    paddingLeft: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inactiveBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  inactiveBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  creditVal: {
    color: '#16A34A',
  },
  debitVal: {
    color: '#DC2626',
  },
  closingVal: {
    color: '#0F2C59',
  },
  neutralVal: {
    color: '#94A3B8',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
});
