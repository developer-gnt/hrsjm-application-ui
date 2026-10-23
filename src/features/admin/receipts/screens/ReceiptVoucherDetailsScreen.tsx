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
import {
  Pencil,
  Heart,
  User,
  RotateCcw,
  TrendingUp,
  CreditCard,
  FileText,
  Landmark,
  Zap,
  Banknote,
} from '../../../../core/components/icons';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography, FontFamilies } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { formatDateTime, formatINR } from '../../../../core/utils';
import { useCancelReceipt, useReceiptDetail, useUpdateReceipt } from '../hooks/useReceipts';
import { AccountPickerModal } from '../../accounting/components/AccountPickerModal';
import { PaymentMethodSelector } from '../../accounting/components/PaymentMethodSelector';
import type { AccountItem, PaymentMethod } from '../../accounting/types/accounting.types';
import { AppRoutes } from '../../../../core/constants/routes';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';
import {
  classifyReceipt,
  formatPaymentMethodBadge,
} from '../utils/receiptClassification';

type ReceiptVoucherDetailsScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.RECEIPT_DETAILS
>;

const DataRow: React.FC<{
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={[styles.dataValue, highlight && styles.dataValueHighlight]} selectable>
      {value || '—'}
    </Text>
  </View>
);

/** Receipt voucher details: categorized source, contributor, payment & ledger entry. */
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

  // Unconditional classification hook (before any early returns)
  const classified = React.useMemo(() => {
    if (!voucher) return null;
    return classifyReceipt(voucher);
  }, [voucher]);

  const methodBadge = React.useMemo(() => {
    if (!voucher) return null;
    return formatPaymentMethodBadge(voucher.payment_method);
  }, [voucher]);

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

  if (detail.isError || !voucher || !classified) {
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
  const isCancelled = voucher.status === 'CANCELLED';
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
        {/* Top Hero Card matching Image 2 */}
        <AppCard variant="elevated">
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconBox,
                {
                  backgroundColor: classified.iconBg,
                  borderColor: classified.iconBorder,
                },
              ]}
            >
              {classified.iconType === 'heart' ? (
                <Heart size={20} color={classified.iconColor} />
              ) : classified.iconType === 'user' ? (
                <User size={20} color={classified.iconColor} />
              ) : classified.iconType === 'rotate-cw' ? (
                <RotateCcw size={20} color={classified.iconColor} />
              ) : (
                <TrendingUp size={20} color={classified.iconColor} />
              )}
            </View>

            <View style={styles.heroCategoryCol}>
              <Text
                style={[styles.heroCategoryTitle, { color: classified.badgeColor }]}
              >
                {classified.categoryLabel}
              </Text>
              <Text style={styles.heroCategorySubtitle}>
                {classified.categorySubtitle}
              </Text>
            </View>

            <AdminStatusBadge
              label={voucher.status}
              tone={adminStatusTone(voucher.status)}
            />
          </View>

          <View style={styles.cardDivider} />

          {/* Receipt No & Date Grid */}
          <View style={styles.heroGrid}>
            <View style={styles.heroGridCol}>
              <Text style={styles.heroGridLabel}>Receipt No.</Text>
              <Text style={styles.heroGridValue} selectable>
                {voucher.voucher_number}
              </Text>
            </View>
            <View style={styles.heroGridCol}>
              <Text style={styles.heroGridLabel}>Date</Text>
              <Text style={styles.heroGridValue}>
                {formatDateTime(voucher.receipt_date || voucher.created_at).replace(', ', ' • ')}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Amount Received Row */}
          <View style={styles.heroAmountRow}>
            <View>
              <Text style={styles.heroAmountLabel}>Amount Received</Text>
              <Text
                style={[
                  styles.heroAmountValue,
                  isCancelled && styles.amountCancelled,
                ]}
              >
                {formatINR(voucher.amount)}
              </Text>
            </View>

            {methodBadge && (
              <View
                style={[
                  styles.heroMethodPill,
                  {
                    backgroundColor: methodBadge.bg,
                    borderColor: methodBadge.border,
                  },
                ]}
              >
                {methodBadge.iconName === 'upi' ? (
                  <Zap size={13} color={methodBadge.color} />
                ) : methodBadge.iconName === 'cash' ? (
                  <Banknote size={13} color={methodBadge.color} />
                ) : methodBadge.iconName === 'cheque' ? (
                  <FileText size={13} color={methodBadge.color} />
                ) : methodBadge.iconName === 'card' ? (
                  <CreditCard size={13} color={methodBadge.color} />
                ) : (
                  <Landmark size={13} color={methodBadge.color} />
                )}
                <Text
                  style={[styles.heroMethodText, { color: methodBadge.color }]}
                >
                  {methodBadge.label}
                </Text>
              </View>
            )}
          </View>
        </AppCard>

        {/* Middle Card: Source Context (Cause / Membership / General) */}
        <AppCard variant="elevated">
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIconRow}>
              <View
                style={[
                  styles.sectionIconWrap,
                  {
                    backgroundColor: classified.iconBg,
                    borderColor: classified.iconBorder,
                  },
                ]}
              >
                {classified.iconType === 'heart' ? (
                  <Heart size={14} color={classified.iconColor} />
                ) : classified.iconType === 'user' ? (
                  <User size={14} color={classified.iconColor} />
                ) : classified.iconType === 'rotate-cw' ? (
                  <RotateCcw size={14} color={classified.iconColor} />
                ) : (
                  <Landmark size={14} color={classified.iconColor} />
                )}
              </View>
              <Text style={styles.sectionTitle}>
                {classified.category === 'CAUSE_DONATION'
                  ? 'Donation for Cause'
                  : classified.category === 'GENERAL_DONATION'
                    ? 'General Donation'
                    : classified.category === 'RENEW_MEMBERSHIP'
                      ? 'Membership Renewal'
                      : classified.category === 'NEW_MEMBERSHIP'
                        ? 'Membership Registration'
                        : 'Income Classification'}
              </Text>
            </View>

            <View
              style={[
                styles.categoryTagPill,
                {
                  backgroundColor: classified.badgeBg,
                  borderColor: classified.badgeBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryTagPillText,
                  { color: classified.badgeColor },
                ]}
              >
                {classified.categoryLabel}
              </Text>
            </View>
          </View>

          {/* Context content based on category */}
          {classified.category === 'CAUSE_DONATION' ? (
            <>
              <DataRow label="Supported Cause" value={classified.sourceTitle} highlight />
              <DataRow label="Fund Purpose" value={classified.sourceDescription} />
            </>
          ) : classified.category === 'RENEW_MEMBERSHIP' ? (
            <>
              <DataRow label="Renewal Member" value={classified.payerName} highlight />
              {classified.membershipNumber ? (
                <DataRow label="Membership ID" value={classified.membershipNumber} />
              ) : null}
              <DataRow
                label="Extension Period"
                value={classified.renewalExtension || '1 Year Extension'}
              />
              <DataRow label="Status" value="Renewal Active & Verified" />
            </>
          ) : classified.category === 'NEW_MEMBERSHIP' ? (
            <>
              <DataRow label="New Member" value={classified.payerName} highlight />
              {classified.membershipNumber ? (
                <DataRow label="Assigned Member ID" value={classified.membershipNumber} />
              ) : null}
              <DataRow label="Plan / Category" value={classified.planName || 'Annual Membership'} />
              <DataRow label="Registration Type" value="New Member Registration" />
            </>
          ) : classified.category === 'GENERAL_DONATION' ? (
            <>
              <DataRow label="Contribution" value="General Public Donation" highlight />
              <DataRow label="Purpose" value="HRSJM Social Welfare & Educational Programs" />
            </>
          ) : (
            <>
              <DataRow label="Income Account" value={voucher.income_account?.account_name} highlight />
              <DataRow label="Classification" value={classified.sourceDescription} />
            </>
          )}
        </AppCard>

        {/* Contributor Details Card */}
        <AppCard variant="elevated">
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIconRow}>
              <View style={styles.sectionIconWrapUser}>
                <User size={14} color="#2563EB" />
              </View>
              <Text style={styles.sectionTitle}>Contributor Details</Text>
            </View>
          </View>

          <DataRow
            label="Donor / Contributor"
            value={classified.payerName}
          />
          {classified.payerContact ? (
            <DataRow label="Contact Info" value={classified.payerContact} />
          ) : null}
          <DataRow
            label="Contributor Type"
            value={classified.contributorType || 'Registered Member / Contributor'}
          />
        </AppCard>

        {/* Payment Details Card */}
        <AppCard variant="elevated">
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIconRow}>
              <View style={styles.sectionIconWrapPayment}>
                <CreditCard size={14} color="#0891B2" />
              </View>
              <Text style={styles.sectionTitle}>Payment Details</Text>
            </View>
          </View>

          <DataRow
            label="Gateway Payment ID"
            value={classified.gatewayPaymentId || voucher.reference_number}
          />
          <DataRow
            label="Payment Method"
            value={methodBadge?.label || voucher.payment_method}
          />
          <DataRow
            label="Received In"
            value={voucher.received_in_account?.account_name || 'Bank Account'}
          />
          <DataRow
            label="Transaction Reference"
            value={voucher.reference_number}
          />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Payment Status</Text>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>
                {voucher.status === 'POSTED' ? 'Success' : voucher.status}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Receipt Information Card (with Edit button) */}
        <AppCard variant="elevated">
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIconRow}>
              <View style={styles.sectionIconWrapInfo}>
                <FileText size={14} color="#475569" />
              </View>
              <Text style={styles.sectionTitle}>Receipt Information</Text>
            </View>
            {isPosted && can(PermissionKeys.RECEIPT_ENTRY_UPDATE) && (
              <TouchableOpacity
                style={styles.editHeaderBtn}
                onPress={handleOpenEdit}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Edit Receipt"
              >
                <Pencil size={14} color={AdminColors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <DataRow label="Income Account" value={voucher.income_account?.account_name} />
          <DataRow label="Received From" value={voucher.received_from} />
          <DataRow label="Reference" value={voucher.reference_number} />
          <DataRow label="Created At" value={formatDateTime(voucher.created_at).replace(', ', ' • ')} />
          {voucher.description ? (
            <DataRow label="Narration / Note" value={voucher.description} />
          ) : null}
        </AppCard>

        {/* Ledger Double-Entry Lines */}
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
    backgroundColor: '#FAF7F0',
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  // Hero Top Card
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroCategoryCol: {
    flex: 1,
    gap: 2,
  },
  heroCategoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroCategorySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#DBE5EE',
    marginVertical: 12,
  },
  heroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroGridCol: {
    flex: 1,
  },
  heroGridLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  heroGridValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0B2F52',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroAmountLabel: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 2,
  },
  heroAmountValue: {
    fontFamily: FontFamilies.display,
    fontSize: 26,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: -0.5,
  },
  amountCancelled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  heroMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  heroMethodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sectionIconWrapUser: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  sectionIconWrapPayment: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFEFF',
  },
  sectionIconWrapInfo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryTagPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  successBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
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
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  dataValueHighlight: {
    color: '#0284C7',
    fontWeight: '700',
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineAccount: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  lineName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
  },
  lineAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  debitText: {
    color: '#2563EB',
  },
  creditText: {
    color: '#16A34A',
  },
  cancelledNote: {
    ...Typography.secondary,
    color: '#DC2626',
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalFooterCol: {
    flex: 1,
  },
  modalBody: {
    gap: Spacing.md,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  pickerRow: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  pickerLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerValue: {
    fontSize: 14,
    color: '#0F172A',
  },
  modeSection: {
    gap: 6,
    marginBottom: Spacing.sm,
  },
});

export default ReceiptVoucherDetailsScreen;