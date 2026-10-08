import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

interface GoldButtonProps {
  label: string;
  onPress?: () => void;
  textColor?: string;
  backgroundColor?: string;
  /** Smaller treatment used inside the hero banner (reference mockup). */
  compact?: boolean;
}

/**
 * Gold call-to-action button from the reference ("Join the Movement →",
 * "Make a Donation →").
 */
export const GoldButton: React.FC<GoldButtonProps> = ({
  label,
  onPress,
  compact = false,
  textColor = AdminColors.textOnDark,
  backgroundColor = AdminColors.accentGold,
}) => (
  <TouchableOpacity
    style={[styles.button, compact && styles.buttonCompact, { backgroundColor }]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={[styles.label, compact && styles.labelCompact, { color: textColor }]}>
      {label}
    </Text>
    <View style={styles.arrow}>
      <AppIcon
        name="arrow-right"
        size={compact ? 12 : 14}
        color={textColor}
      />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
  },
  buttonCompact: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: AdminColors.textOnDark,
  },
  labelCompact: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  arrow: {
    marginLeft: Spacing.sm,
  },
});
