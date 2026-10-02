import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  BottomTabBarProps,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PermissionKeys } from '../../core/permissions/permission.constants';
import { useCanAny } from '../../core/permissions/can';
import { usePermissionStore } from '../../core/permissions/permission.store';
import { AppRoutes } from '../../core/constants/routes';
import { MoreNavigator } from './MoreNavigator';
import { ModulePlaceholderScreen } from './ModulePlaceholderScreen';
import { AdminDashboardScreen } from '../../features/admin/dashboard';
import { AdminTabParamList } from './NavigationTypes';

/**
 * ============================================================================
 * ADMIN NAVIGATION BAR (Bottom Tab Navigator)
 * ============================================================================
 *
 * This is the primary bottom navigation bar for the HRSJM Admin App.
 *
 * 5 CORE TABS:
 * 1. 🏠 Dashboard     -> Main KPIs, statistics, growth charts, recent activity.
 * 2. 👥 Members       -> Member directory, renewals, ID cards, approvals.
 * 3. 📄 Applications  -> Legal aid & financial assistance request reviews.
 * 4. 💬 Complaints    -> Public grievances, ticket tracking, resolution.
 * 5. ⚙️ Settings      -> Platform settings, organization profile, security, config.
 */

const Tab = createBottomTabNavigator<AdminTabParamList>();

const MembersPlaceholderScreen: React.FC = () => (
  <ModulePlaceholderScreen
    title="Members"
    icon="👥"
    owner="Aman"
    description="Member directory, memberships and approvals"
  />
);

const ApplicationsPlaceholderScreen: React.FC = () => (
  <ModulePlaceholderScreen
    title="Applications"
    icon="📄"
    owner="Arshad"
    description="Assistance request review workflow"
  />
);

const ComplaintsPlaceholderScreen: React.FC = () => (
  <ModulePlaceholderScreen
    title="Complaints"
    icon="💬"
    owner="Arshad"
    description="Support ticket management"
  />
);

export interface TabDefinition {
  name: keyof AdminTabParamList;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

export const TAB_DEFINITIONS: TabDefinition[] = [
  {
    name: AppRoutes.ADMIN_DASHBOARD_TAB,
    label: 'Dashboard',
    icon: '🏠',
    component: AdminDashboardScreen,
  },
  {
    name: AppRoutes.ADMIN_MEMBERS_TAB,
    label: 'Members',
    icon: '👥',
    component: MembersPlaceholderScreen,
  },
  {
    name: AppRoutes.ADMIN_APPLICATIONS_TAB,
    label: 'Applications',
    icon: '📄',
    component: ApplicationsPlaceholderScreen,
  },
  {
    name: AppRoutes.ADMIN_COMPLAINTS_TAB,
    label: 'Complaints',
    icon: '💬',
    component: ComplaintsPlaceholderScreen,
  },
  {
    name: AppRoutes.ADMIN_MORE_TAB,
    label: 'Settings',
    icon: '⚙️',
    component: MoreNavigator,
  },
];

const TAB_PERMISSIONS: Partial<Record<keyof AdminTabParamList, string[]>> = {
  [AppRoutes.ADMIN_MEMBERS_TAB]: [PermissionKeys.MEMBERSHIP_READ],
  [AppRoutes.ADMIN_APPLICATIONS_TAB]: [PermissionKeys.ASSISTANCE_REVIEW],
  [AppRoutes.ADMIN_COMPLAINTS_TAB]: [PermissionKeys.SUPPORT_MANAGE],
};

/**
 * Custom Tab Bar component that guarantees:
 * - Equal 20% width per tab (`flex: 1`).
 * - Perfectly centered icon and label.
 * - Active tab highlighted with a pastel yellow pill (`#FEF3C7`) and amber text (`#D97706`).
 * - Zero overlapping, clipping or text collision on all screen sizes.
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 4) },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabDef = TAB_DEFINITIONS.find(t => t.name === route.name);
        if (!tabDef) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tabDef.label}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={[styles.tabPill, isFocused && styles.tabPillActive]}>
              <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                {tabDef.icon}
              </Text>
              <Text
                style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {tabDef.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const AdminNavigationBar: React.FC = () => {
  usePermissionStore(state => state.isLoaded);
  const membersVisible = useCanAny(
    TAB_PERMISSIONS[AppRoutes.ADMIN_MEMBERS_TAB] ?? [],
  );
  const applicationsVisible = useCanAny(
    TAB_PERMISSIONS[AppRoutes.ADMIN_APPLICATIONS_TAB] ?? [],
  );
  const complaintsVisible = useCanAny(
    TAB_PERMISSIONS[AppRoutes.ADMIN_COMPLAINTS_TAB] ?? [],
  );

  const tabVisibility: Partial<Record<keyof AdminTabParamList, boolean>> = {
    [AppRoutes.ADMIN_MEMBERS_TAB]: membersVisible,
    [AppRoutes.ADMIN_APPLICATIONS_TAB]: applicationsVisible,
    [AppRoutes.ADMIN_COMPLAINTS_TAB]: complaintsVisible,
  };

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TAB_DEFINITIONS.map(tab => {
        if (tabVisibility[tab.name] === false) {
          return null;
        }
        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
          />
        );
      })}
    </Tab.Navigator>
  );
};

// Also export as AdminTabNavigator for backwards compatibility
export const AdminTabNavigator = AdminNavigationBar;

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
    paddingTop: 6,
    height: 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    minWidth: 58,
  },
  tabPillActive: {
    backgroundColor: '#FEF3C7',
  },
  tabIcon: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 2,
  },
  tabIconActive: {
    color: '#D97706',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#D97706',
    fontWeight: '800',
  },
});

export default AdminNavigationBar;
