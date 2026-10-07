import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core';
import { ApplicationStatsData } from '../types/membershipApplications.types';

interface MembershipStatsCardsProps {
  stats: ApplicationStatsData;
}

export const MembershipStatsCards: React.FC<MembershipStatsCardsProps> = ({ stats }) => {
  return (
    <View style={styles.grid}>
      {/* Total Applications */}
      <View style={[styles.card, styles.cardBlue]}>
        <View style={[styles.iconCircle, styles.iconCircleBlue]}>
          <Text style={styles.iconSymbol}>📄</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={[styles.statLabel, styles.statLabelBlue]}>Total Applications</Text>
        </View>
      </View>

      {/* Under Review */}
      <View style={[styles.card, styles.cardAmber]}>
        <View style={[styles.iconCircle, styles.iconCircleAmber]}>
          <Text style={styles.iconSymbol}>🕒</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.statNumber}>{stats.underReview}</Text>
          <Text style={[styles.statLabel, styles.statLabelAmber]}>Under Review</Text>
        </View>
      </View>

      {/* Approved */}
      <View style={[styles.card, styles.cardGreen]}>
        <View style={[styles.iconCircle, styles.iconCircleGreen]}>
          <Text style={styles.iconSymbol}>✓</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.statNumber}>{stats.approved}</Text>
          <Text style={[styles.statLabel, styles.statLabelGreen]}>Approved</Text>
        </View>
      </View>

      {/* Rejected */}
      <View style={[styles.card, styles.cardRed]}>
        <View style={[styles.iconCircle, styles.iconCircleRed]}>
          <Text style={styles.iconSymbol}>✕</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.statNumber}>{stats.rejected}</Text>
          <Text style={[styles.statLabel, styles.statLabelRed]}>Rejected</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    gap: 12,
    marginVertical: Spacing.xs,
  },
  card: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
  },
  cardBlue: {
    backgroundColor: '#EEF5FF',
    borderColor: '#E0ECFC',
  },
  cardAmber: {
    backgroundColor: '#FFF9ED',
    borderColor: '#FEEFD6',
  },
  cardGreen: {
    backgroundColor: '#EEFAF4',
    borderColor: '#DCF5E8',
  },
  cardRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FDE4E4',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBlue: {
    backgroundColor: AdminColors.primary,
  },
  iconCircleAmber: {
    backgroundColor: '#D97706',
  },
  iconCircleGreen: {
    backgroundColor: '#10B981',
  },
  iconCircleRed: {
    backgroundColor: '#EF4444',
  },
  iconSymbol: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  statLabelBlue: {
    color: '#2563EB',
  },
  statLabelAmber: {
    color: '#D97706',
  },
  statLabelGreen: {
    color: '#16A34A',
  },
  statLabelRed: {
    color: '#DC2626',
  },
});
