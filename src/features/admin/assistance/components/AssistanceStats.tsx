import React from 'react';
import { StyleSheet, View } from 'react-native';
import AdminStatCard from '../../../../core/components/admin/AdminStatCard';
import type { AssistanceStats } from '../hooks/useAssistance';

interface AssistanceStatsProps {
  stats: AssistanceStats;
  loading: boolean;
}

export function AssistanceStatsRow({ stats, loading }: AssistanceStatsProps) {
  return (
    <View style={styles.row}>
      <AdminStatCard label="Total Requests" value={stats.total} tone="primary" loading={loading} />
      <AdminStatCard label="Under Review" value={stats.underReview} tone="warning" loading={loading} />
      <AdminStatCard label="Approved" value={stats.approved} tone="success" loading={loading} />
      <AdminStatCard label="Rejected" value={stats.rejected} tone="danger" loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default AssistanceStatsRow;
