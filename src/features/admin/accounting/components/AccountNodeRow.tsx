import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import type { AccountTreeNode, AccountType } from '../types/accounting.types';

interface AccountNodeRowProps {
  node: AccountTreeNode;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onPress: (node: AccountTreeNode) => void;
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
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const config = TYPE_CONFIG[node.account_type] || {
    label: node.account_type,
    bg: '#F1F5F9',
    color: '#475569',
  };

  const indentPadding = Math.min(node.level * 16, 48);

  return (
    <View style={[styles.container, { paddingLeft: Spacing.sm + indentPadding }]}>
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

      {/* Account Info Content */}
      <TouchableOpacity
        style={styles.contentWrap}
        onPress={() => onPress(node)}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>

      {/* Badges & Status */}
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

        <TouchableOpacity
          style={styles.actionHitbox}
          onPress={() => onPress(node)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.chevronIcon}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
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
  contentWrap: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  actionHitbox: {
    paddingHorizontal: 4,
  },
  chevronIcon: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '400',
  },
});
