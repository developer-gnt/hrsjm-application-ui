import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Clock3, UserCheck, Users, UserX } from '../../../../core/components/icons';
import { Spacing } from '../../../../core/theme/spacing';
import { MemberStats as MemberStatsData } from '../types';
import { formatCount } from '../utils/members.utils';
import { MemberStatCard } from './MemberStatCard';

interface MemberStatsProps {
  stats: MemberStatsData;
  loading?: boolean;
}

/** Below this width, four-across cards would truncate their labels — stack 2×2. */
const COMPACT_WIDTH_BREAKPOINT = 480;

/** Four directory statistic cards; stacks to a 2×2 grid on narrow screens. */
export const MemberStats: React.FC<MemberStatsProps> = ({ stats, loading = false }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_WIDTH_BREAKPOINT;

  const totalCard = (
    <MemberStatCard
      label="Total Members"
      value={formatCount(stats.total)}
      tone="navy"
      Icon={Users}
      loading={loading}
    />
  );
  const activeCard = (
    <MemberStatCard
      label="Active"
      value={formatCount(stats.active)}
      tone="success"
      Icon={UserCheck}
      loading={loading}
    />
  );
  const expiringCard = (
    <MemberStatCard
      label="Expiring Soon"
      value={formatCount(stats.expiringSoon)}
      sublabel="(30 days)"
      tone="warning"
      Icon={Clock3}
      loading={loading}
    />
  );
  const inactiveCard = (
    <MemberStatCard
      label="Inactive"
      value={formatCount(stats.inactive)}
      tone="danger"
      Icon={UserX}
      loading={loading}
    />
  );

  if (isCompact) {
    return (
      <View style={styles.grid}>
        <View style={styles.row}>
          {totalCard}
          {activeCard}
        </View>
        <View style={styles.row}>
          {expiringCard}
          {inactiveCard}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {totalCard}
      {activeCard}
      {expiringCard}
      {inactiveCard}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  grid: {
    gap: Spacing.sm,
  },
});

export default MemberStats;
