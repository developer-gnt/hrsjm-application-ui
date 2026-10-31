import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import {
  House,
  Users,
  FileText,
  Briefcase,
  HelpCircle,
  type AppIconComponent,
} from '../../../core/components/icons';

export interface NavItem {
  key: string;
  label: string;
  Icon: AppIconComponent;
}

export const SUPPORT_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: House },
  { key: 'members', label: 'Members', Icon: Users },
  { key: 'applications', label: 'Applications', Icon: FileText },
  { key: 'donations', label: 'Donations', Icon: Briefcase },
  { key: 'support', label: 'Support', Icon: HelpCircle },
];

interface SupportBottomNavProps {
  bottomInset: number;
  activeKey?: string;
  onTabPress?: (key: string) => void;
}

export const SupportBottomNav: React.FC<SupportBottomNavProps> = ({
  bottomInset,
  activeKey = 'support',
  onTabPress,
}) => {
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(bottomInset, Spacing.xs) },
      ]}
    >
      {SUPPORT_NAV_ITEMS.map(item => {
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
              <item.Icon
                size={20}
                color={active ? AdminColors.primary : AdminColors.textSecondary}
                strokeWidth={2}
              />
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
  },
  iconContainer: {
    width: 36,
    height: 32,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#FFF8E6',
  },
  icon: {
    fontSize: 18,
    color: '#64748B',
  },
  iconActive: {
    fontSize: 19,
    color: '#D97706',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  labelActive: {
    color: '#D97706',
    fontWeight: '700',
  },
});
