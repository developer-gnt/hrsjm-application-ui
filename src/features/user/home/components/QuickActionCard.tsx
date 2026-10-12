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

  const label =
    action.id === 'join'
      ? 'Join\nHRSJM'
      : action.id === 'complaint'
        ? 'File a\nComplaint'
        : action.id === 'donate'
          ? 'Donate\nNow'
          : action.id === 'renew'
            ? 'Renew\nMembership'
            : action.label;

  return (
    <TouchableOpacity
      style={[styles.card, emphasized ? styles.cardEmphasized : styles.cardLight]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={action.label}
    >
      <View style={styles.iconContainer}>
        <AppIcon
          name={action.icon}
          size={22}
          strokeWidth={1.8}
          color={emphasized ? '#EAA532' : '#0B2F5B'}
        />
      </View>
      <Text style={[styles.label, emphasized && styles.labelEmphasized]}>
        {label}
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
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    minHeight: 84,
  },
  cardLight: {
    backgroundColor: '#FCFBF7',
    borderWidth: 1,
    borderColor: '#E8E4DA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardEmphasized: {
    backgroundColor: '#082245',
    borderWidth: 1,
    borderColor: '#082245',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#0B2F5B',
    textAlign: 'center',
    marginTop: 6,
  },
  labelEmphasized: {
    color: '#FFFFFF',
  },
});
