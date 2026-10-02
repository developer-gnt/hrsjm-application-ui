import React from 'react';
import {
  StyleSheet,
  Text,
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
import { MembersScreen } from '../../features/admin/members/screens/MembersScreen';
import { AdminTabParamList } from './NavigationTypes';
import {
  House,
  UsersRound,
  FileText,
  MessageSquare,
  LayoutGrid,
} from '../../core/components/icons';
import type { AppIconComponent } from '../../core/components/icons';
import { PressableScale } from '../../core/components/common/PressableScale';
import { BrandColors } from '../../core/theme/colors';
import { Spacing, BorderRadius } from '../../core/theme/spacing';

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
 * 5. ⊞ More           -> Platform settings, organization profile, security, config.
 */

const Tab = createBottomTabNavigator<AdminTabParamList>();

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
  Icon: AppIconComponent;
  icon?: string;
  component: React.ComponentType<any>;
}

export const TAB_DEFINITIONS: TabDefinition[] = [
  {
    name: AppRoutes.ADMIN_DASHBOARD_TAB,
    label: 'Dashboard',
    Icon: House,
    icon: '🏠',
    component: AdminDashboardScreen,
  },
  {
    name: AppRoutes.ADMIN_MEMBERS_TAB,
    label: 'Members',
    Icon: UsersRound,
    icon: '👥',
    component: MembersScreen,
  },
  {
    name: AppRoutes.ADMIN_APPLICATIONS_TAB,
    label: 'Applications',
    Icon: FileText,
    icon: '📄',
    component: ApplicationsPlaceholderScreen,
  },
  {
    name: AppRoutes.ADMIN_COMPLAINTS_TAB,
    label: 'Complaints',
    Icon: MessageSquare,
    icon: '💬',
    component: ComplaintsPlaceholderScreen,
  },
  {
    name: AppRoutes.ADMIN_MORE_TAB,
    label: 'More',
    Icon: LayoutGrid,
    icon: '⚙️',
    component: MoreNavigator,
  },
];

const TAB_PERMISSIONS: Partial<Record<keyof AdminTabParamList, string[]>> = {
  [AppRoutes.ADMIN_MEMBERS_TAB]: [PermissionKeys.MEMBERSHIP_READ],
  [AppRoutes.ADMIN_APPLICATIONS_TAB]: [PermissionKeys.ASSISTANCE_REVIEW],
  [AppRoutes.ADMIN_COMPLAINTS_TAB]: [PermissionKeys.SUPPORT_MANAGE],
};

const NAV_ICON_SIZE = 24;
const NAV_LABEL_SIZE = 11;

/**
 * Custom Tab Bar component:
 * - Equal 20% width per tab (`flex: 1`).
 * - Professional Lucide outline icons.
 * - Active tab highlighted with subtle gold pill (`BrandColors.goldSoft`) and dark gold accent.
 * - Interactive micro-animation with `PressableScale`.
 * - Safe-area aware on the bottom inset.
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabDef = TAB_DEFINITIONS.find(t => t.name === route.name);
        if (!tabDef) return null;

        const { Icon, label } = tabDef;

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

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PressableScale
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            scaleTo={0.94}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
            testID={`bottom-nav-${route.name}`}
            containerStyle={styles.tabItem}
            style={styles.tabItemInner}
          >
            <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
              <Icon
                size={NAV_ICON_SIZE}
                color={isFocused ? BrandColors.goldDark : BrandColors.textMuted}
                strokeWidth={isFocused ? 2.2 : 1.8}
              />
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
          </PressableScale>
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
    backgroundColor: BrandColors.surface,
    borderTopColor: BrandColors.border,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
  },
  tabItemInner: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    minHeight: 52,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: BorderRadius.lg,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: BrandColors.goldSoft,
  },
  tabLabel: {
    marginTop: 3,
    fontSize: NAV_LABEL_SIZE,
    fontWeight: '500',
    lineHeight: 14,
    maxWidth: '100%',
  },
  tabLabelActive: {
    color: BrandColors.goldDark,
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: BrandColors.textMuted,
  },
});

export default AdminNavigationBar;
