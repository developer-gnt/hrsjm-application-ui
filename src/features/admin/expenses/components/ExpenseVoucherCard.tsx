import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows, FontFamilies } from '../../../../core/theme';
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
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
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
    color: '#0B2F52',
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 11.5,
    color: '#718096',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#DBE5EE',
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
    color: '#0B2F52',
    marginBottom: 2,
  },
  paidTo: {
    fontSize: 12,
    color: '#34516D',
  },
  paidToHighlight: {
    fontWeight: '600',
    color: '#0B2F52',
  },
  referenceText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: -0.2,
  },
  amountCancelled: {
    color: '#718096',
    textDecorationLine: 'line-through',
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBE5EE',
    maxWidth: 130,
  },
  methodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06294D',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#06294D',
  },
});

export default ExpenseVoucherCard;