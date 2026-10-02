import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../../../../core/components/common/AppModal';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing } from '../../../../core/theme/spacing';
import { formatINR } from '../../../../core/utils';
import { useVerifyPayment } from '../hooks/usePayments';
import {
  suggestGatewayPaymentId,
  verifyPaymentSchema,
} from '../types/payments.schemas';
import { MembershipPaymentItem } from '../types/payments.types';

interface VerifyPaymentModalProps {
  visible: boolean;
  payment: MembershipPaymentItem | null;
  onClose: () => void;
  onVerified: () => void;
}

/**
 * Verify payment dialog (BRD TC: verification → receipt + journal on the
 * backend). Confirming is idempotent — a re-verify returns the existing pair.
 */
export const VerifyPaymentModal: React.FC<VerifyPaymentModalProps> = ({
  visible,
  payment,
  onClose,
  onVerified,
}) => {
  const [gatewayPaymentId, setGatewayPaymentId] = useState('');
  const [gatewayOrderId, setGatewayOrderId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const verifyMutation = useVerifyPayment(payment?.id ?? '');

  useEffect(() => {
    if (visible && payment) {
      setGatewayPaymentId(suggestGatewayPaymentId(payment.transaction_id));
      setGatewayOrderId(payment.gateway_order_id ?? '');
      setFieldErrors({});
      setFormError(null);
      verifyMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, payment?.id]);

  const handleVerify = () => {
    if (!payment) {
      return;
    }
    const parsed = verifyPaymentSchema.safeParse({
      gateway_payment_id: gatewayPaymentId,
      gateway_order_id: gatewayOrderId,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    verifyMutation.mutate(
      {
        gateway_payment_id: parsed.data.gateway_payment_id,
        gateway_order_id: parsed.data.gateway_order_id || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          onVerified();
        },
        onError: (error: unknown) => {
          setFormError(
            error instanceof Error && error.message
              ? error.message
              : 'Unable to verify the payment. Please try again.',
          );
        },
      },
    );
  };

  if (!payment) {
    return null;
  }

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Verify Payment"
      footer={
        <View style={styles.footerRow}>
          <AppButton
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.footerButton}
            disabled={verifyMutation.isPending}
          />
          <AppButton
            title="Confirm Verify"
            onPress={handleVerify}
            variant="primary"
            style={styles.footerButton}
            loading={verifyMutation.isPending}
            disabled={verifyMutation.isPending}
          />
        </View>
      }
    >
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{payment.user?.full_name ?? 'Member'}</Text>
        <Text style={styles.summaryAmount}>{formatINR(payment.amount)}</Text>
      </View>
      <Text style={styles.hint}>
        Verification activates the membership, generates the receipt and posts
        the accounting journal. Already-verified payments are re-confirmed
        safely (idempotent).
      </Text>

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <AppInput
        label="Gateway Payment ID"
        required
        placeholder="Gateway / manual payment reference"
        value={gatewayPaymentId}
        onChangeText={setGatewayPaymentId}
        autoCapitalize="none"
        editable={!verifyMutation.isPending}
        error={fieldErrors.gateway_payment_id}
      />
      <AppInput
        label="Gateway Order ID"
        placeholder="Optional"
        value={gatewayOrderId}
        onChangeText={setGatewayOrderId}
        autoCapitalize="none"
        editable={!verifyMutation.isPending}
        error={fieldErrors.gateway_order_id}
      />
    </AppModal>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
    flex: 1,
  },
  summaryAmount: {
    ...Typography.bodyBold,
    color: AdminColors.primary,
  },
  hint: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.secondaryMedium,
    color: AdminColors.error,
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});