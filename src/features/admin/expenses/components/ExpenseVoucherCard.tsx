import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows } from '../../../../core/theme';
import { formatDate, formatINR } from '../../../../core/utils';
import {
  AdminStatusBadge,
  adminStatusTone,
} from '../../../../core/components/admin/AdminStatusBadge';
import { FileText } from '../../../../core/components/icons';
import type { ExpenseEntryItem } from '../types/expenses.types';

interface ExpenseVoucherCardProps {
  voucher: ExpenseEntryItem;
  onPress: () => void;
}

/** Expense voucher row with full typography, payment method badge and amount indicator. */
export const ExpenseVoucherCard: React.FC<ExpenseVoucherCardProps> = ({
  voucher,
  onPress,
}) => {
  const accountName = voucher.expense_account?.account_name ?? 'Expense';
  const paidFrom = voucher.paid_from_account?.account_name ?? voucher.payment_method ?? 'Bank';
  const isCancelled = voucher.status === 'CANCELLED';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={onPress}>
      {/* Top Section: Voucher Number, Date & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.iconBadge}>
          <FileText size={16} color="#DC2626" />
        </View>
        <View style={styles.voucherInfo}>
          <Text style={styles.voucherNumber}>{voucher.voucher_number}</Text>
          <Text style={styles.date}>{formatDate(voucher.expense_date)}</Text>
        </View>
        <AdminStatusBadge
          label={voucher.status}
          tone={adminStatusTone(voucher.status)}
        />
      </View>

      <View style={styles.divider} />

      {/* Middle/Bottom Section: Account, Payee & Amount */}
      <View style={styles.bottomRow}>
        <View style={styles.accountBox}>
          <Text style={styles.accountName} numberOfLines={1}>
            {accountName}
          </Text>
          <Text style={styles.paidTo} numberOfLines={1}>
            Paid to <Text style={styles.paidToHighlight}>{voucher.paid_to}</Text>
          </Text>
          {voucher.reference_number ? (
            <Text style={styles.referenceText} numberOfLines={1}>
              Ref: {voucher.reference_number}
            </Text>
          ) : null}
        </View>

        <View style={styles.amountBox}>
          <Text style={[styles.amount, isCancelled && styles.amountCancelled]}>
            {formatINR(voucher.amount)}
          </Text>
          <View style={styles.methodPill}>
            <View style={styles.methodDot} />
            <Text style={styles.methodText} numberOfLines={1}>
              {paidFrom}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherNumber: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  accountBox: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  paidTo: {
    fontSize: 12,
    color: '#64748B',
  },
  paidToHighlight: {
    fontWeight: '600',
    color: '#334155',
  },
  referenceText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: -0.2,
  },
  amountCancelled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 130,
  },
  methodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});

export default ExpenseVoucherCard;