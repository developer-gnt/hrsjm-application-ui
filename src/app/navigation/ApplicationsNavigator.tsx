import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import {
  AssistanceRequestsScreen,
  AssistanceDetailsScreen,
  AssistanceDocumentsScreen,
  CreateSeekerScreen,
} from '../../features/admin/assistance';
import {
  MembershipApplicationsScreen,
  MembershipApplicationDetailsScreen,
} from '../../features/admin/membershipApplications';

export type ApplicationsStackParamList = {
  [AppRoutes.MEMBERSHIP_APPLICATIONS]: undefined;
  [AppRoutes.MEMBERSHIP_APPLICATION_DETAILS]: { applicationId: string };
  [AppRoutes.ASSISTANCE_REQUESTS]: undefined;
  [AppRoutes.CREATE_ASSISTANCE_REQUEST]: undefined;
  [AppRoutes.ADD_SEEKER]: undefined;
  [AppRoutes.ASSISTANCE_DETAILS]: { requestId: string };
  [AppRoutes.ASSISTANCE_DOCUMENTS]: { requestId: string; seekerName?: string };
};

const Stack = createNativeStackNavigator<ApplicationsStackParamList>();

/**
 * Admin Applications Tab Navigator:
 * Connects the Membership Applications review list and details as primary screens,
 * while maintaining backward-compatible routes for assistance requests.
 */
export const ApplicationsNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName={AppRoutes.MEMBERSHIP_APPLICATIONS}
    screenOptions={{ headerShown: false }}
  >
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
    <Stack.Screen
      name={AppRoutes.ASSISTANCE_REQUESTS}
      component={AssistanceRequestsScreen}
    />
    <Stack.Screen
      name={AppRoutes.CREATE_ASSISTANCE_REQUEST}
      component={CreateSeekerScreen}
    />
    <Stack.Screen
      name={AppRoutes.ADD_SEEKER}
      component={CreateSeekerScreen}
    />
    <Stack.Screen
      name={AppRoutes.ASSISTANCE_DETAILS}
      component={AssistanceDetailsScreen as any}
    />
    <Stack.Screen
      name={AppRoutes.ASSISTANCE_DOCUMENTS}
      component={AssistanceDocumentsScreen as any}
    />
  </Stack.Navigator>
);

export default ApplicationsNavigator;
