import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { UserStats } from '../types/user.types';

interface UsersStatsCardsProps {
  stats: UserStats;
  selectedStatus?: string;
  onSelectStatus?: (status: 'all' | 'active' | 'pending' | 'blocked') => void;
}

export const UsersStatsCards: React.FC<UsersStatsCardsProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
}) => {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <View style={styles.grid}>
      {/* Row 1: Total Users | Active Users */}
      <View style={styles.row}>
        {/* Total Users */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.totalCard,
            selectedStatus === 'all' && styles.cardActiveRing,
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectStatus?.('all')}
          accessibilityRole="button"
          accessibilityLabel={`Total Users: ${formatNumber(stats.total)}`}
        >
          <View style={styles.iconCircleBlue}>
            <Text style={styles.iconTextBlue}>👥</Text>
          </View>
          <Text style={styles.numberBlue}>{formatNumber(stats.total)}</Text>
          <Text style={styles.labelBlue}>Total Users</Text>
        </TouchableOpacity>

        {/* Active Users */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.activeCard,
            selectedStatus === 'active' && styles.cardActiveRing,
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectStatus?.('active')}
          accessibilityRole="button"
          accessibilityLabel={`Active Users: ${formatNumber(stats.active)}`}
        >
          <View style={styles.iconCircleGreen}>
            <Text style={styles.iconTextGreen}>👤</Text>
          </View>
          <Text style={styles.numberGreen}>{formatNumber(stats.active)}</Text>
          <Text style={styles.labelGreen}>Active Users</Text>
        </TouchableOpacity>
      </View>

      {/* Row 2: Pending Verification | Blocked Users */}
      <View style={styles.row}>
        {/* Pending Verification */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.pendingCard,
            selectedStatus === 'pending' && styles.cardActiveRing,
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectStatus?.('pending')}
          accessibilityRole="button"
          accessibilityLabel={`Pending Verification: ${formatNumber(stats.pending)}`}
        >
          <View style={styles.iconCircleAmber}>
            <Text style={styles.iconTextAmber}>⏱️</Text>
          </View>
          <Text style={styles.numberAmber}>{formatNumber(stats.pending)}</Text>
          <Text style={styles.labelAmber}>Pending Verification</Text>
        </TouchableOpacity>

        {/* Blocked Users */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.blockedCard,
            selectedStatus === 'blocked' && styles.cardActiveRing,
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectStatus?.('blocked')}
          accessibilityRole="button"
          accessibilityLabel={`Blocked Users: ${formatNumber(stats.blocked)}`}
        >
          <View style={styles.iconCircleRed}>
            <Text style={styles.iconTextRed}>🚫</Text>
          </View>
          <Text style={styles.numberRed}>{formatNumber(stats.blocked)}</Text>
          <Text style={styles.labelRed}>Blocked Users</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    marginVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 104,
  },
  cardActiveRing: {
    borderWidth: 2,
    borderColor: '#0F2860',
  },

  // Total Card (Blue)
  totalCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconTextBlue: {
    fontSize: 16,
  },
  numberBlue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.2,
  },
  labelBlue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 2,
  },

  // Active Card (Green)
  activeCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconTextGreen: {
    fontSize: 16,
  },
  numberGreen: {
    fontSize: 22,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.2,
  },
  labelGreen: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },

  // Pending Card (Amber)
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  iconCircleAmber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconTextAmber: {
    fontSize: 16,
  },
  numberAmber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.2,
  },
  labelAmber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 2,
  },

  // Blocked Card (Red)
  blockedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconTextRed: {
    fontSize: 16,
  },
  numberRed: {
    fontSize: 22,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.2,
  },
  labelRed: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 2,
  },
});
