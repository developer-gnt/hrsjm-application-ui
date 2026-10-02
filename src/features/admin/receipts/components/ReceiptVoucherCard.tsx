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
import type { ReceiptEntryItem } from '../types/receipts.types';

interface ReceiptVoucherCardProps {
  voucher: ReceiptEntryItem;
  onPress: () => void;
}

/** Receipt voucher row (spec §28): income account, amount, bank/cash, date. */
export const ReceiptVoucherCard: React.FC<ReceiptVoucherCardProps> = ({
  voucher,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.topRow}>
      <View style={styles.voucherInfo}>
        <Text style={styles.voucherNumber}>{voucher.voucher_number}</Text>
        <Text style={styles.date}>{formatDate(voucher.receipt_date)}</Text>
      </View>
      <AdminStatusBadge
        label={voucher.status}
        tone={adminStatusTone(voucher.status)}
      />
    </View>

    <View style={styles.bottomRow}>
      <View style={styles.accountBox}>
        <Text style={styles.accountName} numberOfLines={1}>
          {voucher.income_account?.account_name ?? 'Income'}
        </Text>
        <Text style={styles.payer} numberOfLines={1}>
          From {voucher.received_from}
        </Text>
      </View>
      <View style={styles.amountBox}>
        <Text style={styles.amount}>{formatINR(voucher.amount)}</Text>
        <Text style={styles.method} numberOfLines={1}>
          {voucher.received_in_account?.account_name ?? voucher.payment_method}
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
  payer: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...Typography.metric,
    color: AdminColors.success,
  },
  method: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    maxWidth: 140,
  },
});