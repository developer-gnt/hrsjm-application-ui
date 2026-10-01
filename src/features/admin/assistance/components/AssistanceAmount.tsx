import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../../../core/theme/theme';
import { formatCurrency } from '../../../../core/utils/format';

interface AssistanceAmountProps {
  amount: string;
  label?: string;
}

export function AssistanceAmount({ amount, label }: AssistanceAmountProps) {
  return (
    <Text style={styles.amount} accessibilityLabel={`${label ?? 'Requested amount'}: ${formatCurrency(amount)}`}>
      {label ? <Text style={styles.label}>{label}: </Text> : null}
      {formatCurrency(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  label: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
});

export default AssistanceAmount;
