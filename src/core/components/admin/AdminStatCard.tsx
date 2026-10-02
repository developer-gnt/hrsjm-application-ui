import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export type AdminStatCardTint = 'blue' | 'gold' | 'green' | 'purple';

interface AdminStatCardProps {
  icon: string;
  title: string;
  value: string | number;
  /** Month-over-month growth percent, e.g. 12 for "+12%". */
  growthPercent?: number;
  /** Supporting note, e.g. "+268 this month". */
  note?: string;
  tint?: AdminStatCardTint;
  onPress?: () => void;
}

const TINT_STYLES: Record<
  AdminStatCardTint,
  {
    background: string;
    borderColor: string;
    iconBackground: string;
    iconColor: string;
  }
> = {
  blue: {
    background: '#F0F7FF',
    borderColor: '#E0F2FE',
    iconBackground: '#BAE6FD',
    iconColor: '#0284C7',
  },
  gold: {
    background: '#FFFBEB',
    borderColor: '#FEF3C7',
    iconBackground: '#FDE68A',
    iconColor: '#D97706',
  },
  green: {
    background: '#F0FDF4',
    borderColor: '#DCFCE7',
    iconBackground: '#BBF7D0',
    iconColor: '#16A34A',
  },
  purple: {
    background: '#FAF5FF',
    borderColor: '#F3E8FF',
    iconBackground: '#E9D5FF',
    iconColor: '#9333EA',
  },
};

/** Tinted KPI card matching the HRSJM official design system. */
export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon,
  title,
  value,
  growthPercent,
  note,
  tint = 'blue',
  onPress,
}) => {
  const colors = TINT_STYLES[tint];
  const growthLabel =
    growthPercent === undefined || growthPercent === null
      ? null
      : `↑ ${Math.abs(growthPercent)}%`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.borderColor,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.cardContent}>
        {/* Left circular icon badge */}
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: colors.iconBackground },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        {/* Right info block */}
        <View style={styles.infoBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.valueRow}>
            <Text style={styles.value}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
            {growthLabel ? (
              <View style={styles.growthBadge}>
                <Text style={styles.growthText}>{growthLabel}</Text>
              </View>
            ) : null}
          </View>

          {note ? (
            <Text style={styles.note} numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: 12,
    borderWidth: 1,
    minHeight: 88,
    justifyContent: 'center',
    ...Shadows.card,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  infoBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2C59',
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F2C59',
  },
  growthBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  note: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
});
