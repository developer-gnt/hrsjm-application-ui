import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import {
  SupportTicketsScreen,
  TicketDetailsScreen,
  TicketChatScreen,
} from '../../features/admin/support';

export type ComplaintsStackParamList = {
  [AppRoutes.SUPPORT_TICKETS]: undefined;
  [AppRoutes.TICKET_DETAILS]: { ticketId: string };
  [AppRoutes.TICKET_CHAT]: { ticketId: string; subject?: string };
};

const Stack = createNativeStackNavigator<ComplaintsStackParamList>();

export const ComplaintsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name={AppRoutes.SUPPORT_TICKETS}
      component={SupportTicketsScreen}
    />
    <Stack.Screen
      name={AppRoutes.TICKET_DETAILS}
      component={TicketDetailsScreen as any}
    />
    <Stack.Screen
      name={AppRoutes.TICKET_CHAT}
      component={TicketChatScreen as any}
    />
  </Stack.Navigator>
);

export default ComplaintsNavigator;
