import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { useAuthStore } from '../../features/auth/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AuthenticatedHomeScreen } from './AuthenticatedHomeScreen';
import { AdminTabNavigator } from './AdminTabNavigator';
import { HomeStackParamList } from './NavigationTypes';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const NonAdminNavigator: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="AuthenticatedHome"
      component={AuthenticatedHomeScreen}
      options={{ headerShown: false }}
    />
  </HomeStack.Navigator>
);

/**
 * Root routing driven by the auth store status:
 * - unauthenticated/idle → Auth stack (splash decides the first route)
 * - authenticated + ADMIN role → AdminTabNavigator (5 tabs)
 * - authenticated, other roles → placeholder home until the role-specific
 *   navigators (member/donor/seeker) are built by the team.
 *
 * Role-based *navigator* selection is routing, not authorization — all
 * action-level gating uses the dynamic `can()` engine (rule.md §3).
 */
export const RootNavigator: React.FC = () => {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);
  const isAdmin = (user?.roles ?? []).some(role => role.name === 'ADMIN');

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {status === 'authenticated' ? (
        isAdmin ? (
          <AdminTabNavigator />
        ) : (
          <NonAdminNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;