import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { ConfirmDialog } from '../../../../core/components/common/ConfirmDialog';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import {
  AdminStatusBadge,
  adminStatusTone,
} from '../../../../core/components/admin/AdminStatusBadge';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing } from '../../../../core/theme/spacing';
import { formatDateTime, formatINR } from '../../../../core/utils';
import { AppRoutes } from '../../../../core/constants/routes';
import { usePaymentDetail, useSetPaymentStatus } from '../hooks/usePayments';
import { VerifyPaymentModal } from '../components/VerifyPaymentModal';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type PaymentDetailsScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.PAYMENT_DETAILS
>;

const DataRow: React.FC<{ label: string; value: string | null | undefined }> = ({
  label,
  value,
}) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value || '—'}</Text>
  </View>
);

/** Payment details with verify (idempotent) and manual status actions. */
export const PaymentDetailsScreen: React.FC<PaymentDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const paymentId = route.params.paymentId;
  const detail = usePaymentDetail(paymentId);
  const setStatusMutation = useSetPaymentStatus(paymentId);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [failVisible, setFailVisible] = useState(false);

  const payment = detail.data;

  if (detail.isLoading) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          title="Payment Details"
          showBack
          onBack={() => navigation.goBack()}
          onNavigate={target => navigation.navigate(target as any)}
        />
        <AppLoader fullScreen message="Loading payment…" />
      </View>
    );
  }

  if (detail.isError || !payment) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          title="Payment Details"
          showBack
          onBack={() => navigation.goBack()}
          onNavigate={target => navigation.navigate(target as any)}
        />
        <AppErrorState
          title="Unable to load payment"
          onRetry={() => void detail.refetch()}
        />
      </View>
    );
  }

  const isPending = payment.payment_status === 'PENDING';
  const receipt = payment.receipt;

  return (
    <View style={styles.flex}>
      <AdminHeader
        title="Payment Details"
        showBack
        onBack={() => navigation.goBack()}
        onNavigate={target => navigation.navigate(target as any)}
      />
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <AppCard variant="elevated">
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatINR(payment.amount)}</Text>
            <AdminStatusBadge
              label={payment.payment_status}
              tone={adminStatusTone(payment.payment_status)}
            />
          </View>
          <Text style={styles.memberName}>{payment.user?.full_name ?? 'Member'}</Text>
          <Text style={styles.memberMeta}>
            {payment.user?.mobile_number ?? '—'} ·{' '}
            {payment.membership?.category?.name ?? 'Membership'}
          </Text>
        </AppCard>

        <AppCard variant="elevated">
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <DataRow label="Payment ID" value={payment.id} />
          <DataRow label="Method" value={payment.payment_method} />
          <DataRow label="Transaction ID" value={payment.transaction_id} />
          <DataRow label="Gateway Payment ID" value={payment.gateway_payment_id} />
          <DataRow label="Gateway Order ID" value={payment.gateway_order_id} />
          <DataRow label="Payment Date" value={payment.payment_date ? formatDateTime(payment.payment_date) : null} />
          <DataRow label="Created" value={formatDateTime(payment.created_at)} />
          <DataRow label="Notes" value={payment.notes} />
        </AppCard>

        {payment.transactions && payment.transactions.length > 0 ? (
          <AppCard variant="elevated">
            <Text style={styles.sectionTitle}>Gateway Transactions</Text>
            {payment.transactions.map(transaction => (
              <DataRow
                key={transaction.id}
                label={`${transaction.gateway_name} · ${transaction.status}`}
                value={`${formatINR(transaction.amount)} · ${transaction.gateway_payment_id ?? '—'}`}
              />
            ))}
          </AppCard>
        ) : null}

        {receipt ? (
          <AppCard variant="elevated">
            <Text style={styles.sectionTitle}>Receipt</Text>
            <DataRow label="Receipt No." value={receipt.receipt_number} />
            <DataRow label="Issued To" value={receipt.issued_to} />
            <DataRow label="Amount" value={formatINR(receipt.amount)} />
            <DataRow label="Receipt Date" value={formatDateTime(receipt.receipt_date)} />
          </AppCard>
        ) : null}

        {isPending ? (
          <View style={styles.actions}>
            {can(PermissionKeys.PAYMENT_VERIFY) ? (
              <AppButton
                title="Verify Payment"
                onPress={() => setVerifyVisible(true)}
                variant="primary"
                size="lg"
              />
            ) : null}
            {can(PermissionKeys.PAYMENT_MANAGE_STATUS) ? (
              <AppButton
                title="Mark as Failed"
                onPress={() => setFailVisible(true)}
                variant="outline"
                size="lg"
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <VerifyPaymentModal
        visible={verifyVisible}
        payment={payment}
        onClose={() => setVerifyVisible(false)}
        onVerified={() => void detail.refetch()}
      />

      <ConfirmDialog
        visible={failVisible}
        title="Mark Payment as Failed"
        message="The payment will be marked FAILED. This does not create a receipt or journal entry."
        confirmTitle="Mark Failed"
        loading={setStatusMutation.isPending}
        onConfirm={() =>
          setStatusMutation.mutate(
            { status: 'FAILED', notes: 'Marked failed from payment details' },
            { onSuccess: () => setFailVisible(false) },
          )
        }
        onCancel={() => setFailVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    ...Typography.metricLarge,
    color: AdminColors.primary,
  },
  memberName: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
    marginTop: Spacing.sm,
  },
  memberMeta: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
  },
  dataLabel: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  dataValue: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    gap: Spacing.sm,
  },
});

export default PaymentDetailsScreen;