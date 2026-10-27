import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDateTime, formatINR } from '../../../../core/utils';
import { FontFamilies, BorderRadius } from '../../../../core/theme';
import {
  Heart,
  User,
  RotateCcw,
  TrendingUp,
  ChevronRight,
  Landmark,
  Zap,
  Banknote,
  FileText,
  CreditCard,
} from '../../../../core/components/icons';
import type { ReceiptEntryItem } from '../types/receipts.types';
import {
  classifyReceipt,
  formatPaymentMethodBadge,
  formatVoucherStatusBadge,
} from '../utils/receiptClassification';

interface ReceiptVoucherCardProps {
  voucher: ReceiptEntryItem;
  onPress: () => void;
}

export const ReceiptVoucherCard: React.FC<ReceiptVoucherCardProps> = ({
  voucher,
  onPress,
}) => {
  const isCancelled = voucher.status === 'CANCELLED';
  const classified = classifyReceipt(voucher);
  const methodBadge = formatPaymentMethodBadge(voucher.payment_method);
  const statusBadge = formatVoucherStatusBadge(voucher.status);

  const renderIcon = () => {
    switch (classified.iconType) {
      case 'heart':
        return <Heart size={18} color={classified.iconColor} />;
      case 'user':
        return <User size={18} color={classified.iconColor} />;
      case 'rotate-cw':
        return <RotateCcw size={18} color={classified.iconColor} />;
      case 'chart':
      default:
        return <TrendingUp size={18} color={classified.iconColor} />;
    }
  };

  const renderMethodIcon = () => {
    switch (methodBadge.iconName) {
      case 'upi':
        return <Zap size={10.5} color={methodBadge.color} />;
      case 'cash':
        return <Banknote size={10.5} color={methodBadge.color} />;
      case 'cheque':
        return <FileText size={10.5} color={methodBadge.color} />;
      case 'card':
        return <CreditCard size={10.5} color={methodBadge.color} />;
      case 'bank':
      default:
        return <Landmark size={10.5} color={methodBadge.color} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Receipt ${voucher.voucher_number}, ${classified.categoryLabel}, Source ${classified.sourceLabel}`}
    >
      {/* Top Header Row with Icon, Center Details, Right Amount & Chevron */}
      <View style={styles.cardHeaderRow}>
        {/* Left Category Icon Box */}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: classified.iconBg,
              borderColor: classified.iconBorder,
            },
          ]}
        >
          {renderIcon()}
        </View>

        {/* Center column: Income Type Badge & Source Badge, Voucher No, Date */}
        <View style={styles.centerCol}>
          <View style={styles.tagRow}>
            {/* Income Type Badge */}
            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor: classified.badgeBg,
                  borderColor: classified.badgeBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: classified.badgeColor },
                ]}
                numberOfLines={1}
              >
                {classified.categoryLabel}
              </Text>
            </View>

            {/* Source Badge (Website / Web App / Application) */}
            <View
              style={[
                styles.sourcePill,
                {
                  backgroundColor: classified.sourceBadgeBg,
                  borderColor: classified.sourceBadgeBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.sourcePillText,
                  { color: classified.sourceBadgeColor },
                ]}
                numberOfLines={1}
              >
                {classified.sourceBadgeText}
              </Text>
            </View>
          </View>

          <Text style={styles.voucherNumber} numberOfLines={1}>
            {voucher.voucher_number}
          </Text>

          <Text style={styles.dateText}>
            {formatDateTime(voucher.receipt_date || voucher.created_at).replace(', ', ' • ')}
          </Text>
        </View>

        {/* Right column: Status Badge, Amount, Payment Method */}
        <View style={styles.rightCol}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusBadge.bg,
                borderColor: statusBadge.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: statusBadge.color },
              ]}
            >
              {statusBadge.label}
            </Text>
          </View>

          <Text
            style={[
              styles.amountText,
              isCancelled && styles.amountTextCancelled,
            ]}
          >
            {formatINR(voucher.amount)}
          </Text>

          <View
            style={[
              styles.methodBadge,
              {
                backgroundColor: methodBadge.bg,
                borderColor: methodBadge.border,
              },
            ]}
          >
            {renderMethodIcon()}
            <Text
              style={[styles.methodBadgeText, { color: methodBadge.color }]}
              numberOfLines={1}
            >
              {methodBadge.label}
            </Text>
          </View>
        </View>

        {/* Dedicated Chevron Right at far right edge */}
        <View style={styles.chevronWrap}>
          <ChevronRight size={18} color="#94A3B8" />
        </View>
      </View>

      {/* Payer info: Clean multi-line layout - ONLY shown if real payerName exists! */}
      {classified.payerName ? (
        <View style={styles.payerRow}>
          <Text style={styles.fromLabel}>From:</Text>
          <View style={styles.payerDetailsCol}>
            <Text style={styles.fromName} numberOfLines={1}>
              {classified.payerName}
            </Text>
            {classified.payerContact ? (
              <Text style={styles.contactText} numberOfLines={1}>
                ({classified.payerContact})
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  centerCol: {
    flex: 1,
    gap: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sourcePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  sourcePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  voucherNumber: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0B2F52',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#718096',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  statusPosted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusPostedText: {
    color: '#059669',
  },
  statusCancelledText: {
    color: '#DC2626',
  },
  amountText: {
    fontFamily: FontFamilies.display,
    fontSize: 15.5,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: -0.2,
  },
  amountTextCancelled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  methodBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 1,
  },
  fromLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 16,
  },
  payerDetailsCol: {
    flex: 1,
    gap: 2,
  },
  fromName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 16,
  },
  contactText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
});

export default ReceiptVoucherCard;