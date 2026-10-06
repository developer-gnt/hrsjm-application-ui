import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import {
  AdminColors,
  Typography,
  Spacing,
  BorderRadius,
  SkeletonCard,
} from '../../../../core';

export interface DonationStatItem {
  id: string;
  label: string;
  value: string;
  supportText: string;
  /** Optional change indicator, e.g. "↑ 22%" (reference design). */
  indicator?: string;
  icon: string;
  background: string;
}

interface DonationStatsProps {
  stats: DonationStatItem[];
  loading?: boolean;
  /** Fixed card width; 4 cards fit across on wide viewports. */
  cardWidth?: number;
  /** 'scroll' = horizontal 4-across carousel; 'grid' = 2x2 wrapped grid. */
  layout?: 'scroll' | 'grid';
}

/**
 * Pastel statistic cards matching the approved reference proportions,
 * horizontally scrollable on small screens. Values must come from
 * backend-derived counts or clearly-marked preview data.
 */
export const DonationStats: React.FC<DonationStatsProps> = ({
  stats,
  loading = false,
  cardWidth = 190,
  layout = 'scroll',
}) => {
  // 4-across cards are narrow; use the reference's compact metrics there.
  const narrow = cardWidth < 130;

  // Admin-dashboard card layout: icon on the left, label + value (with
  // change indicator) beside it, support text underneath.
  const renderStatCard = (stat: DonationStatItem) => (
    <View
      key={stat.id}
      style={[
        styles.card,
        narrow && styles.cardSm,
        layout === 'grid' ? styles.gridCard : { width: cardWidth },
        { backgroundColor: stat.background },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{stat.icon}</Text>
        </View>
        <View style={styles.topText}>
          <Text style={[styles.label, narrow && styles.labelSm]}>
            {stat.label}
          </Text>
          <View style={styles.valueRow}>
            <Text
              style={[styles.value, narrow && styles.valueSm]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {stat.value}
            </Text>
            {stat.indicator ? (
              <View style={styles.indicatorPill}>
                <Text style={styles.indicatorText}>{stat.indicator}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <Text style={[styles.support, narrow && styles.supportSm]}>
        {stat.supportText}
      </Text>
    </View>
  );

  if (loading && layout === 'grid') {
    return (
      <View style={styles.grid}>
        {stats.map(stat => (
          <View
            key={stat.id}
            style={[styles.skeletonWrapper, styles.gridCard]}
          >
            <SkeletonCard height={96} />
          </View>
        ))}
      </View>
    );
  }

  if (layout === 'grid') {
    return (
      <View style={styles.grid}>{stats.map(renderStatCard)}</View>
    );
  }
  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {stats.map(stat => (
          <View
            key={stat.id}
            style={[styles.skeletonWrapper, { width: cardWidth }]}
          >
            <SkeletonCard height={96} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {stats.map(renderStatCard)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingRight: Spacing.base,
  },
  skeletonWrapper: {
    marginRight: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    marginRight: 0,
    marginBottom: Spacing.sm,
    width: '48%',
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginRight: Spacing.sm,
  },
  cardSm: {
    padding: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  topText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  labelSm: {
    fontSize: 8.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  valueSm: {
    fontSize: 13,
  },
  value: {
    fontSize: 19,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    flexShrink: 1,
  },
  indicatorPill: {
    backgroundColor: AdminColors.statusActiveLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
    flexShrink: 0,
  },
  indicatorText: {
    ...Typography.caption,
    color: AdminColors.success,
    fontWeight: '600',
  },
  supportSm: {
    fontSize: 9,
    lineHeight: 12,
  },
  support: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
});