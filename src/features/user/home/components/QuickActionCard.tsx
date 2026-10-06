import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { HomeQuickAction } from '../types/home.types';

interface QuickActionCardProps {
  action: HomeQuickAction;
  onPress?: () => void;
}

/**
 * Single quick-action tile from the reference: light warm card with a navy
 * line icon, or the navy emphasized treatment used by "Join HRSJM" on the
 * guest home.
 */
export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  onPress,
}) => {
  const emphasized = action.emphasized === true;

  return (
    <TouchableOpacity
      style={[styles.card, emphasized ? styles.cardEmphasized : styles.cardLight]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={action.label}
    >
      <AppIcon
        name={action.icon}
        size={24}
        strokeWidth={1.7}
        color={emphasized ? AdminColors.textOnDark : AdminColors.primaryDark}
      />
      <Text style={[styles.label, emphasized && styles.labelEmphasized]}>
        {action.label}
      </Text>
    </TouchableOpacity>
  );
};

interface QuickActionsRowProps {
  actions: HomeQuickAction[];
  onPressAction?: (action: HomeQuickAction) => void;
}

/** Four-across responsive row of quick actions (reference layout). */
export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  actions,
  onPressAction,
}) => (
  <View style={styles.row}>
    {actions.map(action => (
      <QuickActionCard
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
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg + 2,
    minHeight: 96,
  },
  cardLight: {
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  cardEmphasized: {
    backgroundColor: AdminColors.primaryDark,
  },
  label: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  labelEmphasized: {
    color: AdminColors.textOnDark,
  },
});
