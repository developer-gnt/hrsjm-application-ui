import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { AppInput } from '../../../../core/components/common/AppInput';
import { AppDatePickerInput } from '../../../../core/components/common/AppDatePickerInput';
import { AppModal } from '../../../../core/components/common/AppModal';
import { ConfirmDialog } from '../../../../core/components/common/ConfirmDialog';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import {
  AdminStatusBadge,
  adminStatusTone,
} from '../../../../core/components/admin/AdminStatusBadge';
import { Pencil } from '../../../../core/components/icons';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { formatDate, formatDateTime, formatINR } from '../../../../core/utils';
import { useCancelReceipt, useReceiptDetail, useUpdateReceipt } from '../hooks/useReceipts';
import { AccountPickerModal } from '../../accounting/components/AccountPickerModal';
import { PaymentMethodSelector } from '../../accounting/components/PaymentMethodSelector';
import type { AccountItem, PaymentMethod } from '../../accounting/types/accounting.types';
import { AppRoutes } from '../../../../core/constants/routes';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type ReceiptVoucherDetailsScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.RECEIPT_DETAILS
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

/** Receipt voucher details: fields + posted journal + full edit modal + cancel with reversal. */
export const ReceiptVoucherDetailsScreen: React.FC<
  ReceiptVoucherDetailsScreenProps
> = ({ navigation, route }) => {
  const voucherId = route.params.voucherId;
  const detail = useReceiptDetail(voucherId);
  const cancelMutation = useCancelReceipt(voucherId);
  const updateMutation = useUpdateReceipt(voucherId);

  const [cancelVisible, setCancelVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editReceivedFrom, setEditReceivedFrom] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editIncomeAccount, setEditIncomeAccount] = useState<AccountItem | null>(null);
  const [editReceivedInAccount, setEditReceivedInAccount] = useState<AccountItem | null>(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod | null>(null);
  const [editReference, setEditReference] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [pickerTarget, setPickerTarget] = useState<'income' | 'received_in' | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const voucher = detail.data;

  const handleOpenEdit = () => {
    if (!voucher) return;
    setEditDate(voucher.receipt_date ? String(voucher.receipt_date).slice(0, 10) : '');
    setEditReceivedFrom(voucher.received_from || '');
    setEditAmount(voucher.amount !== undefined && voucher.amount !== null ? String(voucher.amount) : '');
    setEditIncomeAccount(
      voucher.income_account
        ? {
            id: voucher.income_account.id,
            account_name: voucher.income_account.account_name,
            account_code: voucher.income_account.account_code,
            account_type: 'INCOME',
            parent_account_id: null,
            description: null,
            is_active: true,
            created_at: '',
            updated_at: '',
          }
        : null,
    );
    setEditReceivedInAccount(
      voucher.received_in_account
        ? {
            id: voucher.received_in_account.id,
            account_name: voucher.received_in_account.account_name,
            account_code: voucher.received_in_account.account_code,
            account_type: 'ASSET',
            parent_account_id: null,
            description: null,
            is_active: true,
            created_at: '',
            updated_at: '',
          }
        : null,
    );
    setEditPaymentMethod(voucher.payment_method || null);
    setEditReference(voucher.reference_number || '');
    setEditDescription(voucher.description || '');
    setPickerTarget(null);
    setEditError(null);
    setEditVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editReceivedFrom.trim()) {
      setEditError('Received From is required');
      return;
    }
    const parsedAmount = Number(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setEditError('Please enter a valid amount greater than 0');
      return;
    }
    if (!editIncomeAccount?.id) {
      setEditError('Income account is required');
      return;
    }
    if (!editReceivedInAccount?.id) {
      setEditError('Received-in payment account is required');
      return;
    }
    if (!editPaymentMethod) {
      setEditError('Payment method is required');
      return;
    }

    setEditError(null);
    updateMutation.mutate(
      {
        receipt_date: editDate || undefined,
        received_from: editReceivedFrom.trim(),
        income_account_id: editIncomeAccount.id,
        received_in_account_id: editReceivedInAccount.id,
        amount: parsedAmount,
        payment_method: editPaymentMethod,
        reference_number: editReference.trim() || undefined,
        description: editDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setEditVisible(false);
          void detail.refetch();
        },
        onError: (err: any) => {
          setEditError(err?.message || 'Failed to update receipt details');
        },
      },
    );
  };

  if (detail.isLoading) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          title="Receipt Details"
          showBack
          onBack={() => navigation.goBack()}
          onNavigate={target => navigation.navigate(target as any)}
        />
        <AppLoader fullScreen message="Loading receipt…" />
      </View>
    );
  }

  if (detail.isError || !voucher) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          title="Receipt Details"
          showBack
          onBack={() => navigation.goBack()}
          onNavigate={target => navigation.navigate(target as any)}
        />
        <AppErrorState
          title="Unable to load receipt"
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
        title="Receipt Details"
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
          <Text style={[styles.amount, { color: AdminColors.success }]}>
            {formatINR(voucher.amount)}
          </Text>
        </AppCard>

        <AppCard variant="elevated">
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Receipt Information</Text>
            {isPosted && can(PermissionKeys.RECEIPT_ENTRY_UPDATE) && (
              <TouchableOpacity
                style={styles.editHeaderBtn}
                onPress={handleOpenEdit}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Edit Receipt"
              >
                <Pencil size={15} color={AdminColors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <DataRow label="Date" value={formatDate(voucher.receipt_date)} />
          <DataRow label="Income Account" value={voucher.income_account?.account_name} />
          <DataRow label="Received In" value={voucher.received_in_account?.account_name} />
          <DataRow label="Received From" value={voucher.received_from} />
          <DataRow label="Method" value={voucher.payment_method} />
          <DataRow label="Reference" value={voucher.reference_number} />
          <DataRow label="Created" value={formatDateTime(voucher.created_at)} />
          <DataRow label="Description" value={voucher.description} />
        </AppCard>

        {lines.length > 0 ? (
          <AppCard variant="elevated">
            <Text style={styles.sectionTitle}>Journal Entry</Text>
            <Text style={styles.journalMeta}>
              {voucher.accounting_entry?.reference_type ?? 'MANUAL_RECEIPT'}
            </Text>
            {lines.map(line => {
              const debit = Number(line.debit_amount ?? (line as any).debit ?? 0);
              const credit = Number(line.credit_amount ?? (line as any).credit ?? 0);
              const isDebit = debit > 0;
              const lineAmount = isDebit ? debit : credit;

              return (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineAccount}>
                    <Text style={styles.lineName} numberOfLines={1}>
                      {line.account?.account_name ?? 'Account'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.lineAmount,
                      isDebit ? styles.debitText : styles.creditText,
                    ]}
                  >
                    {isDebit ? 'Dr' : 'Cr'} {formatINR(lineAmount)}
                  </Text>
                </View>
              );
            })}
          </AppCard>
        ) : null}

        {voucher.status === 'CANCELLED' ? (
          <AppCard variant="flat">
            <Text style={styles.cancelledNote}>
              This receipt is cancelled — a mirrored reversal entry was posted
              to the ledger.
            </Text>
          </AppCard>
        ) : null}

        {isPosted && (
          <View style={styles.actionsContainer}>
            {can(PermissionKeys.RECEIPT_ENTRY_UPDATE) && (
              <AppButton
                title="Edit Receipt"
                onPress={handleOpenEdit}
                variant="outline"
                size="lg"
              />
            )}
            {can(PermissionKeys.RECEIPT_ENTRY_MANAGE_STATUS) && (
              <AppButton
                title="Cancel Receipt"
                onPress={() => setCancelVisible(true)}
                variant="danger"
                size="lg"
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Full Edit Modal */}
      <AppModal
        visible={editVisible}
        title="Edit Receipt"
        onClose={() => setEditVisible(false)}
        maxHeight={580}
        footer={
          <View style={styles.modalFooterRow}>
            <View style={styles.modalFooterCol}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setEditVisible(false)}
              />
            </View>
            <View style={styles.modalFooterCol}>
              <AppButton
                title="Save Changes"
                variant="primary"
                size="md"
                loading={updateMutation.isPending}
                onPress={handleSaveEdit}
              />
            </View>
          </View>
        }
      >
        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          {editError ? (
            <Text style={styles.errorBanner}>{editError}</Text>
          ) : null}

          {/* Income Account Picker */}
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Income Account *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setPickerTarget('income')}
              activeOpacity={0.8}
            >
              <Text numberOfLines={1} style={styles.pickerValue}>
                {editIncomeAccount
                  ? `${editIncomeAccount.account_name}${editIncomeAccount.account_code ? ` (${editIncomeAccount.account_code})` : ''}`
                  : 'Select income account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Received In Account Picker */}
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Received In (Bank/Cash) *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setPickerTarget('received_in')}
              activeOpacity={0.8}
            >
              <Text numberOfLines={1} style={styles.pickerValue}>
                {editReceivedInAccount
                  ? `${editReceivedInAccount.account_name}${editReceivedInAccount.account_code ? ` (${editReceivedInAccount.account_code})` : ''}`
                  : 'Select bank/cash account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <AppInput
            label="Amount (₹) *"
            value={editAmount}
            onChangeText={setEditAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Payment Method / Mode */}
          <View style={styles.modeSection}>
            <Text style={styles.pickerLabel}>Payment Mode *</Text>
            <PaymentMethodSelector
              value={editPaymentMethod}
              onChange={setEditPaymentMethod}
            />
          </View>

          {/* Receipt Date */}
          <AppDatePickerInput
            label="Receipt Date"
            value={editDate}
            onChange={setEditDate}
            placeholder="Select date"
          />

          {/* Received From */}
          <AppInput
            label="Received From *"
            value={editReceivedFrom}
            onChangeText={setEditReceivedFrom}
            placeholder="Payer / Member / Source name"
          />

          {/* Reference Number */}
          <AppInput
            label="Reference Number"
            value={editReference}
            onChangeText={setEditReference}
            placeholder="Transaction ID / Cheque / UTR"
          />

          {/* Description */}
          <AppInput
            label="Description"
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Purpose or notes"
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </AppModal>

      {/* Account Pickers */}
      <AccountPickerModal
        visible={pickerTarget === 'income'}
        title="Select Income Account"
        accountType="INCOME"
        selectedId={editIncomeAccount?.id}
        onSelect={acc => {
          setEditIncomeAccount(acc);
          setPickerTarget(null);
        }}
        onClose={() => setPickerTarget(null)}
      />

      <AccountPickerModal
        visible={pickerTarget === 'received_in'}
        title="Select Receiving Account (Bank/Cash)"
        accountType="ASSET"
        selectedId={editReceivedInAccount?.id}
        onSelect={acc => {
          setEditReceivedInAccount(acc);
          setPickerTarget(null);
        }}
        onClose={() => setPickerTarget(null)}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        visible={cancelVisible}
        title="Cancel Receipt"
        message={`Cancelling ${voucher.voucher_number} posts a mirrored reversal to the ledger. This cannot be undone.`}
        confirmTitle="Cancel Receipt"
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
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${AdminColors.primary}12`,
  },
  editBtnText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
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
  actionsContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modalBody: {
    paddingVertical: Spacing.xs,
  },
  pickerRow: {
    marginBottom: Spacing.md,
  },
  pickerLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: 6,
  },
  pickerButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pickerValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  modeSection: {
    marginBottom: Spacing.md,
  },
  errorBanner: {
    ...Typography.caption,
    color: AdminColors.error,
    backgroundColor: `${AdminColors.error}14`,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalFooterCol: {
    flex: 1,
  },
});

export default ReceiptVoucherDetailsScreen;