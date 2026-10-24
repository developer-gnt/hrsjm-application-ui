import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import { FileText, Clock, Check, X, type AppIconComponent } from '../../../../../core/components/icons';
import type { RightsStatsSummary } from '../types/rights.types';

interface StatCardConfig {
  key: keyof RightsStatsSummary;
  label: string;
  Icon: AppIconComponent;
  surfaceBg: string;
  iconBg: string;
  numberColor?: string;
  labelColor?: string;
}

/** 4 Cards in 2x2 grid matching reference screenshot: Total Articles, Drafts, Published, Archived. */
const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total Articles',
    Icon: FileText,
    surfaceBg: '#EFF6FF',
    iconBg: '#06294D',
    numberColor: '#0B2F52',
    labelColor: '#34516D',
  },
  {
    key: 'drafts',
    label: 'Drafts',
    Icon: Clock,
    surfaceBg: '#FFF7ED',
    iconBg: '#EA580C',
    numberColor: '#0B2F52',
    labelColor: '#34516D',
  },
  {
    key: 'published',
    label: 'Published',
    Icon: Check,
    surfaceBg: '#F0FDF4',
    iconBg: '#16A34A',
    numberColor: '#16A34A',
    labelColor: '#15803D',
  },
  {
    key: 'archived',
    label: 'Archived',
    Icon: X,
    surfaceBg: '#FEF2F2',
    iconBg: '#DC2626',
    numberColor: '#DC2626',
    labelColor: '#B91C1C',
  },
];

const STAT_ROWS: [StatCardConfig[], StatCardConfig[]] = [
  [STAT_CARDS[0], STAT_CARDS[1]],
  [STAT_CARDS[2], STAT_CARDS[3]],
];

export const RightsSummaryCard: React.FC<{
  stats: RightsStatsSummary;
  style?: ViewStyle;
}> = ({ stats, style }) => {
  return (
    <View style={[styles.container, style]}>
      {STAT_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(card => {
            const value = stats[card.key] ?? 0;
            const IconComponent = card.Icon;

            return (
              <View
                key={card.key}
                style={[styles.card, { backgroundColor: card.surfaceBg }]}
                accessible
                accessibilityLabel={`${card.label}: ${value}`}
                accessibilityRole="text"
              >
                <View style={[styles.iconCircle, { backgroundColor: card.iconBg }]}>
                  <IconComponent size={17} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <Text style={[styles.value, card.numberColor ? { color: card.numberColor } : null]}>
                  {value}
                </Text>
                <Text
                  style={[styles.label, card.labelColor ? { color: card.labelColor } : null]}
                  numberOfLines={1}
                >
                  {card.label}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    minHeight: 104,
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2F52',
    lineHeight: 26,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34516D',
    marginTop: 2,
  },
});
