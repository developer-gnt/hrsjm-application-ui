import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export type AdminBadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface AdminStatusBadgeProps {
  label: string;
  tone?: AdminBadgeTone;
}

const TONE_STYLES: Record<AdminBadgeTone, { bg: string; fg: string }> = {
  success: { bg: AdminColors.successLight, fg: AdminColors.success },
  warning: { bg: AdminColors.warningLight, fg: AdminColors.warning },
  danger: { bg: AdminColors.errorLight, fg: AdminColors.error },
  info: { bg: AdminColors.infoLight, fg: AdminColors.info },
  neutral: { bg: AdminColors.border, fg: AdminColors.textSecondary },
  purple: { bg: AdminColors.accentPurpleLight, fg: AdminColors.accentPurple },
};

/** Colored pill for entity statuses across admin modules. */
export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  label,
  tone = 'neutral',
}) => {
  const colors = TONE_STYLES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.fg }]}>{label}</Text>
    </View>
  );
};

/** Canonical status → tone mapping for entities surfaced in the admin UI. */
export const adminStatusTone = (status: string): AdminBadgeTone => {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'SUCCESS':
    case 'VERIFIED':
    case 'RESOLVED':
    case 'POSTED':
      return 'success';
    case 'PENDING':
      return 'info';
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'IN_PROGRESS':
      return 'warning';
    case 'REJECTED':
    case 'FAILED':
    case 'INACTIVE':
    case 'SUSPENDED':
    case 'EXPIRED':
    case 'CANCELLED':
      return 'danger';
    case 'CLOSED':
    case 'REFUNDED':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.caption,
  },
});
