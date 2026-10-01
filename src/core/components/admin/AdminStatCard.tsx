import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/theme';

interface AdminStatCardProps {
  label: string;
  value: number | string;
  tone?: 'primary' | 'warning' | 'success' | 'danger';
  loading?: boolean;
  onPress?: () => void;
}

const toneMap = {
  primary: { bg: colors.primaryLight, fg: colors.primary },
  warning: { bg: '#FEF3C7', fg: '#B45309' },
  success: { bg: '#D1FAE5', fg: '#047857' },
  danger: { bg: '#FEE2E2', fg: '#B91C1C' },
} as const;

export function AdminStatCard({ label, value, tone = 'primary', loading = false }: AdminStatCardProps) {
  const scheme = toneMap[tone];
  return (
    <View
      style={[styles.card, { backgroundColor: scheme.bg }]}
      accessibilityLabel={`${label}: ${loading ? 'loading' : value}`}>
      <Text style={[styles.value, { color: scheme.fg }]}>{loading ? '—' : value}</Text>
      <Text style={[styles.label, { color: scheme.fg }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64,
    justifyContent: 'center',
  },
  value: {
    ...typography.metric,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default AdminStatCard;
