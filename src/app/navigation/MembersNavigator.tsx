import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import { MembersScreen } from '../../features/admin/members/screens/MembersScreen';
import {
  MembershipApplicationsScreen,
  MembershipApplicationDetailsScreen,
} from '../../features/admin/membershipApplications';
import { MembersStackParamList } from './NavigationTypes';

const Stack = createNativeStackNavigator<MembersStackParamList>();

/**
 * Members tab navigator:
 * Connects the Member Directory (MembersScreen), Membership Applications list,
 * and Application Details review within the Members tab stack.
 */
export const MembersNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName={AppRoutes.MEMBERS_DIRECTORY}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen
      name={AppRoutes.MEMBERS_DIRECTORY}
      component={MembersScreen}
    />
    <Stack.Screen
      name={AppRoutes.MEMBERSHIP_APPLICATIONS}
      component={MembershipApplicationsScreen}
    />
    <Stack.Screen
      name={AppRoutes.MEMBERSHIP_APPLICATION_DETAILS}
      component={MembershipApplicationDetailsScreen as any}
    />
  </Stack.Navigator>
);

export default MembersNavigator;
