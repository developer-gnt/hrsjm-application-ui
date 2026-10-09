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
import { MemberEventsContainer } from '../screens/MemberEventsContainer';
import { DonationsScreen } from '../../admin/donations/screens/DonationsScreen';
import { ProfileScreen } from '../../admin/profile/screens/ProfileScreen';
import {
  MembershipDetailsScreen,
  RenewMembershipScreen,
} from '../../membership';
import {
  House,
  Heart,
  Calendar,
  FileText,
  User,
  AppIconComponent,
} from '../../../core/components/icons';

const Tab = createBottomTabNavigator();

interface MemberTabItem {
  name: string;
  label: string;
  Icon: AppIconComponent;
  component: React.ComponentType<any>;
}

const MEMBER_TABS: MemberTabItem[] = [
  {
    name: 'MemberHome',
    label: 'Home',
    Icon: House,
    component: MemberHomeScreen,
  },
  {
    name: 'MemberCauses',
    label: 'Causes',
    Icon: Heart,
    component: MemberCausesContainer,
  },
  {
    name: 'MemberEvents',
    label: 'Events',
    Icon: Calendar,
    component: MemberEventsContainer,
  },
  {
    name: 'MemberReceipts',
    label: 'Receipts',
    Icon: FileText,
    component: DonationsScreen,
  },
  {
    name: 'MemberProfile',
    label: 'Profile',
    Icon: User,
    component: ProfileScreen,
  },
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
        const { name, label, Icon } = tabDef;

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

        const iconColor = isFocused ? '#D97706' : '#1B3F8F';

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
            <View style={styles.iconBox}>
              <Icon size={22} color={iconColor} />
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
      <Tab.Screen
        name="MembershipDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MembershipDetailsScreen
            onBack={navigation.goBack}
            onRenewPress={() => navigation.navigate('RenewMembership')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="RenewMembership"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <RenewMembershipScreen
            onBack={navigation.goBack}
            onProfilePress={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '700',
    color: '#D97706',
  },
  tabLabelInactive: {
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
    color: '#1B3F8F',
  },
});
