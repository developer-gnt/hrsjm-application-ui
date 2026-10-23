import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock3, UserCheck, Users, UserX } from '../../../../core/components/icons';
import { Spacing } from '../../../../core/theme/spacing';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import type { MemberStats as MemberStatsData } from '../types';

interface MemberStatsProps {
  stats: MemberStatsData;
  loading?: boolean;
}

/**
 * Four directory statistic cards in a two-column grid layout, matching Donation Seekers.
 */
export const MemberStats: React.FC<MemberStatsProps> = ({ stats, loading = false }) => {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <AdminStatCard
          label="Total Members"
          value={stats.total ?? 0}
          tone="navy"
          Icon={Users}
          loading={loading}
        />
        <AdminStatCard
          label="Active"
          value={stats.active ?? 0}
          tone="success"
          Icon={UserCheck}
          loading={loading}
        />
      </View>
      <View style={styles.row}>
        <AdminStatCard
          label="Expiring Soon"
          value={stats.expiringSoon ?? 0}
          sublabel="(30 days)"
          tone="warning"
          Icon={Clock3}
          loading={loading}
        />
        <AdminStatCard
          label="Inactive"
          value={stats.inactive ?? 0}
          tone="danger"
          Icon={UserX}
          loading={loading}
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

export default MemberStats;
