import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDateTime, formatINR } from '../../../../core/utils';
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

  const renderHighlightIcon = () => {
    switch (classified.sourceHighlightIcon) {
      case 'heart':
        return <Heart size={12} color={classified.sourceHighlightColor} />;
      case 'user':
        return <User size={12} color={classified.sourceHighlightColor} />;
      case 'rotate-cw':
        return <RotateCcw size={12} color={classified.sourceHighlightColor} />;
      case 'landmark':
      default:
        return <Landmark size={12} color={classified.sourceHighlightColor} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Receipt ${voucher.voucher_number}, ${classified.categoryLabel}`}
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

        {/* Center column: Tag, Voucher No, Date */}
        <View style={styles.centerCol}>
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
              voucher.status === 'POSTED'
                ? styles.statusPosted
                : styles.statusCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                voucher.status === 'POSTED'
                  ? styles.statusPostedText
                  : styles.statusCancelledText,
              ]}
            >
              {voucher.status}
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

      {/* Source Highlight Pill (Cause / Member / Renewal / Account) */}
      <View
        style={[
          styles.sourceHighlightWrap,
          {
            backgroundColor: classified.sourceHighlightBg,
            borderColor: classified.sourceHighlightBorder,
          },
        ]}
      >
        <View style={styles.highlightIconWrap}>{renderHighlightIcon()}</View>
        <Text
          style={[
            styles.sourceHighlightText,
            { color: classified.sourceHighlightColor },
          ]}
          numberOfLines={1}
        >
          <Text style={styles.sourceHighlightLabel}>
            {classified.sourceHighlightLabel}{' '}
          </Text>
          {classified.sourceHighlightValue}
        </Text>
      </View>

      {/* Payer info: Clean multi-line layout with contact aligned directly under name */}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
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
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  voucherNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
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
    fontSize: 16,
    fontWeight: '800',
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
  sourceHighlightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  highlightIconWrap: {
    marginRight: 1,
  },
  sourceHighlightText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sourceHighlightLabel: {
    fontWeight: '800',
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