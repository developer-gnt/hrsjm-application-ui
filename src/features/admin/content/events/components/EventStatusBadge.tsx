import React from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { AdminColors } from '../../../../../core/theme';
import { AppBadge } from '../../../../../core/components';
import type { EventUiStatus } from '../types/events.types';

/**
 * UI-only status -> label/color mapping (spec section 25).
 * When the backend status enum is confirmed, map backendStatus -> EventUiStatus
 * here and keep this component as the single place rendering status colors.
 */
const STATUS_META: Record<EventUiStatus, { label: string; bg: string; text: string }> = {
  UPCOMING: {
    label: 'Upcoming',
    bg: AdminColors.statusExpiringLight,
    text: AdminColors.statusExpiring,
  },
  COMPLETED: {
    label: 'Completed',
    bg: AdminColors.statusActiveLight,
    text: AdminColors.statusActive,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: AdminColors.statusInactiveLight,
    text: AdminColors.statusInactive,
  },
  DRAFT: {
    label: 'Draft',
    bg: AdminColors.statusPendingLight,
    text: AdminColors.statusPending,
  },
};

interface EventStatusBadgeProps {
  status: EventUiStatus;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, style, textStyle: labelStyle }) => {
  const meta = STATUS_META[status];

  return (
    <AppBadge
      label={meta.label}
      customBg={meta.bg}
      customTextColor={meta.text}
      style={style}
      textStyle={labelStyle ? { ...styles.label, ...labelStyle } : styles.label}
    />
  );
};

const styles = StyleSheet.create({
  // AppBadge uppercases by default; the reference design uses title case.
  label: {
    textTransform: 'none',
  },
});