import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../auth/LoginScreen';
import AdminBottomTabs from '../components/admin/AdminBottomTabs';
import ModulePlaceholderScreen from '../screens/ModulePlaceholderScreen';
import AssistanceRequestsScreen from '../../features/admin/assistance/screens/AssistanceRequestsScreen';
import AssistanceDetailsScreen from '../../features/admin/assistance/screens/AssistanceDetailsScreen';
import AssistanceDocumentsScreen from '../../features/admin/assistance/screens/AssistanceDocumentsScreen';
import SupportTicketsScreen from '../../features/admin/support/screens/SupportTicketsScreen';
import TicketDetailsScreen from '../../features/admin/support/screens/TicketDetailsScreen';
import TicketChatScreen from '../../features/admin/support/screens/TicketChatScreen';
import NotificationsScreen from '../../features/admin/notifications/screens/NotificationsScreen';
import ProfileSettingsScreen from '../../features/admin/settings/screens/ProfileSettingsScreen';
import type {
  AppStackParamList,
  AuthStackParamList,
  TabsParamList,
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Bottom tabs per the approved design. Dashboard, Members and Applications
// belong to modules scheduled for later phases - the tabs render a clearly
// labelled placeholder until those screens are built.
function AdminTabs() {
  return (
    <Tabs.Navigator
      tabBar={AdminBottomTabs}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="DashboardTab" component={ModulePlaceholderScreen} />
      <Tabs.Screen name="MembersTab" component={ModulePlaceholderScreen} />
      <Tabs.Screen name="ApplicationsTab" component={ModulePlaceholderScreen} />
      <Tabs.Screen name="DonationSeekersTab" component={AssistanceRequestsScreen} />
      <Tabs.Screen name="ComplaintsTab" component={SupportTicketsScreen} />
      <Tabs.Screen name="MoreTab" component={ProfileSettingsScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={AdminTabs} />
      <AppStack.Screen name="AssistanceDetails" component={AssistanceDetailsScreen} />
      <AppStack.Screen name="AssistanceDocuments" component={AssistanceDocumentsScreen} />
      <AppStack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      <AppStack.Screen name="TicketChat" component={TicketChatScreen} />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'restoring') {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default RootNavigator;
