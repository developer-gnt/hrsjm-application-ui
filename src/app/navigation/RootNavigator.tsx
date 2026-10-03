import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { useAuthStore } from '../../features/auth/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AuthenticatedHomeScreen } from './AuthenticatedHomeScreen';
import { AdminTabNavigator } from './AdminTabNavigator';
import { MemberHomeScreen } from '../../features/member/screens/MemberHomeScreen';
import { SeekerHomeScreen } from '../../features/seeker/screens/SeekerHomeScreen';
import { DonorHomeScreen } from '../../features/donor/screens/DonorHomeScreen';
import { HomeStackParamList } from './NavigationTypes';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const RoleBasedHomeNavigator: React.FC<{ roleType: 'member' | 'seeker' | 'donor' | 'default' }> = ({
  roleType,
}) => {
  let Component = AuthenticatedHomeScreen;
  if (roleType === 'member') Component = MemberHomeScreen;
  else if (roleType === 'seeker') Component = SeekerHomeScreen;
  else if (roleType === 'donor') Component = DonorHomeScreen;

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="AuthenticatedHome"
        component={Component}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

/**
 * Root routing driven by the auth store status & roles:
 * - unauthenticated/idle → Auth stack (splash decides the first route)
 * - authenticated + ADMIN / SUPER_ADMIN → AdminTabNavigator (5 tabs + sidebar)
 * - authenticated + MEMBER → Member Portal
 * - authenticated + SEEKER / DONATION_SEEKER → Donation Seeker Portal
 * - authenticated + DONOR → Donor Portal
 * - authenticated + other → General Authenticated Home
 */
export const RootNavigator: React.FC = () => {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);

  const roleNames = (user?.roles ?? []).map(r => r.name.toUpperCase());
  const isAdmin = roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN');
  const isMember = roleNames.includes('MEMBER');
  const isSeeker = roleNames.includes('SEEKER') || roleNames.includes('DONATION_SEEKER');
  const isDonor = roleNames.includes('DONOR');

  let activeRoleType: 'member' | 'seeker' | 'donor' | 'default' = 'default';
  if (isMember) activeRoleType = 'member';
  else if (isSeeker) activeRoleType = 'seeker';
  else if (isDonor) activeRoleType = 'donor';

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {status === 'authenticated' ? (
        isAdmin ? (
          <AdminTabNavigator />
        ) : (
          <RoleBasedHomeNavigator roleType={activeRoleType} />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;