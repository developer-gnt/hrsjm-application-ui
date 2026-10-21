import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import {
  AssistanceRequestsScreen,
  AssistanceDetailsScreen,
  AssistanceDocumentsScreen,
  CreateSeekerScreen,
} from '../../features/admin/assistance';

export type ApplicationsStackParamList = {
  [AppRoutes.ASSISTANCE_REQUESTS]: undefined;
  [AppRoutes.CREATE_ASSISTANCE_REQUEST]: undefined;
  [AppRoutes.ADD_SEEKER]: undefined;
  [AppRoutes.ASSISTANCE_DETAILS]: { requestId: string };
  [AppRoutes.ASSISTANCE_DOCUMENTS]: { requestId: string; seekerName?: string };
};

const Stack = createNativeStackNavigator<ApplicationsStackParamList>();

/**
 * Admin Applications Tab Navigator:
 * Connects the Assistance Requests list (AssistanceRequestsScreen),
 * the Add Seeker creation page (CreateSeekerScreen),
 * and the Details & Documents screens.
 */
export const ApplicationsNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName={AppRoutes.ASSISTANCE_REQUESTS}
    screenOptions={{ headerShown: false }}
  >
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
