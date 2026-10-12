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
  DonationDetail: { donationId: string };
  ReceiptsList: undefined;
  ReceiptDetail: { receiptNo: string; fromScreen?: 'DonationHistory' | 'ReceiptsList' | 'DonationDetail' };
  ReceiptPdfPreview: { receiptNo: string; fromScreen?: 'DonationHistory' | 'ReceiptsList' | 'DonationDetail' };
  // Membership journey routes
  MembershipIntro: undefined;
  MembershipStep1Personal: undefined;
  MembershipStep2Address: undefined;
  MembershipStep3Documents: undefined;
  MembershipSubmitted: { applicationId: string };
  MyApplication: undefined;
  ApplicationDetails: { applicationId?: string };
  ApplicationApproved: { applicationId?: string };
  ApplicationRejected: { applicationId?: string };
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
