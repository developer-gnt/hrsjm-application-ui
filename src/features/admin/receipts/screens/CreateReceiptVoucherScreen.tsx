import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { AppDatePickerInput } from '../../../../core/components/common/AppDatePickerInput';
import { ApiError } from '../../../../core/api/api-error';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { AppRoutes } from '../../../../core/constants/routes';
import { AccountPickerModal } from '../../accounting/components/AccountPickerModal';
import { PaymentMethodSelector } from '../../accounting/components/PaymentMethodSelector';
import type { AccountItem, PaymentMethod } from '../../accounting/types/accounting.types';
import { useCreateReceipt } from '../hooks/useReceipts';
import { useAccounts } from '../../accounting/hooks/useAccounts';
import { AlertCircle } from '../../../../core/components/icons';
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
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);

  // Fetch available accounts to supply sensible defaults
  const { accounts: incomeAccounts } = useAccounts('INCOME');
  const { accounts: assetAccounts } = useAccounts('ASSET');

  const [receiptDate, setReceiptDate] = useState(todayIso());
  const [receivedFrom, setReceivedFrom] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('CASH');
  const [description, setDescription] = useState('');

  const [incomeAccount, setIncomeAccount] = useState<AccountItem | null>(null);
  const [receivedInAccount, setReceivedInAccount] = useState<AccountItem | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'income' | 'received_in' | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-select default Income Account (e.g. Donation Income or first active)
  useEffect(() => {
    if (!incomeAccount && incomeAccounts.length > 0) {
      const defaultIncome =
        incomeAccounts.find(a => /donation/i.test(a.account_name) && a.is_active) ||
        incomeAccounts.find(a => a.is_active) ||
        incomeAccounts[0];
      if (defaultIncome) {
        setIncomeAccount(defaultIncome);
      }
    }
  }, [incomeAccounts, incomeAccount]);

  // Auto-select / sync Received In (Asset) Account based on payment method
  useEffect(() => {
    if (!receivedInAccount && assetAccounts.length > 0) {
      if (paymentMethod === 'CASH') {
        const cashAcc =
          assetAccounts.find(
            a => /cash/i.test(a.account_name) || a.account_code === '1002',
          ) || assetAccounts[0];
        if (cashAcc) setReceivedInAccount(cashAcc);
      } else {
        const bankAcc =
          assetAccounts.find(
            a => /bank/i.test(a.account_name) || a.account_code === '1001',
          ) || assetAccounts[0];
        if (bankAcc) setReceivedInAccount(bankAcc);
      }
    }
  }, [assetAccounts, receivedInAccount, paymentMethod]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (fieldErrors.payment_method) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.payment_method;
        return next;
      });
    }
    // Switch asset account to match payment method
    if (assetAccounts.length > 0) {
      if (method === 'CASH') {
        const cashAcc = assetAccounts.find(
          a => /cash/i.test(a.account_name) || a.account_code === '1002',
        );
        if (cashAcc) {
          setReceivedInAccount(cashAcc);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.received_in_account_id;
            return next;
          });
        }
      } else {
        const bankAcc = assetAccounts.find(
          a => /bank/i.test(a.account_name) || a.account_code === '1001',
        );
        if (bankAcc) {
          setReceivedInAccount(bankAcc);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.received_in_account_id;
            return next;
          });
        }
      }
    }
  };

  const handleCreate = () => {
    const parsed = createReceiptSchema.safeParse({
      receipt_date: receiptDate,
      received_from: receivedFrom,
      income_account_id: incomeAccount?.id ?? '',
      received_in_account_id: receivedInAccount?.id ?? '',
      amount,
      payment_method: paymentMethod ?? undefined,
      description,
    });
    if (!parsed.success) {
      const errors = zodFieldErrors(parsed.error);
      setFieldErrors(errors);

      const missing: string[] = [];
      if (errors.income_account_id) missing.push('Income Account');
      if (errors.received_in_account_id) missing.push('Received In Account');
      if (errors.amount) missing.push('Valid Amount');
      if (errors.received_from) missing.push('Received From');
      if (errors.receipt_date) missing.push('Receipt Date');
      if (errors.payment_method) missing.push('Payment Method');
      const summary =
        missing.length > 0
          ? `Please complete required fields: ${missing.join(', ')}`
          : (Object.values(errors)[0] || 'Please complete all required fields.');

      setFormError(summary);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert('Required Information Missing', summary);
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
          const msg =
            error instanceof ApiError && error.message
              ? error.message
              : 'Unable to record receipt. Please try again.';
          setFormError(msg);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          Alert.alert('Error Recording Receipt', msg);
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AdminHeader
        title="Record Income Receipt"
        showBack
        onBack={() => navigation.goBack()}
        onNavigate={target => navigation.navigate(target as any)}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
          onChangeText={val => {
            setAmount(val);
            if (fieldErrors.amount) {
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.amount;
                return next;
              });
            }
          }}
          keyboardType="decimal-pad"
          editable={!createMutation.isPending}
          error={fieldErrors.amount}
        />

        <AppDatePickerInput
          label="Receipt Date"
          required
          title="Select Receipt Date"
          value={receiptDate}
          onChange={val => {
            setReceiptDate(val);
            if (fieldErrors.receipt_date) {
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.receipt_date;
                return next;
              });
            }
          }}
          disabled={createMutation.isPending}
          error={fieldErrors.receipt_date}
        />

        <AppInput
          label="Received From"
          required
          placeholder="Payer name"
          value={receivedFrom}
          onChangeText={val => {
            setReceivedFrom(val);
            if (fieldErrors.received_from) {
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.received_from;
                return next;
              });
            }
          }}
          editable={!createMutation.isPending}
          error={fieldErrors.received_from}
        />

        <PaymentMethodSelector
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
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

        {formError ? (
          <View style={styles.submitErrorCard}>
            <AlertCircle size={16} color={AdminColors.error} />
            <Text style={styles.submitErrorText}>{formError}</Text>
          </View>
        ) : null}

        <AppButton
          title="Record Receipt"
          onPress={handleCreate}
          variant="gold"
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
        onSelect={acc => {
          setIncomeAccount(acc);
          setPickerTarget(null);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.income_account_id;
            return next;
          });
        }}
        onClose={() => setPickerTarget(null)}
      />
      <AccountPickerModal
        visible={pickerTarget === 'received_in'}
        title="Select Bank/Cash Account"
        accountType="ASSET"
        selectedId={receivedInAccount?.id}
        onSelect={acc => {
          setReceivedInAccount(acc);
          setPickerTarget(null);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.received_in_account_id;
            return next;
          });
        }}
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
    paddingBottom: 60,
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
  submitErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.errorLight,
    borderWidth: 1,
    borderColor: AdminColors.error,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  submitErrorText: {
    ...Typography.secondaryMedium,
    color: AdminColors.error,
    flex: 1,
  },
  submit: {
    marginTop: Spacing.lg,
  },
});

export default CreateReceiptVoucherScreen;
