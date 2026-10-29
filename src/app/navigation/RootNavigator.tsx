import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../../features/auth/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AuthenticatedHomeScreen } from './AuthenticatedHomeScreen';
import { AdminTabNavigator } from './AdminTabNavigator';
import { UserTabNavigator } from '../../features/user/navigation/UserTabNavigator';
import { MemberTabNavigator } from '../../features/member';
import { SeekerTabNavigator } from '../../features/seeker';
import { HomeStackParamList } from './NavigationTypes';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const RoleBasedHomeNavigator: React.FC<{ roleType: 'member' | 'user' | 'seeker' | 'default' }> = ({
  roleType,
}) => {
  if (roleType === 'member') {
    return <MemberTabNavigator />;
  }
  if (roleType === 'user') {
    return <UserTabNavigator />;
  }
  if (roleType === 'seeker') {
    return <SeekerTabNavigator />;
  }

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="AuthenticatedHome"
        component={AuthenticatedHomeScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

/**
 * Root routing driven by the auth store status & roles:
 * - unauthenticated/idle → Auth stack (splash decides the first route)
 * - authenticated + ADMIN / SUPER_ADMIN → AdminTabNavigator (5 tabs + sidebar)
 * - authenticated + MEMBER → Member Portal (MemberTabNavigator)
 * - authenticated + USER / GENERAL_USER → User Portal (UserTabNavigator)
 * - authenticated + SEEKER / DONATION_SEEKER → Donation Seeker Portal (SeekerTabNavigator)
 * - authenticated + other → General Authenticated Home
 */
export const RootNavigator: React.FC = () => {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);

  const roleNames = (user?.roles ?? []).map(r => r.name.toUpperCase());
  const isAdmin = roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN');
  const isMemberRole =
    roleNames.includes('MEMBER') ||
    (user as any)?.account_type === 'member' ||
    user?.membership_status === 'ACTIVE' ||
    user?.membership_status === 'APPROVED';
  const isSeekerRole =
    roleNames.includes('SEEKER') ||
    roleNames.includes('DONATION_SEEKER') ||
    (user as any)?.account_type === 'seeker';

  // Approved/Active members get the full MemberTabNavigator.
  // Anyone with the MEMBER role, account_type === 'member', or approved membership status
  // routes to the Member Portal (MemberTabNavigator) unless explicitly inactive/rejected/suspended.
  const isMemberApproved =
    isMemberRole &&
    user?.status?.toUpperCase() !== 'INACTIVE' &&
    user?.status?.toUpperCase() !== 'BLOCKED' &&
    user?.membership_status !== 'REJECTED' &&
    user?.membership_status !== 'SUSPENDED';

  // Approved seekers get SeekerTabNavigator; pending seekers route to UserTabNavigator.
  const isSeekerApproved =
    isSeekerRole &&
    (user?.assistance_status === 'APPROVED' || user?.status?.toUpperCase() === 'ACTIVE');

  let activeRoleType: 'member' | 'user' | 'seeker' | 'default' = 'user';
  if (isMemberApproved) {
    activeRoleType = 'member';
  } else if (isSeekerApproved) {
    activeRoleType = 'seeker';
  } else {
    // Both General Users and pending Donation Seekers open User dashboard
    activeRoleType = 'user';
  }

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
