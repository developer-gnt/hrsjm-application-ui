import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { formatCurrency } from '../../../core/utils/format';
import type { DonationRecord, DonationStatus } from '../types/donation.types';
import { CauseThumbnail } from './CauseThumbnail';

interface DonationHistoryCardProps {
  item: DonationRecord;
  onPress: () => void;
}

const STATUS_CONFIG: Record<
  DonationStatus,
  { label: string; bg: string; fg: string; dot: string }
> = {
  Completed: {
    label: 'Completed',
    bg: colors.greenSoft,
    fg: colors.active,
    dot: colors.active,
  },
  Pending: {
    label: 'Pending',
    bg: colors.goldSoft,
    fg: colors.goldText,
    dot: colors.warning,
  },
  Failed: {
    label: 'Failed',
    bg: colors.redSoft,
    fg: colors.danger,
    dot: colors.danger,
  },
};

export function DonationHistoryCard({ item, onPress }: DonationHistoryCardProps) {
  const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.Completed;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${formatCurrency(item.amount)}, status ${item.status}`}
      style={styles.card}>
      <View style={styles.thumbnailWrap}>
        <CauseThumbnail type={item.imageType} imageUrl={item.imageUrl} size={54} />
      </View>

      <View style={styles.contentWrap}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.date}>{item.dateTime}</Text>
      </View>

      <View style={styles.rightWrap}>
        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusMeta.dot }]} />
          <Text style={[styles.statusText, { color: statusMeta.fg }]}>
            {statusMeta.label}
          </Text>
        </View>

        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  thumbnailWrap: {
    marginRight: spacing.md,
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  rightWrap: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingLeft: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
});

export default DonationHistoryCard;
