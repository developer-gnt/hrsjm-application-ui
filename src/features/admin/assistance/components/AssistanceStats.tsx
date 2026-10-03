import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import type { AssistanceStats } from '../hooks/useAssistance';

interface AssistanceStatsProps {
  stats: AssistanceStats;
  loading?: boolean;
}

export function AssistanceStatsRow({ stats }: AssistanceStatsProps) {
  return (
    <View style={styles.statsGrid}>
      <View style={[styles.statCard, styles.statCardTotal]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#1E40AF' }]}>TOTAL</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#1E3A8A' }]}>
          {stats.total ?? 0}
        </Text>
        <Text style={styles.statSubText}>All requests</Text>
      </View>

      <View style={[styles.statCard, styles.statCardReview]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#B45309' }]}>REVIEW</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#B45309' }]}>
          {stats.underReview ?? 0}
        </Text>
        <Text style={styles.statSubText}>Pending action</Text>
      </View>

      <View style={[styles.statCard, styles.statCardApproved]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#047857' }]}>APPROVED</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#047857' }]}>
          {stats.approved ?? 0}
        </Text>
        <Text style={styles.statSubText}>Verified</Text>
      </View>

      <View style={[styles.statCard, styles.statCardRejected]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#B91C1C' }]}>REJECTED</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#B91C1C' }]}>
          {stats.rejected ?? 0}
        </Text>
        <Text style={styles.statSubText}>Declined</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  statCardTotal: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statCardReview: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statCardApproved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statCardRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  statSubText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AssistanceStatsRow;

