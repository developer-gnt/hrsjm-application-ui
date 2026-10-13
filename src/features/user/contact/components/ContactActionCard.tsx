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
    <View style={styles.iconWrap}>
      <AppIcon name={action.icon} size={20} color={AdminColors.primaryDark} />
    </View>

    <Text style={styles.title}>{action.title}</Text>
    <Text style={styles.description}>{action.description}</Text>

    <View style={styles.arrowWrap}>
      <AppIcon name="arrow-right" size={11} color={AdminColors.accentGold} />
    </View>
  </TouchableOpacity>
);

interface ContactActionsRowProps {
  actions: ContactAction[];
  onPressAction?: (action: ContactAction) => void;
}

/** 2x2 responsive grid matching the Get Help cards */
export const ContactActionsRow: React.FC<ContactActionsRowProps> = ({
  actions,
  onPressAction,
}) => (
  <View style={styles.grid}>
    {actions.map(action => (
      <View key={action.id} style={styles.gridCard}>
        <ContactActionCard
          action={action}
          onPress={() => onPressAction?.(action)}
        />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  gridCard: {
    width: '48%',
  },
  card: {
    flex: 1,
    minHeight: 144,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    color: AdminColors.primaryDark,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
    flexShrink: 1,
  },
  arrowWrap: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
