import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '../../../../../core/theme';
import { AdminStatCard } from '../../../../../core/components/admin/AdminStatCard';
import { Calendar, Clock3, Check, X } from '../../../../../core/components/icons';
import type { EventStatsSummary } from '../types/events.types';

interface EventSummaryStatsProps {
  stats: EventStatsSummary;
  style?: ViewStyle;
}

/**
 * 2×2 Summary KPI Grid matching the HRSJM official reference design (Image 1).
 */
export const EventSummaryStats: React.FC<EventSummaryStatsProps> = ({ stats, style }) => {
  return (
    <View style={[styles.grid, style]}>
      <View style={styles.row}>
        <AdminStatCard
          label="Total Events"
          value={stats.total}
          tone="navy"
          Icon={Calendar}
        />
        <AdminStatCard
          label="Upcoming"
          value={stats.upcoming}
          tone="warning"
          Icon={Clock3}
        />
      </View>
      <View style={styles.row}>
        <AdminStatCard
          label="Completed"
          value={stats.completed}
          tone="success"
          Icon={Check}
        />
        <AdminStatCard
          label="Cancelled"
          value={stats.cancelled}
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

export default EventSummaryStats;