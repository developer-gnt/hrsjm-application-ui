import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MemberStatus } from '../types';
import { StatusTones } from '../../../../core/theme/colors';

interface MemberStatusBadgeProps {
  status: MemberStatus;
}

const STATUS_META: Record<MemberStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Active', bg: StatusTones.success.bg, text: StatusTones.success.text },
  EXPIRING_SOON: {
    label: 'Expiring Soon',
    bg: StatusTones.warning.bg,
    text: StatusTones.warning.text,
  },
  INACTIVE: { label: 'Inactive', bg: StatusTones.danger.bg, text: StatusTones.danger.text },
};

/** Compact semantic status pill — soft tinted background, dark readable text. */
export const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({ status }) => {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }]} accessibilityLabel={`Status: ${meta.label}`}>
      <Text style={[styles.text, { color: meta.text }]} numberOfLines={1}>
        {meta.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default MemberStatusBadge;
