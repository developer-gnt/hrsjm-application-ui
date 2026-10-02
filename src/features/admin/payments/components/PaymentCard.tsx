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
import type { MembershipPaymentItem } from '../types/payments.types';

interface PaymentCardProps {
  payment: MembershipPaymentItem;
  onPress: () => void;
}

/** Payment row in the verification queue (spec §24 layout). */
export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.topRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {payment.user?.full_name ?? 'Unknown member'}
        </Text>
        <Text style={styles.paymentMeta}>
          {payment.membership?.category?.name ?? 'Membership'} ·{' '}
          {formatDate(payment.created_at)}
        </Text>
      </View>
      <AdminStatusBadge
        label={payment.payment_status}
        tone={adminStatusTone(payment.payment_status)}
      />
    </View>

    <View style={styles.bottomRow}>
      <View style={styles.amountBox}>
        <Text style={styles.amount}>{formatINR(payment.amount)}</Text>
        <Text style={styles.method}>{payment.payment_method}</Text>
      </View>
      <View style={styles.actionHint}>
        <Text style={styles.reference} numberOfLines={1}>
          {payment.transaction_id ?? payment.gateway_order_id ?? '—'}
        </Text>
        <Text style={styles.chevron}>›</Text>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  paymentMeta: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  amountBox: {
    gap: 2,
  },
  amount: {
    ...Typography.metric,
    color: AdminColors.primary,
  },
  method: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: 140,
  },
  reference: {
    ...Typography.caption,
    color: AdminColors.textMuted,
  },
  chevron: {
    ...Typography.sectionHeader,
    color: AdminColors.textMuted,
  },
});