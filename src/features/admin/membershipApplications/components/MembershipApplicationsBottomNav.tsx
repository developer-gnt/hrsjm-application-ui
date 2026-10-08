import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

interface MembershipApplicationsBottomNavProps {
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
  { key: 'complaints', label: 'Complaints', icon: '💬' },
  { key: 'more', label: 'More', icon: '▦' },
];

export const MembershipApplicationsBottomNav: React.FC<MembershipApplicationsBottomNavProps> = ({
  bottomInset,
  activeKey = 'applications',
  onTabPress,
}) => {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, Spacing.xs) }]}>
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
            {active ? (
              <View style={styles.activeContainer}>
                <View style={styles.activeIconContainer}>
                  <Text style={styles.activeIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.activeLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ) : (
              <View style={styles.inactiveContainer}>
                <Text style={styles.inactiveIcon}>{item.icon}</Text>
                <Text style={styles.inactiveLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            )}
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
    paddingTop: 8,
    paddingHorizontal: 4,
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
  },
  activeContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
  },
  activeIconContainer: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    fontSize: 18,
    color: '#D97706',
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 1,
  },
  inactiveContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  inactiveIcon: {
    fontSize: 18,
    color: '#64748B',
  },
  inactiveLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
});
