import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { formatDate, formatINR } from '../../../../core/utils';
import {
  AdminStatusBadge,
  adminStatusTone,
} from '../../../../core/components/admin/AdminStatusBadge';
import type { MembershipPaymentItem } from '../types/payments.types';

interface PaymentCardProps {
  payment: MembershipPaymentItem;
  onPress: () => void;
}

const getInitials = (name?: string): string => {
  if (!name) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/** Payment row in the verification queue (spec §24 layout). */
export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onPress,
}) => {
  const memberName = payment.user?.full_name ?? 'Unknown member';
  const initials = getInitials(memberName);
  const isOnline = payment.payment_method?.toUpperCase().includes('ONLINE') ||
    payment.payment_method?.toUpperCase().includes('GATEWAY') ||
    payment.payment_method?.toUpperCase().includes('RAZORPAY');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {memberName}
          </Text>
          <Text style={styles.paymentMeta} numberOfLines={1}>
            {payment.membership?.category?.name ?? 'Membership'} · {formatDate(payment.created_at)}
          </Text>
        </View>

        <AdminStatusBadge
          label={payment.payment_status}
          tone={adminStatusTone(payment.payment_status)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <Text style={styles.amount}>{formatINR(payment.amount)}</Text>
        </View>

        <View style={styles.rightInfo}>
          <View style={styles.methodPill}>
            <View
              style={[
                styles.methodDot,
                { backgroundColor: isOnline ? '#3B82F6' : '#10B981' },
              ]}
            />
            <Text style={styles.methodText}>
              {payment.payment_method || 'OFFLINE'}
            </Text>
          </View>

          <View style={styles.actionHint}>
            <Text style={styles.reference} numberOfLines={1}>
              {payment.transaction_id ?? payment.gateway_order_id ?? '—'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF1FB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E2F7',
  },
  avatarText: {
    color: '#123B7A',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: '#0F172A',
  },
  paymentMeta: {
    ...Typography.caption,
    color: '#64748B',
    marginTop: 2,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amountBox: {
    gap: 2,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#123B7A',
  },
  rightInfo: {
    alignItems: 'flex-end',
    gap: 6,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 160,
  },
  reference: {
    ...Typography.caption,
    color: '#94A3B8',
    fontSize: 11,
  },
  chevron: {
    fontSize: 16,
    lineHeight: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
});