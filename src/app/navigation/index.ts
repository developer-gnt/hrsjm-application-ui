/**
 * ============================================================================
 * HRSJM APP NAVIGATION BARREL EXPORTS
 * ============================================================================
 * 
 * Modular shell and navigation components organized for developers and employees:
 * 
 * 1. AdminHeader          -> Top bar (Logo/Title, Side drawer trigger, Notifications, Profile)
 * 2. AdminSidebar         -> Slide-in Drawer menu (Grouped links, Quick actions, Sign Out)
 * 3. AdminNavigationBar   -> Bottom Tab Bar (Dashboard, Members, Applications, Complaints, Settings)
 * 4. AdminSettingsScreen  -> Platform Settings screen (6 modular configuration sections)
 */

export { AdminHeader, DashboardHeader } from './AdminHeader';
export type { AdminHeaderProps } from './AdminHeader';

export { AdminSidebar, AdminSidebar as AdminSideDrawer, MENU_GROUPS } from './AdminSidebar';
export type { AdminSidebarProps, AdminSidebarProps as AdminSideDrawerProps, DrawerMenuItem } from './AdminSidebar';

export { AdminNavigationBar, AdminTabNavigator, TAB_DEFINITIONS } from './AdminNavigationBar';
export type { TabDefinition } from './AdminNavigationBar';

export { AdminSettingsScreen, MoreMenuScreen, SETTING_SECTIONS } from './AdminSettingsScreen';
export type { SettingItem, SettingSection, AdminSettingsScreenProps } from './AdminSettingsScreen';

export { MoreNavigator } from './MoreNavigator';
export { RootNavigator } from './RootNavigator';
export { AuthNavigator } from './AuthNavigator';
export { ModulePlaceholderScreen } from './ModulePlaceholderScreen';
export * from './NavigationTypes';
