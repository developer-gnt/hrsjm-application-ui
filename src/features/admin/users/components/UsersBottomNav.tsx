import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
}

export const USERS_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'members', label: 'Members', icon: '👥' },
  { key: 'applications', label: 'Applications', icon: '📄' },
  { key: 'donations', label: 'Donations', icon: '💼' },
  { key: 'rights_info', label: 'Rights', icon: '📖' },
  { key: 'rights_legal', label: 'Rights', icon: '⚖️' },
  { key: 'users', label: 'Users', icon: '👤' },
  { key: 'more', label: 'More', icon: '▦' },
];

interface UsersBottomNavProps {
  bottomInset: number;
  activeKey?: string;
  onTabPress?: (key: string) => void;
}

export const UsersBottomNav: React.FC<UsersBottomNavProps> = ({
  bottomInset,
  activeKey = 'users',
  onTabPress,
}) => {
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(bottomInset, Spacing.xs) },
      ]}
    >
      {USERS_NAV_ITEMS.map(item => {
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
              style={[
                styles.iconContainer,
                active && styles.iconContainerActive,
              ]}
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: Spacing.sm,
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  iconContainer: {
    width: 32,
    height: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#FFF8E6',
  },
  icon: {
    fontSize: 16,
    color: '#64748B',
  },
  iconActive: {
    fontSize: 17,
    color: '#D97706',
  },
  label: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  labelActive: {
    color: '#D97706',
    fontWeight: '700',
  },
});
