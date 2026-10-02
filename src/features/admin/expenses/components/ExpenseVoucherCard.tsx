import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { formatDate, formatINR } from '../../../../core/utils';
import {
  AdminStatusBadge,
  adminStatusTone,
} from '../../../../core/components/admin/AdminStatusBadge';
import type { ExpenseEntryItem } from '../types/expenses.types';

interface ExpenseVoucherCardProps {
  voucher: ExpenseEntryItem;
  onPress: () => void;
}

/** Expense voucher row (spec §27): account, amount, bank/cash, date, status. */
export const ExpenseVoucherCard: React.FC<ExpenseVoucherCardProps> = ({
  voucher,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.topRow}>
      <View style={styles.voucherInfo}>
        <Text style={styles.voucherNumber}>{voucher.voucher_number}</Text>
        <Text style={styles.date}>{formatDate(voucher.expense_date)}</Text>
      </View>
      <AdminStatusBadge
        label={voucher.status}
        tone={adminStatusTone(voucher.status)}
      />
    </View>

    <View style={styles.bottomRow}>
      <View style={styles.accountBox}>
        <Text style={styles.accountName} numberOfLines={1}>
          {voucher.expense_account?.account_name ?? 'Expense'}
        </Text>
        <Text style={styles.paidTo} numberOfLines={1}>
          Paid to {voucher.paid_to}
        </Text>
      </View>
      <View style={styles.amountBox}>
        <Text style={styles.amount}>{formatINR(voucher.amount)}</Text>
        <Text style={styles.method} numberOfLines={1}>
          {voucher.paid_from_account?.account_name ?? voucher.payment_method}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voucherInfo: {
    gap: 2,
  },
  voucherNumber: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  date: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  accountBox: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
  },
  paidTo: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...Typography.metric,
    color: AdminColors.error,
  },
  method: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    maxWidth: 140,
  },
});