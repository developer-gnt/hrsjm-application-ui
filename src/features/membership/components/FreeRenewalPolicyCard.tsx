import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { NoteDocumentIcon } from './MembershipIcons';

const POLICY_POINTS = [
  'There is no need to wait for the renewal period to arrive. Renewal can be processed anytime.',
  'When you introduce a new member, your ID will be sent along with theirs, and your renewal period will be extended accordingly.',
  'If you introduce new members multiple times within a year, you will receive a free renewal each time, and a new ID will be issued to you every time.',
];

export const FreeRenewalPolicyCard: React.FC = () => {
  return (
    <View
      style={styles.cardContainer}
      accessibilityRole="region"
      accessibilityLabel="Note for Free Renewal Policy"
    >
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <NoteDocumentIcon size={18} color="#7C3AED" />
        </View>
        <Text style={styles.headerTitle}>Note for Free Renewal Policy</Text>
      </View>

      {/* Numbered Policy Points */}
      <View style={styles.pointsContainer}>
        {POLICY_POINTS.map((pointText, index) => (
          <View key={index} style={styles.pointRow}>
            {/* Number Indicator Badge */}
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>{index + 1}</Text>
            </View>

            {/* Point Text */}
            <Text style={styles.pointText}>{pointText}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FAF5FF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: -0.1,
  },
  pointsContainer: {
    padding: Spacing.md,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  numberBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  pointText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 15.5,
    fontWeight: '500',
  },
});
