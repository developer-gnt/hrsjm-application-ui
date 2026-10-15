import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { WarningExclamationIcon } from './MembershipIcons';

interface MembershipExpiryAlertProps {
  daysRemaining?: number;
  message?: string;
}

export const MembershipExpiryAlert: React.FC<MembershipExpiryAlertProps> = ({
  daysRemaining = 7,
  message = 'Your membership is expiring soon!',
}) => {
  return (
    <View
      style={styles.alertCard}
      accessibilityRole="alert"
      accessibilityLabel="Membership Expiry Alert"
    >
      <View style={styles.iconWrapper}>
        <WarningExclamationIcon size={24} color="#EA580C" />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.titleText}>{message}</Text>
        <Text style={styles.daysText}>{`Only ${daysRemaining} days remaining`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: '#FFF5ED',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
    lineHeight: 17,
  },
  daysText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#EA580C',
    marginTop: 1,
  },
});
