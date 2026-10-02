import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import {
  AdminColors,
  Typography,
  Spacing,
  BorderRadius,
} from '../../../../core';

interface DonationsBottomNavProps {
  bottomInset: number;
  activeKey?: string;
  onTabPress?: (key: string) => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'members', label: 'Members', icon: '👥' },
  { key: 'applications', label: 'Applications', icon: '📄' },
  { key: 'donation_seekers', label: 'Donation Seekers', icon: '🤲' },
  { key: 'donations', label: 'Donations', icon: '💼' },
  { key: 'more', label: 'More', icon: '▦' },
];

/**
 * UI-phase admin bottom navigation with Donations active (gold
 * treatment per the approved reference).
 */
export const DonationsBottomNav: React.FC<DonationsBottomNavProps> = ({
  bottomInset,
  activeKey = 'donations',
  onTabPress,
}) => {
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: bottomInset + Spacing.xs },
      ]}
    >
      {NAV_ITEMS.map(item => {
        const active = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => onTabPress?.(item.key)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
          >
            <View
              style={[styles.iconContainer, active && styles.iconContainerActive]}
            >
              <Text style={[styles.icon, active && styles.iconActive]}>
                {item.icon}
              </Text>
            </View>
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
    paddingTop: Spacing.sm,
    paddingHorizontal: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: AdminColors.accentGoldLight,
  },
  icon: {
    fontSize: 18,
  },
  iconActive: {
    fontSize: 19,
  },
  label: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  labelActive: {
    color: AdminColors.accentGold,
    fontWeight: '700',
  },
});