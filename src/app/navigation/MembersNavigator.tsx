import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import { MembersScreen } from '../../features/admin/members/screens/MembersScreen';
import { AddMemberScreen } from '../../features/admin/members/screens/AddMemberScreen';
import {
  MembershipApplicationsScreen,
  MembershipApplicationDetailsScreen,
} from '../../features/admin/membershipApplications';
import { MembershipCategoriesScreen } from '../../features/membership/screens/MembershipCategoriesScreen';
import { MembershipStep1Screen } from '../../features/membership/screens/MembershipStep1Screen';
import { MembershipStep2Screen } from '../../features/membership/screens/MembershipStep2Screen';
import { MembershipStep3Screen } from '../../features/membership/screens/MembershipStep3Screen';
import { MembershipSubmittedScreen } from '../../features/membership/screens/MembershipSubmittedScreen';

const Stack = createNativeStackNavigator<any>();

/**
 * Members tab navigator:
 * Connects the Member Directory (MembersScreen), Membership Applications list,
 * Application Details review, and Add Member full multi-step registration flow.
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
      name={AppRoutes.ADD_MEMBER}
      component={AddMemberScreen}
    />
    <Stack.Screen
      name={AppRoutes.MEMBERSHIP_APPLICATIONS}
      component={MembershipApplicationsScreen}
    />
    <Stack.Screen name={AppRoutes.MEMBERSHIP_APPLICATION_DETAILS}>
      {({ route, navigation }) => (
        <MembershipApplicationDetailsScreen
          applicationId={(route.params as any)?.applicationId || (route.params as any)?.id || ''}
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Membership Flow for Add Member */}
    <Stack.Screen
      name="MembershipCategories"
      options={{ headerShown: false }}
    >
      {({ navigation }: any) => (
        <MembershipCategoriesScreen
          onBack={navigation.goBack}
          onApplyPost={(post) => {
            navigation.navigate('MembershipStep1Personal', { post });
          }}
        />
      )}
    </Stack.Screen>
    <Stack.Screen
      name="MembershipStep1Personal"
      component={MembershipStep1Screen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipStep2Address"
      component={MembershipStep2Screen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipStep3Documents"
      component={MembershipStep3Screen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipSubmitted"
      component={MembershipSubmittedScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default MembersNavigator;
