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
import { MembersScreen } from '../../features/admin/members/screens/MembersScreen';
import { AssistanceRequestsScreen } from '../../features/admin/assistance';
import { ComplaintsNavigator } from './ComplaintsNavigator';
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
    component: AssistanceRequestsScreen,
  },
  {
    name: AppRoutes.ADMIN_COMPLAINTS_TAB,
    label: 'Complaints',
    Icon: MessageSquare,
    icon: '💬',
    component: ComplaintsNavigator,
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
        { paddingBottom: Math.max(insets.bottom, Spacing.xs) },
      ]}
      accessibilityRole="tablist"
    >
      {TAB_DEFINITIONS.map(tabDef => {
        const route = state.routes.find(r => r.name === tabDef.name);
        if (!route) return null;
        const index = state.routes.indexOf(route);
        const isFocused = state.index === index;
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
          <TouchableOpacity
            key={tabDef.name}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
            testID={`bottom-nav-${tabDef.name}`}
            style={styles.tabItem}
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
              ellipsizeMode="tail"
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const AdminNavigationBar: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TAB_DEFINITIONS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
};

// Also export as AdminTabNavigator for backwards compatibility
export const AdminTabNavigator = AdminNavigationBar;

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.surface,
    borderTopColor: BrandColors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 50,
  },
  iconPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: BorderRadius.lg,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: BrandColors.goldSoft,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: NAV_LABEL_SIZE,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: BrandColors.goldDark,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: BrandColors.textMuted,
  },
});

export default AdminNavigationBar;
