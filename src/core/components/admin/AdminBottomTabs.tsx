import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacing } from '../../theme/theme';
import { Icon, type IconName } from '../common/Icon';

interface TabItem {
  key: string;
  label: string;
  icon: IconName;
}

// Tab layout per the approved design: six items, active tab in gold with a
// soft gold highlight behind the icon.
const TAB_ITEMS: TabItem[] = [
  { key: 'DashboardTab', label: 'Dashboard', icon: 'home' },
  { key: 'MembersTab', label: 'Members', icon: 'users' },
  { key: 'ApplicationsTab', label: 'Applications', icon: 'file-text' },
  { key: 'DonationSeekersTab', label: 'Donations', icon: 'heart' },
  { key: 'ComplaintsTab', label: 'Complaints', icon: 'message-circle' },
  { key: 'MoreTab', label: 'More', icon: 'grid' },
];

const ACTIVE_COLOR = '#F0A12F';
const INACTIVE_COLOR = colors.textPrimary;

export function AdminBottomTabs({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TAB_ITEMS.map((item, index) => {
        const active = state.index === index;
        const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
        };
        return (
          <TouchableOpacity
            key={item.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={styles.tab}>
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Icon
                name={item.icon}
                size={22}
                color={color}
                strokeWidth={active && item.icon === 'heart' ? 2.4 : 1.9}
              />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.goldSoft,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    ...Platform.select({ android: { fontFamily: 'sans-serif-medium' } }),
  },
});

export default AdminBottomTabs;
