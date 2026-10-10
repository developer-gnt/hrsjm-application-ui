import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { ContactAction } from '../types/contact.types';

interface ContactActionCardProps {
  action: ContactAction;
  onPress?: () => void;
}

/**
 * Reference-locked contact quick-action card: warm off-white surface,
 * pale-gold circular icon backdrop (accentGold tint — no new colors), navy
 * line icon and left-aligned title/description. Four cards share one row.
 */
export const ContactActionCard: React.FC<ContactActionCardProps> = ({
  action,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={`${action.title} — ${action.description}`}
  >
    <View style={styles.iconCircle}>
      <View style={styles.iconCircleTint} />
      <AppIcon name={action.icon} size={18} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.title}>{action.title}</Text>
    <Text style={styles.description}>{action.description}</Text>
  </TouchableOpacity>
);

interface ContactActionsRowProps {
  actions: ContactAction[];
  onPressAction?: (action: ContactAction) => void;
}

/** Four-across responsive row (reference layout, no carousel). */
export const ContactActionsRow: React.FC<ContactActionsRowProps> = ({
  actions,
  onPressAction,
}) => (
  <View style={styles.row}>
    {actions.map(action => (
      <ContactActionCard
        key={action.id}
        action={action}
        onPress={() => onPressAction?.(action)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: BorderRadius.lg + 2,
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pale-gold backdrop as a sibling tint layer so the icon keeps full opacity.
  iconCircleTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 19,
    backgroundColor: AdminColors.accentGold,
    opacity: 0.16,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: Spacing.sm,
  },
  description: {
    fontSize: 9.5,
    lineHeight: 13,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
});
