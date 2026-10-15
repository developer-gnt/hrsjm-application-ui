import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../../../core/theme/spacing';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import { Users, Clock3, UserCheck, UserX } from '../../../../core/components/icons';
import type { AssistanceStats } from '../hooks/useAssistance';

interface AssistanceStatsProps {
  stats: AssistanceStats;
  loading?: boolean;
}

export function AssistanceStatsRow({ stats, loading = false }: AssistanceStatsProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <AdminStatCard
          label="Total Requests"
          value={stats.total ?? 0}
          tone="navy"
          Icon={Users}
          loading={loading}
        />
        <AdminStatCard
          label="Under Review"
          value={stats.underReview ?? 0}
          tone="warning"
          Icon={Clock3}
          loading={loading}
        />
      </View>
      <View style={styles.row}>
        <AdminStatCard
          label="Approved"
          value={stats.approved ?? 0}
          tone="success"
          Icon={UserCheck}
          loading={loading}
        />
        <AdminStatCard
          label="Rejected"
          value={stats.rejected ?? 0}
          tone="danger"
          Icon={UserX}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

export default AssistanceStatsRow;
