import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { GreenSealRosetteIcon } from './MembershipIcons';

export const ThreeYearRenewalInfoCard: React.FC = () => {
  return (
    <View
      style={styles.cardContainer}
      accessibilityRole="region"
      accessibilityLabel="3-Year Renewal Information"
    >
      <View style={styles.iconWrapper}>
        <GreenSealRosetteIcon size={26} color="#16A34A" />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.titleLine}>After 3 years of consistent renewal,</Text>
        <Text style={styles.bodyLine}>
          the annual renewal charge will only be{' '}
          <Text style={styles.priceHighlight}>₹ 300.</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  titleLine: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 16,
  },
  bodyLine: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 16,
    marginTop: 1,
  },
  priceHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
});
