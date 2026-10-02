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
  [AppRoutes.ADMIN_MEMBERS_TAB]: undefined;
  [AppRoutes.ADMIN_APPLICATIONS_TAB]: undefined;
  [AppRoutes.ADMIN_COMPLAINTS_TAB]: undefined;
  [AppRoutes.ADMIN_MORE_TAB]: undefined;
};

/**
 * Stack behind the More tab — the hub for financial, accounting and system
 * modules (Mubasshir's modules) plus shared module placeholders. Detail
 * routes gain id params in their implementing phases (5+).
 */
export type MoreStackParamList = {
  MoreMenu: undefined;
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
  [AppRoutes.GENERAL_LEDGER]: undefined;
  [AppRoutes.JOURNAL_ENTRIES]: undefined;
  [AppRoutes.REPORTS]: undefined;
  [AppRoutes.TRIAL_BALANCE]: undefined;
  [AppRoutes.PROFIT_LOSS]: undefined;
  [AppRoutes.BALANCE_SHEET]: undefined;
  [AppRoutes.DONATIONS]: undefined;
  [AppRoutes.ROLES_PERMISSIONS]: undefined;
  [AppRoutes.SETTINGS]: undefined;
  [AppRoutes.EVENTS]: undefined;
  [AppRoutes.EVENT_DETAILS]: { event: any };
  [AppRoutes.CREATE_EVENT]: undefined;
};

/** Placeholder stack for non-admin authenticated users until their role
 * navigators are built (BRD_Member/Donor/Seeker — other developers). */
export type HomeStackParamList = {
  AuthenticatedHome: undefined;
};