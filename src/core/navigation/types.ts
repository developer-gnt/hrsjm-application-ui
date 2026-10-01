import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type AdminStackParamList = {
  AssistanceRequests: undefined;
  AssistanceDetails: { requestId: string };
  AssistanceDocuments: { requestId: string; seekerName: string };
  SupportTickets: undefined;
  TicketDetails: { ticketId: string };
  TicketChat: { ticketId: string; subject: string };
  Notifications: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
