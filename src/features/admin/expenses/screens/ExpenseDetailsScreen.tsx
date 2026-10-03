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
import { formatDate, formatDateTime, formatINR } from '../../../../core/utils';
import { useCancelExpense, useExpenseDetail } from '../hooks/useExpenses';
import { AppRoutes } from '../../../../core/constants/routes';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type ExpenseDetailsScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.EXPENSE_DETAILS
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

/**
 * Expense voucher details: fields + posted journal lines + cancel (backend
 * performs the mirrored reversal).
 */
export const ExpenseDetailsScreen: React.FC<ExpenseDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const voucherId = route.params.voucherId;
  const detail = useExpenseDetail(voucherId);
  const cancelMutation = useCancelExpense(voucherId);
  const [cancelVisible, setCancelVisible] = useState(false);

  const voucher = detail.data;

  if (detail.isLoading) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          title="Expense Details"
          showBack
          onBack={() => navigation.goBack()}
          onNavigate={target => navigation.navigate(target as any)}
        />
        <AppLoader fullScreen message="Loading voucher…" />
      </View>
    );
  }

  if (detail.isError || !voucher) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          title="Expense Details"
          showBack
          onBack={() => navigation.goBack()}
          onNavigate={target => navigation.navigate(target as any)}
        />
        <AppErrorState
          title="Unable to load voucher"
          onRetry={() => void detail.refetch()}
        />
      </View>
    );
  }

  const isPosted = voucher.status === 'POSTED';
  const lines = voucher.accounting_entry?.lines ?? [];

  return (
    <View style={styles.flex}>
      <AdminHeader
        title="Expense Details"
        showBack
        onBack={() => navigation.goBack()}
        onNavigate={target => navigation.navigate(target as any)}
      />
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <AppCard variant="elevated">
          <View style={styles.topRow}>
            <Text style={styles.voucherNumber}>{voucher.voucher_number}</Text>
            <AdminStatusBadge
              label={voucher.status}
              tone={adminStatusTone(voucher.status)}
            />
          </View>
          <Text style={styles.amount}>{formatINR(voucher.amount)}</Text>
        </AppCard>

        <AppCard variant="elevated">
          <Text style={styles.sectionTitle}>Voucher Information</Text>
          <DataRow label="Date" value={formatDate(voucher.expense_date)} />
          <DataRow label="Expense Account" value={voucher.expense_account?.account_name} />
          <DataRow label="Paid From" value={voucher.paid_from_account?.account_name} />
          <DataRow label="Paid To" value={voucher.paid_to} />
          <DataRow label="Method" value={voucher.payment_method} />
          <DataRow label="Reference" value={voucher.reference_number} />
          <DataRow label="Created" value={formatDateTime(voucher.created_at)} />
          <DataRow label="Description" value={voucher.description} />
        </AppCard>

        {lines.length > 0 ? (
          <AppCard variant="elevated">
            <Text style={styles.sectionTitle}>Journal Entry</Text>
            <Text style={styles.journalMeta}>
              {voucher.accounting_entry?.reference_type ?? 'MANUAL_EXPENSE'}
            </Text>
            {lines.map(line => (
              <View key={line.id} style={styles.lineRow}>
                <View style={styles.lineAccount}>
                  <Text style={styles.lineName} numberOfLines={1}>
                    {line.account?.account_name ?? 'Account'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.lineAmount,
                    line.debit > 0 ? styles.debitText : styles.creditText,
                  ]}
                >
                  {line.debit > 0 ? 'Dr' : 'Cr'}{' '}
                  {formatINR(line.debit > 0 ? line.debit : line.credit)}
                </Text>
              </View>
            ))}
          </AppCard>
        ) : null}

        {voucher.status === 'CANCELLED' ? (
          <AppCard variant="flat">
            <Text style={styles.cancelledNote}>
              This voucher is cancelled — a mirrored reversal entry was posted
              to the ledger.
            </Text>
          </AppCard>
        ) : null}

        {isPosted && can(PermissionKeys.EXPENSE_MANAGE_STATUS) ? (
          <AppButton
            title="Cancel Voucher"
            onPress={() => setCancelVisible(true)}
            variant="danger"
            size="lg"
          />
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={cancelVisible}
        title="Cancel Expense Voucher"
        message={`Cancelling ${voucher.voucher_number} posts a mirrored reversal to the ledger. This cannot be undone.`}
        confirmTitle="Cancel Voucher"
        requiresReason
        reasonPlaceholder="Reason for cancellation"
        loading={cancelMutation.isPending}
        onConfirm={reason =>
          cancelMutation.mutate(reason, {
            onSuccess: () => setCancelVisible(false),
          })
        }
        onCancel={() => setCancelVisible(false)}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voucherNumber: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
  },
  amount: {
    ...Typography.metricLarge,
    color: AdminColors.error,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  journalMeta: {
    ...Typography.caption,
    color: AdminColors.textMuted,
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
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
  },
  lineAccount: {
    flex: 1,
  },
  lineName: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
  },
  lineAmount: {
    ...Typography.bodyBold,
  },
  debitText: {
    color: AdminColors.error,
  },
  creditText: {
    color: AdminColors.success,
  },
  cancelledNote: {
    ...Typography.body,
    color: AdminColors.textSecondary,
  },
});

export default ExpenseDetailsScreen;