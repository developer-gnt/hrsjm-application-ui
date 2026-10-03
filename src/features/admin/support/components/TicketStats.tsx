import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import type { TicketStats } from '../hooks/useSupportTickets';

interface TicketStatsRowProps {
  stats: TicketStats;
  loading: boolean;
}

export function TicketStatsRow({ stats }: TicketStatsRowProps) {
  return (
    <View style={styles.statsGrid}>
      <View style={[styles.statCard, styles.statCardTotal]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#1E40AF' }]}>TOTAL</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#1E3A8A' }]}>
          {stats.total ?? 0}
        </Text>
        <Text style={styles.statSubText}>All tickets</Text>
      </View>

      <View style={[styles.statCard, styles.statCardOpen]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#B45309' }]}>OPEN</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#B45309' }]}>
          {stats.open ?? 0}
        </Text>
        <Text style={styles.statSubText}>Needs reply</Text>
      </View>

      <View style={[styles.statCard, styles.statCardProgress]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#6D28D9' }]}>ACTIVE</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#6D28D9' }]}>
          {stats.inProgress ?? 0}
        </Text>
        <Text style={styles.statSubText}>In progress</Text>
      </View>

      <View style={[styles.statCard, styles.statCardResolved]}>
        <View style={styles.statTop}>
          <Text style={[styles.statBadgeLabel, { color: '#047857' }]}>RESOLVED</Text>
        </View>
        <Text style={[styles.statNumber, { color: '#047857' }]}>
          {stats.resolved ?? 0}
        </Text>
        <Text style={styles.statSubText}>Closed</Text>
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
  statCardOpen: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statCardProgress: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  statCardResolved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
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

export default TicketStatsRow;

