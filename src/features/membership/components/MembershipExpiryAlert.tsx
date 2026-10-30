import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { WarningExclamationIcon } from './MembershipIcons';
import { Info } from '../../../core/components/icons';

interface MembershipExpiryAlertProps {
  daysRemaining?: number;
  message?: string;
  isOverdue?: boolean;
}

export const MembershipExpiryAlert: React.FC<MembershipExpiryAlertProps> = ({
  daysRemaining = 7,
  message,
  isOverdue = false,
}) => {
  const isEarly = !isOverdue && daysRemaining > 30;

  const title = message || (
    isOverdue
      ? 'Your membership has expired!'
      : isEarly
      ? 'Membership Active'
      : 'Your membership is expiring soon!'
  );

  const subtitle = isOverdue
    ? `${daysRemaining} days overdue`
    : isEarly
    ? `${daysRemaining} days remaining · Membership renewal is allowed only within 30 days before the expiry date.`
    : `Only ${daysRemaining} days remaining · Renewal is now open`;

  return (
    <View
      style={[
        styles.alertCard,
        isEarly && styles.alertCardInfo,
      ]}
      accessibilityRole="alert"
      accessibilityLabel="Membership Expiry Alert"
    >
      <View style={styles.iconWrapper}>
        {isEarly ? (
          <Info size={22} color="#1D4ED8" strokeWidth={2} />
        ) : (
          <WarningExclamationIcon size={24} color="#EA580C" />
        )}
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.titleText, isEarly && styles.titleTextInfo]}>
          {title}
        </Text>
        <Text style={[styles.daysText, isEarly && styles.daysTextInfo]}>
          {subtitle}
        </Text>
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
  alertCardInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
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
  titleTextInfo: {
    color: '#1D4ED8',
  },
  daysText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#EA580C',
    marginTop: 1,
  },
  daysTextInfo: {
    color: '#1E40AF',
  },
});
