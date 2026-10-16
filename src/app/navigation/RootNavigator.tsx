import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { useAuthStore } from '../../features/auth/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AuthenticatedHomeScreen } from './AuthenticatedHomeScreen';
import { AdminTabNavigator } from './AdminTabNavigator';
import { MemberTabNavigator } from '../../features/member';
import { UserTabNavigator } from '../../features/user';
import { SeekerTabNavigator } from '../../features/seeker';
import { HomeStackParamList } from './NavigationTypes';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const RoleBasedHomeNavigator: React.FC<{ roleType: 'member' | 'user' | 'seeker' | 'default' }> = ({
  roleType,
}) => {
  if (roleType === 'member') {
    return <MemberTabNavigator />;
  }
  if (roleType === 'seeker') {
    return <SeekerTabNavigator />;
  }

  // Default and 'user' both route to UserTabNavigator (User Portal)
  return <UserTabNavigator />;
};

/**
 * Root routing driven by the auth store status & roles:
 * - unauthenticated/idle → Auth stack (splash decides the first route)
 * - authenticated + ADMIN / SUPER_ADMIN → AdminTabNavigator (5 tabs + sidebar)
 * - authenticated + MEMBER (without USER) → Member Portal
 * - authenticated + USER / GENERAL_USER → User Portal (UserTabNavigator)
 * - authenticated + SEEKER / DONATION_SEEKER → Donation Seeker Portal
 * - authenticated + other → User Portal (UserTabNavigator)
 */
export const RootNavigator: React.FC = () => {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);

  const roleNames = (user?.roles ?? []).map(r => r.name.toUpperCase());
  const isAdmin = roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN');
  const isMember = roleNames.includes('MEMBER') && !roleNames.includes('USER');
  const isUser = roleNames.includes('USER') || roleNames.includes('GENERAL_USER');
  const isSeeker = roleNames.includes('SEEKER') || roleNames.includes('DONATION_SEEKER');

  let activeRoleType: 'member' | 'user' | 'seeker' | 'default' = 'user';
  if (isMember) activeRoleType = 'member';
  else if (isSeeker) activeRoleType = 'seeker';
  else activeRoleType = 'user';

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