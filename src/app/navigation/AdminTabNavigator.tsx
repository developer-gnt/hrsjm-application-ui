import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminColors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { PermissionKeys } from '../../core/permissions/permission.constants';
import { useCanAny } from '../../core/permissions/can';
import { usePermissionStore } from '../../core/permissions/permission.store';
import { AppRoutes } from '../../core/constants/routes';
import { MoreNavigator } from './MoreNavigator';
import { ModulePlaceholderScreen } from './ModulePlaceholderScreen';
import { AdminDashboardScreen } from '../../features/admin/dashboard';
import { AdminTabParamList } from './NavigationTypes';

const Tab = createBottomTabNavigator<AdminTabParamList>();

interface TabDefinition {
  name: keyof AdminTabParamList;
  label: string;
  icon: string;
  screen: React.ReactNode;
}

/**
 * The five admin tabs (spec §2/§46). Members/Applications/Complaints are
 * other developers' modules — placeholders stand in behind the same route
 * contracts. Dashboard and the More hub are always available.
 */
const TAB_DEFINITIONS: TabDefinition[] = [
  {
    name: AppRoutes.ADMIN_DASHBOARD_TAB,
    label: 'Dashboard',
    icon: '🏠',
    screen: null, // rendered with navigation below
  },
  {
    name: AppRoutes.ADMIN_MEMBERS_TAB,
    label: 'Members',
    icon: '👥',
    screen: (
      <ModulePlaceholderScreen
        title="Members"
        icon="👥"
        owner="Aman"
        description="Member directory, memberships and approvals"
      />
    ),
  },
  {
    name: AppRoutes.ADMIN_APPLICATIONS_TAB,
    label: 'Applications',
    icon: '📋',
    screen: (
      <ModulePlaceholderScreen
        title="Applications"
        icon="📋"
        owner="Arshad"
        description="Assistance request review workflow"
      />
    ),
  },
  {
    name: AppRoutes.ADMIN_COMPLAINTS_TAB,
    label: 'Complaints',
    icon: '🆘',
    screen: (
      <ModulePlaceholderScreen
        title="Complaints"
        icon="🆘"
        owner="Arshad"
        description="Support ticket management"
      />
    ),
  },
  {
    name: AppRoutes.ADMIN_MORE_TAB,
    label: 'More',
    icon: '☰',
    screen: <MoreNavigator />,
  },
];

/** Permission gate per gated tab; keys of ungated tabs stay absent. */
const TAB_PERMISSIONS: Partial<Record<keyof AdminTabParamList, string[]>> = {
  [AppRoutes.ADMIN_MEMBERS_TAB]: [PermissionKeys.MEMBERSHIP_READ],
  [AppRoutes.ADMIN_APPLICATIONS_TAB]: [PermissionKeys.ASSISTANCE_REVIEW],
  [AppRoutes.ADMIN_COMPLAINTS_TAB]: [PermissionKeys.SUPPORT_MANAGE],
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  tabIconInactive: {
    opacity: 0.75,
  },
});

const renderTabIcon = ({ focused, icon }: { focused: boolean; icon: string }) => (
  <Text style={[styles.tabIcon, !focused && styles.tabIconInactive]}>{icon}</Text>
);

export const AdminTabNavigator: React.FC = () => {
  // Hooks are called unconditionally with a stable count; each gated tab gets
  // its own reactive check so tabs appear/disappear with the permission set.
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AdminColors.navActive,
        tabBarInactiveTintColor: AdminColors.navInactive,
        tabBarLabelStyle: Typography.badge,
        tabBarStyle: {
          backgroundColor: AdminColors.navBg,
          borderTopColor: AdminColors.navBorder,
        },
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
            options={{
              tabBarLabel: tab.label,
              tabBarIcon: ({ focused }) => renderTabIcon({ focused, icon: tab.icon }),
            }}
          >
            {({ navigation: tabNavigation }: { navigation: BottomTabNavigationProp<AdminTabParamList, keyof AdminTabParamList> }) =>
              tab.name === AppRoutes.ADMIN_DASHBOARD_TAB ? (
                <AdminDashboardScreen navigation={tabNavigation} />
              ) : (
                tab.screen
              )
            }
          </Tab.Screen>
        );
      })}
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;