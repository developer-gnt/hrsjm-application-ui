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

  if (loading && layout === 'grid') {
    return (
      <View style={styles.grid}>
        {stats.map(stat => (
          <View
            key={stat.id}
            style={[styles.skeletonWrapper, styles.gridCard]}
          >
            <SkeletonCard height={158} />
          </View>
        ))}
      </View>
    );
  }

  if (layout === 'grid') {
    return (
      <View style={styles.grid}>
        {stats.map(stat => (
          <View
            key={stat.id}
            style={[
              styles.card,
              narrow && styles.cardSm,
              styles.gridCard,
              { backgroundColor: stat.background },
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{stat.icon}</Text>
            </View>
            <Text
              style={[styles.label, narrow && styles.labelSm]}
              numberOfLines={1}
            >
              {stat.label}
            </Text>
            <Text
              style={[styles.value, narrow && styles.valueSm]}
              numberOfLines={1}
            >
              {stat.value}
            </Text>
            <View style={styles.supportRow}>
              {stat.indicator ? (
                <View style={styles.indicatorPill}>
                  <Text style={styles.indicatorText}>{stat.indicator}</Text>
                </View>
              ) : null}
              <Text
                style={[styles.support, narrow && styles.supportSm]}
                numberOfLines={2}
              >
                {stat.supportText}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
            <SkeletonCard height={158} />
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
      {stats.map(stat => (
        <View
          key={stat.id}
          style={[
            styles.card,
            narrow && styles.cardSm,
            { backgroundColor: stat.background, width: cardWidth },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{stat.icon}</Text>
          </View>
          <Text
            style={[styles.label, narrow && styles.labelSm]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {stat.label}
          </Text>
          <Text
            style={[styles.value, narrow && styles.valueSm]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {stat.value}
          </Text>
          <View style={styles.supportRow}>
            {stat.indicator ? (
              <View style={styles.indicatorPill}>
                <Text style={styles.indicatorText}>{stat.indicator}</Text>
              </View>
            ) : null}
            <Text
              style={[styles.support, narrow && styles.supportSm]}
              numberOfLines={2}
            >
              {stat.supportText}
            </Text>
          </View>
        </View>
      ))}
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
    padding: Spacing.base,
    marginRight: Spacing.sm,
  },
  cardSm: {
    padding: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  labelSm: {
    fontSize: 8.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  valueSm: {
    fontSize: 13,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    marginTop: 2,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  indicatorPill: {
    backgroundColor: AdminColors.statusActiveLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.xs,
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
    flexShrink: 1,
  },
});