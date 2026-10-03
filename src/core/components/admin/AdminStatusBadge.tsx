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

const TONE_STYLES: Record<AdminBadgeTone, { bg: string; fg: string; border: string }> = {
  success: { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
  warning: { bg: '#FFFBEB', fg: '#B45309', border: '#FDE68A' },
  danger: { bg: '#FEF2F2', fg: '#B91C1C', border: '#FECACA' },
  info: { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
  neutral: { bg: '#F8FAFC', fg: '#475569', border: '#E2E8F0' },
  purple: { bg: '#FAF5FF', fg: '#6D28D9', border: '#E9D5FF' },
};

/** Colored pill for entity statuses across admin modules. */
export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  label,
  tone = 'neutral',
}) => {
  const colors = TONE_STYLES[tone] ?? TONE_STYLES.neutral;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
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
      return 'warning';
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'IN_PROGRESS':
      return 'info';
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
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
