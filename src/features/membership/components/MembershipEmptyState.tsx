import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

interface MembershipEmptyStateProps {
  onStartRegistration?: () => void;
}

export const MembershipEmptyState: React.FC<MembershipEmptyStateProps> = ({
  onStartRegistration,
}) => {
  return (
    <View style={styles.cardContainer} accessibilityRole="region" accessibilityLabel="Empty Membership State">
      {/* Icon Badge */}
      <View style={styles.iconCircle}>
        <View style={styles.idCardOutline}>
          <View style={styles.cardBar} />
          <View style={styles.cardRow}>
            <View style={styles.cardAvatar} />
            <View style={styles.cardLines}>
              <View style={styles.cardLine1} />
              <View style={styles.cardLine2} />
            </View>
          </View>
        </View>
      </View>

      {/* Title & Message */}
      <Text style={styles.title}>No Membership Details Found</Text>
      <Text style={styles.description}>
        You have not completed member registration yet. Join the Human Rights & Social Justice Mission to unlock member benefits, official certificate, and digital ID card.
      </Text>

      {/* CTA Button */}
      {onStartRegistration && (
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={onStartRegistration}
          accessibilityRole="button"
          accessibilityLabel="Start Member Registration"
        >
          <Text style={styles.ctaButtonText}>Start Member Registration</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginHorizontal: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#E2E8F0',
    padding: Spacing.xl,
    marginTop: -22,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  idCardOutline: {
    width: 36,
    height: 26,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1E40AF',
    padding: 3,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  cardBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#EAA224',
    borderRadius: 1.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardAvatar: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1E40AF',
  },
  cardLines: {
    flex: 1,
    gap: 2.5,
  },
  cardLine1: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
  },
  cardLine2: {
    width: '60%',
    height: 2.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 320,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA224',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#0F2860',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  ctaArrow: {
    color: '#0F2860',
    fontSize: 16,
    fontWeight: '800',
  },
});
