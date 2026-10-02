import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { AppBadge, BadgeStatus } from '../../../../core';

interface DonationStatusBadgeProps {
  label: string;
  tone: BadgeStatus;
  /** Compact metrics for the wide-viewport table row variant. */
  small?: boolean;
}

interface StatusPresentation {
  label: string;
  tone: BadgeStatus;
}

/**
 * Maps backend donation status enums to human-readable labels and
 * shared badge tones. Unknown backend values render as-is.
 */
const STATUS_PRESENTATION: Record<string, StatusPresentation> = {
  PENDING: { label: 'Pending', tone: 'PENDING' },
  SUCCESS: { label: 'Completed', tone: 'ACTIVE' },
  FAILED: { label: 'Failed', tone: 'FAILED' },
  REFUNDED: { label: 'Refunded', tone: 'WARNING' },
};

export const donationStatusPresentation = (status: string): StatusPresentation =>
  STATUS_PRESENTATION[status] ?? { label: status, tone: 'DEFAULT' };

export const DonationStatusBadge: React.FC<DonationStatusBadgeProps> = ({
  label,
  tone,
  small = false,
}) => {
  return (
    <AppBadge
      label={label}
      status={tone}
      style={small ? styles.badgeSmall : styles.badge}
      textStyle={small ? styles.badgeTextSmall : styles.badgeText}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 5,
  },
  badgeText: {
    textTransform: 'none',
    fontSize: 12,
  } as TextStyle,
  badgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  badgeTextSmall: {
    textTransform: 'none',
    fontSize: 8,
  } as TextStyle,
});