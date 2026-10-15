import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Shadows, Spacing, Typography } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils/currency';

interface ReportKpiCardProps {
  label: string;
  amount?: number;
  valueText?: string;
  subText?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'danger' | 'warning' | 'info';
  style?: ViewStyle;
}

export const ReportKpiCard: React.FC<ReportKpiCardProps> = ({
  label,
  amount,
  valueText,
  subText,
  badgeText,
  badgeVariant = 'info',
  style,
}) => {
  const displayValue = valueText ?? (amount !== undefined ? formatINR(amount) : '₹0');

  const badgeBg =
    badgeVariant === 'success'
      ? '#DCFCE7'
      : badgeVariant === 'danger'
      ? '#FEE2E2'
      : badgeVariant === 'warning'
      ? '#FEF3C7'
      : '#EFF6FF';

  const badgeColor =
    badgeVariant === 'success'
      ? '#166534'
      : badgeVariant === 'danger'
      ? '#991B1B'
      : badgeVariant === 'warning'
      ? '#92400E'
      : '#1E40AF';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {badgeText ? (
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.amount} numberOfLines={1}>{displayValue}</Text>
      {subText ? <Text style={styles.subText}>{subText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2C59',
  },
  subText: {
    ...Typography.caption,
    color: '#94A3B8',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
