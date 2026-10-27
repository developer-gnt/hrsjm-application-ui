import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';
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
            <Text style={styles.iconText}>👥</Text>
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
            <Text style={styles.iconText}>👤</Text>
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
            <Text style={styles.iconText}>⏱️</Text>
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
            <Text style={styles.iconText}>🚫</Text>
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
    gap: 8,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 100,
  },
  cardActiveRing: {
    borderWidth: 2,
    borderColor: '#06294D',
  },
  iconText: {
    fontSize: 16,
  },

  // Total Card (Pale Blue / Navy per design.md)
  totalCard: {
    backgroundColor: '#EDF2F7',
    borderColor: '#DBE5EE',
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#DBE5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numberBlue: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: 0.2,
  },
  labelBlue: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#174A78',
    marginTop: 2,
  },

  // Active Card (Dignified Green per design.md tokens)
  activeCard: {
    backgroundColor: '#EAF7EE',
    borderColor: '#D1EAD8',
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1EAD8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numberGreen: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.2,
  },
  labelGreen: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },

  // Pending Card (Warm Gold per design.md tokens)
  pendingCard: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FAD465',
  },
  iconCircleAmber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FDE8A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numberAmber: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#8F6600',
    letterSpacing: 0.2,
  },
  labelAmber: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#8F6600',
    marginTop: 2,
  },

  // Blocked Card (Subtle Red / Danger per design.md tokens)
  blockedCard: {
    backgroundColor: '#FDEEEF',
    borderColor: '#FBD5D8',
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FBD5D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numberRed: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.2,
  },
  labelRed: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    marginTop: 2,
  },
});
