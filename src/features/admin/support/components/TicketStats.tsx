import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../../../core/theme/spacing';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import { MessageSquare, Clock3, UserCheck, Check } from '../../../../core/components/icons';
import type { TicketStats } from '../hooks/useSupportTickets';

interface TicketStatsRowProps {
  stats: TicketStats;
  loading?: boolean;
}

export function TicketStatsRow({ stats, loading = false }: TicketStatsRowProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <AdminStatCard
          label="Total Tickets"
          value={stats.total ?? 0}
          tone="navy"
          Icon={MessageSquare}
          loading={loading}
        />
        <AdminStatCard
          label="Open"
          value={stats.open ?? 0}
          sublabel="Needs reply"
          tone="warning"
          Icon={Clock3}
          loading={loading}
        />
      </View>
      <View style={styles.row}>
        <AdminStatCard
          label="In Progress"
          value={stats.inProgress ?? 0}
          sublabel="Active"
          tone="gold"
          Icon={UserCheck}
          loading={loading}
        />
        <AdminStatCard
          label="Resolved"
          value={stats.resolved ?? 0}
          sublabel="Closed"
          tone="success"
          Icon={Check}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

export default TicketStatsRow;
