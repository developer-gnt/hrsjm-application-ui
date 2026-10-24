import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../../../core';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import {
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from '../../../../core/components/icons';
import { ApplicationStatsData } from '../types/membershipApplications.types';

interface MembershipStatsCardsProps {
  stats: ApplicationStatsData;
}

export const MembershipStatsCards: React.FC<MembershipStatsCardsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AdminStatCard
          Icon={FileText}
          title="Total Applications"
          value={stats.total}
          tone="navy"
        />
        <AdminStatCard
          Icon={Clock3}
          title="Under Review"
          value={stats.underReview}
          tone="warning"
        />
      </View>
      <View style={styles.row}>
        <AdminStatCard
          Icon={CheckCircle2}
          title="Approved"
          value={stats.approved}
          tone="success"
        />
        <AdminStatCard
          Icon={AlertCircle}
          title="Rejected"
          value={stats.rejected}
          tone="danger"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    gap: 10,
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});

