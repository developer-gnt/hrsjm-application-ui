import React from 'react';
import { StyleSheet, View } from 'react-native';
import AdminStatCard from '../../../../core/components/admin/AdminStatCard';
import type { TicketStats } from '../hooks/useSupportTickets';

interface TicketStatsRowProps {
  stats: TicketStats;
  loading: boolean;
}

// Stat cards per the phase plan: Total, Open, In Progress, Resolved.
export function TicketStatsRow({ stats, loading }: TicketStatsRowProps) {
  return (
    <View style={styles.row}>
      <AdminStatCard label="Total" value={stats.total} tone="primary" loading={loading} />
      <AdminStatCard label="Open" value={stats.open} tone="warning" loading={loading} />
      <AdminStatCard label="In Progress" value={stats.inProgress} tone="primary" loading={loading} />
      <AdminStatCard label="Resolved" value={stats.resolved} tone="success" loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default TicketStatsRow;
