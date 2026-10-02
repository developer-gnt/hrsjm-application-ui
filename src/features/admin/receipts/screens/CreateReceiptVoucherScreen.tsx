import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { ApiError } from '../../../../core/api/api-error';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { AppRoutes } from '../../../../core/constants/routes';
import { AccountPickerModal } from '../../accounting/components/AccountPickerModal';
import { PaymentMethodSelector } from '../../accounting/components/PaymentMethodSelector';
import type { AccountItem, PaymentMethod } from '../../accounting/types/accounting.types';
import { useCreateReceipt } from '../hooks/useReceipts';
import { createReceiptSchema, zodFieldErrors } from '../types/receipts.schemas';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type CreateReceiptVoucherScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.CREATE_RECEIPT_VOUCHER
>;

const todayIso = (): string => new Date().toISOString().slice(0, 10);

/**
 * Create receipt voucher (spec §30): Dr Bank/Cash / Cr Income Account.
 * Submit disabled while in flight (no backend idempotency key on create).
 */
export const CreateReceiptVoucherScreen: React.FC<
  CreateReceiptVoucherScreenProps
> = ({ navigation }) => {
  const createMutation = useCreateReceipt();

  const [receiptDate, setReceiptDate] = useState(todayIso());
  const [receivedFrom, setReceivedFrom] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const [incomeAccount, setIncomeAccount] = useState<AccountItem | null>(null);
  const [receivedInAccount, setReceivedInAccount] = useState<AccountItem | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'income' | 'received_in' | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    const parsed = createReceiptSchema.safeParse({
      receipt_date: receiptDate,
      received_from: receivedFrom,
      income_account_id: incomeAccount?.id ?? '',
      received_in_account_id: receivedInAccount?.id ?? '',
      amount,
      payment_method: paymentMethod ?? undefined,
      reference_number: reference,
      description,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setFormError(null);
    createMutation.mutate(
      {
        receipt_date: parsed.data.receipt_date,
        received_from: parsed.data.received_from,
        income_account_id: parsed.data.income_account_id,
        received_in_account_id: parsed.data.received_in_account_id,
        amount: Number(parsed.data.amount),
        payment_method: parsed.data.payment_method,
        reference_number: parsed.data.reference_number || undefined,
        description: parsed.data.description || undefined,
      },
      {
        onSuccess: voucher =>
          navigation.replace(AppRoutes.RECEIPT_DETAILS, { voucherId: voucher.id }),
        onError: (error: unknown) => {
          setFormError(
            error instanceof ApiError && error.message
              ? error.message
              : 'Unable to create the voucher. Please try again.',
          );
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader
        title="Create Receipt Voucher"
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Text style={styles.journalHint}>Dr Bank/Cash Account · Cr Income Account</Text>

        {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

        <View style={styles.pickerRow}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Income Account *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                fieldErrors.income_account_id ? styles.pickerError : null,
              ]}
              onPress={() => setPickerTarget('income')}
              activeOpacity={0.8}
            >
              <Text numberOfLines={1} style={styles.pickerValue}>
                {incomeAccount
                  ? `${incomeAccount.account_name}${incomeAccount.account_code ? ` (${incomeAccount.account_code})` : ''}`
                  : 'Select income account'}
              </Text>
            </TouchableOpacity>
            {fieldErrors.income_account_id ? (
              <Text style={styles.fieldError}>{fieldErrors.income_account_id}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.pickerRow}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Received In (Bank/Cash) *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                fieldErrors.received_in_account_id ? styles.pickerError : null,
              ]}
              onPress={() => setPickerTarget('received_in')}
              activeOpacity={0.8}
            >
              <Text numberOfLines={1} style={styles.pickerValue}>
                {receivedInAccount
                  ? `${receivedInAccount.account_name}${receivedInAccount.account_code ? ` (${receivedInAccount.account_code})` : ''}`
                  : 'Select bank/cash account'}
              </Text>
            </TouchableOpacity>
            {fieldErrors.received_in_account_id ? (
              <Text style={styles.fieldError}>{fieldErrors.received_in_account_id}</Text>
            ) : null}
          </View>
        </View>

        <AppInput
          label="Amount (₹)"
          required
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!createMutation.isPending}
          error={fieldErrors.amount}
        />

        <AppInput
          label="Voucher Date"
          required
          placeholder="YYYY-MM-DD"
          value={receiptDate}
          onChangeText={setReceiptDate}
          autoCapitalize="none"
          editable={!createMutation.isPending}
          error={fieldErrors.receipt_date}
        />

        <AppInput
          label="Received From"
          required
          placeholder="Payer name"
          value={receivedFrom}
          onChangeText={setReceivedFrom}
          editable={!createMutation.isPending}
          error={fieldErrors.received_from}
        />

        <PaymentMethodSelector
          value={paymentMethod}
          onChange={setPaymentMethod}
        />

        <AppInput
          label="Reference Number"
          placeholder="Optional (defaults to REF-<voucher>)"
          value={reference}
          onChangeText={setReference}
          autoCapitalize="none"
          editable={!createMutation.isPending}
          error={fieldErrors.reference_number}
        />

        <AppInput
          label="Description"
          placeholder="Optional narration"
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!createMutation.isPending}
          error={fieldErrors.description}
        />

        <AppButton
          title="Create Receipt"
          onPress={handleCreate}
          variant="primary"
          size="lg"
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.submit}
        />
      </ScrollView>

      <AccountPickerModal
        visible={pickerTarget === 'income'}
        title="Select Income Account"
        accountType="INCOME"
        selectedId={incomeAccount?.id}
        onSelect={setIncomeAccount}
        onClose={() => setPickerTarget(null)}
      />
      <AccountPickerModal
        visible={pickerTarget === 'received_in'}
        title="Select Bank/Cash Account"
        accountType="ASSET"
        selectedId={receivedInAccount?.id}
        onSelect={setReceivedInAccount}
        onClose={() => setPickerTarget(null)}
      />
    </KeyboardAvoidingView>
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
  },
  journalHint: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    ...Typography.secondaryMedium,
    color: AdminColors.error,
    backgroundColor: AdminColors.errorLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  pickerRow: {
    marginBottom: Spacing.md,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: 6,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.cardSurface,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  pickerError: {
    borderColor: AdminColors.error,
  },
  pickerValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  fieldError: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: 4,
  },
  submit: {
    marginTop: Spacing.lg,
  },
});

export default CreateReceiptVoucherScreen;