import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../../theme/theme';

interface AppBadgeProps {
  label: string;
  bg: string;
  fg: string;
}

export function AppBadge({ label, bg, fg }: AppBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]} accessibilityLabel={label}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.round,
  },
  text: {
    ...typography.badge,
  },
});

export default AppBadge;
