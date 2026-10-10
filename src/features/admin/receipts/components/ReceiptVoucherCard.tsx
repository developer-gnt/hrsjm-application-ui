import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows } from '../../../../core/theme';
import { formatDate, formatINR } from '../../../../core/utils';
import {
  AdminStatusBadge,
  adminStatusTone,
} from '../../../../core/components/admin/AdminStatusBadge';
import { TrendingUp } from '../../../../core/components/icons';
import type { ReceiptEntryItem } from '../types/receipts.types';

interface ReceiptVoucherCardProps {
  voucher: ReceiptEntryItem;
  onPress: () => void;
}

/** Receipt voucher row with full typography, payment method badge and income amount indicator. */
export const ReceiptVoucherCard: React.FC<ReceiptVoucherCardProps> = ({
  voucher,
  onPress,
}) => {
  const accountName = voucher.income_account?.account_name ?? 'Income';
  const receivedIn =
    voucher.received_in_account?.account_name ?? voucher.payment_method ?? 'Bank';
  const isCancelled = voucher.status === 'CANCELLED';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={onPress}>
      {/* Top Section: Voucher Number, Date & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.iconBadge}>
          <TrendingUp size={16} color="#16A34A" />
        </View>
        <View style={styles.voucherInfo}>
          <Text style={styles.voucherNumber}>{voucher.voucher_number}</Text>
          <Text style={styles.date}>{formatDate(voucher.receipt_date)}</Text>
        </View>
        <AdminStatusBadge
          label={voucher.status}
          tone={adminStatusTone(voucher.status)}
        />
      </View>

      <View style={styles.divider} />

      {/* Bottom Section: Account, Payer & Amount */}
      <View style={styles.bottomRow}>
        <View style={styles.accountBox}>
          <Text style={styles.accountName} numberOfLines={1}>
            {accountName}
          </Text>
          <Text style={styles.receivedFrom} numberOfLines={1}>
            From <Text style={styles.receivedFromHighlight}>{voucher.received_from}</Text>
          </Text>
          {voucher.description ? (
            <Text style={styles.narrationText} numberOfLines={1}>
              {voucher.description}
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
              {receivedIn}
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
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
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
  receivedFrom: {
    fontSize: 12,
    color: '#64748B',
  },
  receivedFromHighlight: {
    fontWeight: '600',
    color: '#334155',
  },
  narrationText: {
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
    color: '#16A34A',
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
    backgroundColor: '#16A34A',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});

export default ReceiptVoucherCard;