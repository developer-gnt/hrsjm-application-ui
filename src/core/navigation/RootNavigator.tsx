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
import DonationHistoryScreen from '../../features/donations/screens/DonationHistoryScreen';
import DonationDetailScreen from '../../features/donations/screens/DonationDetailScreen';
import ReceiptDetailScreen from '../../features/receipts/screens/ReceiptDetailScreen';
import ReceiptPdfPreviewScreen from '../../features/receipts/screens/ReceiptPdfPreviewScreen';
import ReceiptsListScreen from '../../features/receipts/screens/ReceiptsListScreen';
import { MembershipProvider } from '../../features/membership/context/MembershipContext';
import MembershipLandingScreen from '../../features/membership/screens/MembershipLandingScreen';
import MembershipIntroScreen from '../../features/membership/screens/MembershipIntroScreen';
import MembershipStep1Screen from '../../features/membership/screens/MembershipStep1Screen';
import MembershipStep2Screen from '../../features/membership/screens/MembershipStep2Screen';
import MembershipStep3Screen from '../../features/membership/screens/MembershipStep3Screen';
import MembershipSubmittedScreen from '../../features/membership/screens/MembershipSubmittedScreen';
import MyApplicationScreen from '../../features/membership/screens/MyApplicationScreen';
import ApplicationDetailsScreen from '../../features/membership/screens/ApplicationDetailsScreen';
import ApplicationApprovedScreen from '../../features/membership/screens/ApplicationApprovedScreen';
import ApplicationRejectedScreen from '../../features/membership/screens/ApplicationRejectedScreen';
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

// Bottom tabs per the approved design: Dashboard, Members, Applications,
// Donations, Complaints, More.
function AdminTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <AdminBottomTabs {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="DashboardTab" component={ModulePlaceholderScreen} />
      <Tabs.Screen name="MembersTab" component={MembershipStep1Screen} />
      <Tabs.Screen name="ApplicationsTab" component={ModulePlaceholderScreen} />
      <Tabs.Screen name="DonationSeekersTab" component={DonationHistoryScreen} />
      <Tabs.Screen name="ComplaintsTab" component={SupportTicketsScreen} />
      <Tabs.Screen name="MoreTab" component={ProfileSettingsScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <MembershipProvider>
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="Tabs" component={AdminTabs} />
        <AppStack.Screen name="DonationDetail" component={DonationDetailScreen} />
        <AppStack.Screen name="ReceiptsList" component={ReceiptsListScreen} />
        <AppStack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} />
        <AppStack.Screen name="ReceiptPdfPreview" component={ReceiptPdfPreviewScreen} />
        <AppStack.Screen name="AssistanceDetails" component={AssistanceDetailsScreen} />
        <AppStack.Screen name="AssistanceDocuments" component={AssistanceDocumentsScreen} />
        <AppStack.Screen name="TicketDetails" component={TicketDetailsScreen} />
        <AppStack.Screen name="TicketChat" component={TicketChatScreen} />
        <AppStack.Screen name="Notifications" component={NotificationsScreen} />
        {/* Membership Journey Routes */}
        <AppStack.Screen name="MembershipIntro" component={MembershipIntroScreen} />
        <AppStack.Screen name="MembershipStep1Personal" component={MembershipStep1Screen} />
        <AppStack.Screen name="MembershipStep2Address" component={MembershipStep2Screen} />
        <AppStack.Screen name="MembershipStep3Documents" component={MembershipStep3Screen} />
        <AppStack.Screen name="MembershipSubmitted" component={MembershipSubmittedScreen} />
        <AppStack.Screen name="MyApplication" component={MyApplicationScreen} />
        <AppStack.Screen name="ApplicationDetails" component={ApplicationDetailsScreen} />
        <AppStack.Screen name="ApplicationApproved" component={ApplicationApprovedScreen} />
        <AppStack.Screen name="ApplicationRejected" component={ApplicationRejectedScreen} />
      </AppStack.Navigator>
    </MembershipProvider>
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
