import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberHomeScreen } from '../screens/MemberHomeScreen';
import { MemberCausesContainer } from '../screens/MemberCausesContainer';
import { ProfileScreen } from '../../admin/profile/screens/ProfileScreen';
import { DonationsScreen } from '../../admin/donations/screens/DonationsScreen';

const Tab = createBottomTabNavigator();

const MEMBER_TABS = [
  { name: 'MemberHome', label: 'Home', icon: '🏠', component: MemberHomeScreen },
  { name: 'MemberCauses', label: 'Causes', icon: '💛', component: MemberCausesContainer },
  { name: 'MemberReceipts', label: 'Receipts', icon: '📥', component: DonationsScreen },
  { name: 'MemberProfile', label: 'Profile', icon: '👤', component: ProfileScreen },
];

const MemberCustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 6) },
      ]}
      accessibilityRole="tablist"
    >
      {MEMBER_TABS.map((tabDef, index) => {
        const isFocused = state.index === index;
        const { name, label, icon } = tabDef;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key || name,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index]?.name || name);
          }
        };

        return (
          <TouchableOpacity
            key={name}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
            style={styles.tabItem}
          >
            <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
              <Text style={styles.tabIcon}>{icon}</Text>
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MemberTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="MemberCauses"
      tabBar={props => <MemberCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {MEMBER_TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 50,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 16,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: '#FFF8E6',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    lineHeight: 14,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#C9A227',
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#94A3B8',
  },
});
