import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

// Bottom tabs per the approved design: Dashboard, Members, Applications,
// Donation Seekers, Complaints, More.
export type TabsParamList = {
  DashboardTab: undefined;
  MembersTab: undefined;
  ApplicationsTab: undefined;
  DonationSeekersTab: undefined;
  ComplaintsTab: undefined;
  MoreTab: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList>;
  AssistanceDetails: { requestId: string };
  AssistanceDocuments: { requestId: string; seekerName: string };
  TicketDetails: { ticketId: string };
  TicketChat: { ticketId: string; subject: string };
  Notifications: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
