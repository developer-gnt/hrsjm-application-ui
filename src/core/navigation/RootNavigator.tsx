import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../auth/LoginScreen';
import AssistanceRequestsScreen from '../../features/admin/assistance/screens/AssistanceRequestsScreen';
import AssistanceDetailsScreen from '../../features/admin/assistance/screens/AssistanceDetailsScreen';
import AssistanceDocumentsScreen from '../../features/admin/assistance/screens/AssistanceDocumentsScreen';
import type {
  AdminStackParamList,
  AuthStackParamList,
} from './types';const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Screens render their own AppHeader so the shared design system stays in one place.
function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AssistanceRequests" component={AssistanceRequestsScreen} />
      <AdminStack.Screen name="AssistanceDetails" component={AssistanceDetailsScreen} />
      <AdminStack.Screen name="AssistanceDocuments" component={AssistanceDocumentsScreen} />
    </AdminStack.Navigator>
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
      {status === 'authenticated' ? <AdminNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default RootNavigator;
