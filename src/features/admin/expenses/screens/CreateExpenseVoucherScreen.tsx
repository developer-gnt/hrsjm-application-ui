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
import { useCreateExpense } from '../hooks/useExpenses';
import { useAccounts } from '../../accounting/hooks/useAccounts';
import { createExpenseSchema, zodFieldErrors } from '../types/expenses.schemas';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

import { getExpenseTypeDescription } from '../../accounting/data/official-expense-types';
import { AlertCircle } from '../../../../core/components/icons';

type CreateExpenseVoucherScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.CREATE_EXPENSE_VOUCHER
>;

const todayIso = (): string => new Date().toISOString().slice(0, 10);

/**
 * Create expense voucher (spec §27): Dr Expense Account / Cr Bank-Cash.
 * Submit is disabled while in flight to prevent duplicate vouchers.
 */
export const CreateExpenseVoucherScreen: React.FC<
  CreateExpenseVoucherScreenProps
> = ({ navigation }) => {
  const createMutation = useCreateExpense();
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);

  const { accounts: assetAccounts } = useAccounts('ASSET');

  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('CASH');
  const [description, setDescription] = useState('');

  const [expenseAccount, setExpenseAccount] = useState<AccountItem | null>(null);
  const [paidFromAccount, setPaidFromAccount] = useState<AccountItem | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'expense' | 'paid_from' | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const typeDescription =
    expenseAccount?.description ||
    getExpenseTypeDescription(expenseAccount?.account_name);

  // Auto-select / sync Paid From (Asset) Account based on payment method
  useEffect(() => {
    if (!paidFromAccount && assetAccounts.length > 0) {
      if (paymentMethod === 'CASH') {
        const cashAcc =
          assetAccounts.find(
            a => /cash/i.test(a.account_name) || a.account_code === '1002',
          ) || assetAccounts[0];
        if (cashAcc) setPaidFromAccount(cashAcc);
      } else {
        const bankAcc =
          assetAccounts.find(
            a => /bank/i.test(a.account_name) || a.account_code === '1001',
          ) || assetAccounts[0];
        if (bankAcc) setPaidFromAccount(bankAcc);
      }
    }
  }, [assetAccounts, paidFromAccount, paymentMethod]);

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
          setPaidFromAccount(cashAcc);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.paid_from_account_id;
            return next;
          });
        }
      } else {
        const bankAcc = assetAccounts.find(
          a => /bank/i.test(a.account_name) || a.account_code === '1001',
        );
        if (bankAcc) {
          setPaidFromAccount(bankAcc);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.paid_from_account_id;
            return next;
          });
        }
      }
    }
  };

  const handleCreate = () => {
    const parsed = createExpenseSchema.safeParse({
      expense_date: expenseDate,
      paid_to: paidTo,
      expense_account_id: expenseAccount?.id ?? '',
      paid_from_account_id: paidFromAccount?.id ?? '',
      amount,
      payment_method: paymentMethod ?? undefined,
      description,
    });
    if (!parsed.success) {
      const errors = zodFieldErrors(parsed.error);
      setFieldErrors(errors);

      const missing: string[] = [];
      if (errors.expense_account_id) missing.push('Type of Expense');
      if (errors.paid_from_account_id) missing.push('Paid From Account');
      if (errors.amount) missing.push('Valid Amount');
      if (errors.paid_to) missing.push('Paid To');
      if (errors.expense_date) missing.push('Expense Date');
      if (errors.payment_method) missing.push('Payment Method');
      if (errors.description) missing.push('Description');
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
        expense_date: parsed.data.expense_date,
        paid_to: parsed.data.paid_to,
        expense_account_id: parsed.data.expense_account_id,
        paid_from_account_id: parsed.data.paid_from_account_id,
        amount: Number(parsed.data.amount),
        payment_method: parsed.data.payment_method,
        reference_number: parsed.data.reference_number || undefined,
        description: parsed.data.description || undefined,
      },
      {
        onSuccess: voucher =>
          navigation.replace(AppRoutes.EXPENSE_DETAILS, { voucherId: voucher.id }),
        onError: (error: unknown) => {
          const msg =
            error instanceof ApiError && error.message
              ? error.message
              : 'Unable to record the expense. Please try again.';
          setFormError(msg);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          Alert.alert('Error Recording Expense', msg);
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
        title="Record Expense"
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
        <Text style={styles.journalHint}>Dr Expense Account · Cr Bank/Cash Account</Text>

        {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

        {/* Type of Expense Field */}
        <View style={styles.pickerRow}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Type of Expense *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                fieldErrors.expense_account_id ? styles.pickerError : null,
              ]}
              onPress={() => setPickerTarget('expense')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Select type of expense"
            >
              <Text numberOfLines={1} style={styles.pickerValue}>
                {expenseAccount
                  ? `${expenseAccount.account_name}${expenseAccount.account_code ? ` (${expenseAccount.account_code})` : ''}`
                  : 'Select type of expense'}
              </Text>
            </TouchableOpacity>

            {/* Type Scope & Description Card */}
            {typeDescription ? (
              <View style={styles.typeDescCard}>
                <AlertCircle size={14} color="#0284C7" style={{ marginTop: 2 }} />
                <View style={styles.typeDescTextWrap}>
                  <Text style={styles.typeDescTitle}>Scope &amp; Coverage</Text>
                  <Text style={styles.typeDescText}>{typeDescription}</Text>
                </View>
              </View>
            ) : null}

            {/* Description / Specific Details Input (Shown when type is selected) */}
            {expenseAccount ? (
              <View style={styles.typeDescInputWrap}>
                <AppInput
                  label={`Description for ${expenseAccount.account_name} *`}
                  placeholder="Enter specific purpose, invoice no., items purchased, etc."
                  value={description}
                  onChangeText={val => {
                    setDescription(val);
                    if (fieldErrors.description) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.description;
                        return next;
                      });
                    }
                  }}
                  multiline
                  editable={!createMutation.isPending}
                  error={fieldErrors.description}
                />
              </View>
            ) : null}

            {fieldErrors.expense_account_id ? (
              <Text style={styles.fieldError}>{fieldErrors.expense_account_id}</Text>
            ) : null}
          </View>
        </View>

        {/* Paid From Field */}
        <View style={styles.pickerRow}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Paid From (Bank/Cash) *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                fieldErrors.paid_from_account_id ? styles.pickerError : null,
              ]}
              onPress={() => setPickerTarget('paid_from')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Select bank/cash account"
            >
              <Text numberOfLines={1} style={styles.pickerValue}>
                {paidFromAccount
                  ? `${paidFromAccount.account_name}${paidFromAccount.account_code ? ` (${paidFromAccount.account_code})` : ''}`
                  : 'Select bank/cash account'}
              </Text>
            </TouchableOpacity>
            {fieldErrors.paid_from_account_id ? (
              <Text style={styles.fieldError}>{fieldErrors.paid_from_account_id}</Text>
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
          label="Expense Date"
          required
          title="Select Expense Date"
          value={expenseDate}
          onChange={val => {
            setExpenseDate(val);
            if (fieldErrors.expense_date) {
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.expense_date;
                return next;
              });
            }
          }}
          disabled={createMutation.isPending}
          error={fieldErrors.expense_date}
        />

        <AppInput
          label="Paid To"
          required
          placeholder="Payee or vendor name"
          value={paidTo}
          onChangeText={val => {
            setPaidTo(val);
            if (fieldErrors.paid_to) {
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.paid_to;
                return next;
              });
            }
          }}
          editable={!createMutation.isPending}
          error={fieldErrors.paid_to}
        />

        <PaymentMethodSelector
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        />

        {/* Fallback description input if no type selected yet */}
        {!expenseAccount ? (
          <AppInput
            label="Description / Expense Details"
            placeholder="Describe purpose, invoice number, items purchased, etc."
            value={description}
            onChangeText={val => {
              setDescription(val);
              if (fieldErrors.description) {
                setFieldErrors(prev => {
                  const next = { ...prev };
                  delete next.description;
                  return next;
                });
              }
            }}
            multiline
            editable={!createMutation.isPending}
            error={fieldErrors.description}
          />
        ) : null}

        {formError ? (
          <View style={styles.submitErrorCard}>
            <AlertCircle size={16} color={AdminColors.error} />
            <Text style={styles.submitErrorText}>{formError}</Text>
          </View>
        ) : null}

        <AppButton
          title="Record Expense"
          onPress={handleCreate}
          variant="gold"
          size="lg"
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.submit}
        />
      </ScrollView>

      <AccountPickerModal
        visible={pickerTarget === 'expense'}
        title="Select Type of Expense"
        accountType="EXPENSE"
        selectedId={expenseAccount?.id}
        onSelect={acc => {
          setExpenseAccount(acc);
          setPickerTarget(null);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.expense_account_id;
            return next;
          });
        }}
        onClose={() => setPickerTarget(null)}
      />
      <AccountPickerModal
        visible={pickerTarget === 'paid_from'}
        title="Select Bank/Cash Account"
        accountType="ASSET"
        selectedId={paidFromAccount?.id}
        onSelect={acc => {
          setPaidFromAccount(acc);
          setPickerTarget(null);
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.paid_from_account_id;
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
  typeDescCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
    marginTop: 8,
  },
  typeDescTextWrap: {
    flex: 1,
  },
  typeDescTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  typeDescText: {
    fontSize: 12,
    color: '#0284C7',
    lineHeight: 16,
  },
  typeDescInputWrap: {
    marginTop: 10,
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

export default CreateExpenseVoucherScreen;
