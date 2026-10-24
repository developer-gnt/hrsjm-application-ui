import { AppRoutes } from '../../core/constants/routes';

/**
 * Strongly typed route parameters. Extended in Phase 3 with the admin tab &
 * more stacks; route names come from AppRoutes (core/constants/routes.ts).
 */
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  RegisterIntro: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

/** Bottom tabs of the authenticated admin area (spec: 5 tabs). */
export type AdminTabParamList = {
  [AppRoutes.ADMIN_DASHBOARD_TAB]: undefined;
  [AppRoutes.ADMIN_MEMBERS_TAB]: undefined | { screen?: string; params?: any };
  [AppRoutes.ADMIN_APPLICATIONS_TAB]: undefined | { screen?: string; params?: any };
  [AppRoutes.ADMIN_COMPLAINTS_TAB]: undefined | { screen?: string; params?: any };
  [AppRoutes.ADMIN_MORE_TAB]: undefined | { screen?: string; params?: any };
};

/**
 * Stack behind the Members tab — includes the Member Directory,
 * Membership Applications list, and Application Details review.
 */
export type MembersStackParamList = {
  [AppRoutes.MEMBERS_DIRECTORY]: undefined;
  [AppRoutes.ADD_MEMBER]: undefined;
  [AppRoutes.MEMBERSHIP_APPLICATIONS]: undefined;
  [AppRoutes.MEMBERSHIP_APPLICATION_DETAILS]: { applicationId: string };
};

/**
 * Stack behind the More tab — the hub for financial, accounting and system
 * modules (Mubasshir's modules) plus shared module placeholders. Detail
 * routes gain id params in their implementing phases (5+).
 */
export type MoreStackParamList = {
  MoreMenu: undefined;
  [AppRoutes.MEMBERSHIP_APPLICATIONS]: undefined;
  [AppRoutes.MEMBERSHIP_APPLICATION_DETAILS]: { applicationId: string };
  [AppRoutes.PAYMENT_VERIFICATION]: undefined;
  [AppRoutes.PAYMENT_DETAILS]: { paymentId: string };
  [AppRoutes.EXPENSE_VOUCHERS]: undefined;
  [AppRoutes.CREATE_EXPENSE_VOUCHER]: undefined;
  [AppRoutes.EXPENSE_DETAILS]: { voucherId: string };
  [AppRoutes.RECEIPT_VOUCHERS]: undefined;
  [AppRoutes.CREATE_RECEIPT_VOUCHER]: undefined;
  [AppRoutes.RECEIPT_DETAILS]: { voucherId: string };
  [AppRoutes.ACCOUNTING]: undefined;
  [AppRoutes.CHART_OF_ACCOUNTS]: undefined;
  [AppRoutes.GENERAL_LEDGER]: { accountId?: string; accountName?: string; accountCode?: string | null } | undefined;
  [AppRoutes.JOURNAL_ENTRIES]: undefined;
  [AppRoutes.REPORTS]: undefined;
  [AppRoutes.TRIAL_BALANCE]: undefined;
  [AppRoutes.PROFIT_LOSS]: undefined;
  [AppRoutes.BALANCE_SHEET]: undefined;
  [AppRoutes.DONATIONS]: undefined;
  [AppRoutes.DONATION_RECEIPT_DETAILS]: { donationId: string };
  [AppRoutes.ROLES_PERMISSIONS]: undefined;
  [AppRoutes.SETTINGS]: undefined;
  [AppRoutes.EVENTS]: undefined;
  [AppRoutes.EVENT_DETAILS]: { event: any };
  [AppRoutes.CREATE_EVENT]: undefined;
  [AppRoutes.NEWS]: undefined;
  [AppRoutes.NEWS_DETAILS]: { news: any };
  [AppRoutes.CREATE_NEWS]: undefined;
  [AppRoutes.EDIT_NEWS]: { news: any };
  [AppRoutes.BLOGS]: undefined;
  [AppRoutes.BLOG_DETAILS]: { blog: any };
  [AppRoutes.CREATE_BLOG]: undefined;
  [AppRoutes.EDIT_BLOG]: { blog: any };
  [AppRoutes.ASSISTANCE_REQUESTS]: undefined;
  [AppRoutes.CREATE_ASSISTANCE_REQUEST]: undefined;
  [AppRoutes.ADD_SEEKER]: undefined;
  [AppRoutes.ASSISTANCE_DETAILS]: { requestId: string };
  [AppRoutes.ASSISTANCE_DOCUMENTS]: { requestId: string; seekerName?: string };
  [AppRoutes.SUPPORT_TICKETS]: undefined;
  [AppRoutes.TICKET_DETAILS]: { ticketId: string };
  [AppRoutes.TICKET_CHAT]: { ticketId: string; subject?: string };
  [AppRoutes.NOTIFICATIONS]: undefined;
  [AppRoutes.PROFILE_SETTINGS]: undefined;
  [AppRoutes.MY_PROFILE]: undefined;
  [AppRoutes.ADMIN_DETAILS]: undefined;
  [AppRoutes.EDIT_PERSONAL_INFO]: undefined;
  [AppRoutes.MY_ID_CARD]: undefined;
  [AppRoutes.ABOUT]: undefined;
  [AppRoutes.KNOW_YOUR_RIGHTS]: undefined;
  [AppRoutes.RIGHT_DETAILS]: { article?: any; rightId?: string };
  [AppRoutes.CREATE_RIGHT]: undefined;
  [AppRoutes.EDIT_RIGHT]: { article: any };
  [AppRoutes.MEMBERSHIP_DETAILS]: undefined;
  [AppRoutes.RENEW_MEMBERSHIP]: undefined;
};

/** Placeholder stack for non-admin authenticated users until their role
 * navigators are built (BRD_Member/Donor/Seeker — other developers). */
export type HomeStackParamList = {
  AuthenticatedHome: undefined;
};