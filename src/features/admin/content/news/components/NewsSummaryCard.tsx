import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '../../../../../core/theme';
import { AdminStatCard } from '../../../../../core/components/admin/AdminStatCard';
import { FileText, Clock3, Check, X } from '../../../../../core/components/icons';
import type { NewsStatsSummary } from '../types/news.types';

interface NewsSummaryStatsProps {
  stats: NewsStatsSummary;
  style?: ViewStyle;
}

/**
 * 2×2 Summary KPI Grid matching the HRSJM official reference design (Image 1).
 */
export const NewsSummaryStats: React.FC<NewsSummaryStatsProps> = ({ stats, style }) => {
  return (
    <View style={[styles.grid, style]}>
      <View style={styles.row}>
        <AdminStatCard
          label="Total News"
          value={stats.total}
          tone="navy"
          Icon={FileText}
        />
        <AdminStatCard
          label="Drafts"
          value={stats.drafts}
          tone="warning"
          Icon={Clock3}
        />
      </View>
      <View style={styles.row}>
        <AdminStatCard
          label="Published"
          value={stats.published}
          tone="success"
          Icon={Check}
        />
        <AdminStatCard
          label="Archived"
          value={stats.archived}
          tone="danger"
          Icon={X}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

export default NewsSummaryStats;
