import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing } from '../../../../core/theme/spacing';
import {
  VOUCHER_PAYMENT_METHODS,
  PaymentMethod,
} from '../types/accounting.types';

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  label?: string;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank',
  CHEQUE: 'Cheque',
  UPI: 'UPI',
  CARD: 'Card',
  OTHER: 'Other',
};

/** Chip selector for voucher payment methods (shared by both voucher forms). */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
  label = 'Payment Method',
}) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label} *</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {VOUCHER_PAYMENT_METHODS.map(method => {
        const active = method === value;
        return (
          <TouchableOpacity
            key={method}
            onPress={() => onChange(method)}
            activeOpacity={0.8}
            style={[styles.chip, active ? styles.chipActive : null]}
          >
            <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
              {METHOD_LABELS[method]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: 6,
  },
  row: {
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  chipActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  chipText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  chipTextActive: {
    color: AdminColors.textOnDark,
  },
});