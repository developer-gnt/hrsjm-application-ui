import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { VerificationShieldIcon } from './MembershipIcons';

export const MembershipVerificationNotice: React.FC = () => {
  return (
    <View style={styles.cardContainer} accessibilityRole="region" accessibilityLabel="Verification Notice">
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <VerificationShieldIcon size={18} color="#1E40AF" />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.titleText}>Document Verification & Approval Policy</Text>
          <Text style={styles.subtitleText}>राष्ट्रीय समिति द्वारा सत्यापन एवं अनुमोदन</Text>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        <Text style={styles.bodyText}>
          All membership applications are subject to mandatory document verification and background check by the{' '}
          <Text style={styles.boldText}>HRSJM National Committee</Text> before final appointment approval.
        </Text>
        <View style={styles.kitNoteBox}>
          <Text style={styles.kitNoteText}>
            📦 Official Welcome Kit (Appointment Letter, Certificate, ID Card, Lanyard & T-Shirt) will be dispatched to your registered address upon verification.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  titleWrapper: {
    flex: 1,
  },
  titleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E3A8A',
    lineHeight: 16,
  },
  subtitleText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 1,
  },
  bodyContainer: {
    paddingTop: 8,
  },
  bodyText: {
    fontSize: 11,
    color: '#1E293B',
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F2860',
  },
  kitNoteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  kitNoteText: {
    fontSize: 10.5,
    color: '#334155',
    lineHeight: 15,
  },
});
