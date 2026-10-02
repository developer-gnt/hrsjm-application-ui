export const AppRoutes = {
  // Root Stacks
  SPLASH: 'Splash',
  AUTH: 'AuthStack',
  ADMIN_APP: 'AdminAppStack',

  // Auth Screens
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',

  // Admin Bottom Tabs
  ADMIN_DASHBOARD_TAB: 'AdminDashboardTab',
  ADMIN_MEMBERS_TAB: 'AdminMembersTab',
  ADMIN_APPLICATIONS_TAB: 'AdminApplicationsTab',
  ADMIN_COMPLAINTS_TAB: 'AdminComplaintsTab',
  ADMIN_MORE_TAB: 'AdminMoreTab',

  // Admin More / Financial Sub-routes
  MORE_MENU: 'MoreMenu',
  PAYMENT_VERIFICATION: 'PaymentVerification',
  PAYMENT_DETAILS: 'PaymentDetails',
  EXPENSE_VOUCHERS: 'ExpenseVouchers',
  CREATE_EXPENSE_VOUCHER: 'CreateExpenseVoucher',
  EXPENSE_DETAILS: 'ExpenseDetails',
  RECEIPT_VOUCHERS: 'ReceiptVouchers',
  CREATE_RECEIPT_VOUCHER: 'CreateReceiptVoucher',
  RECEIPT_DETAILS: 'ReceiptDetails',
  ACCOUNTING: 'Accounting',
  CHART_OF_ACCOUNTS: 'ChartOfAccounts',
  GENERAL_LEDGER: 'GeneralLedger',
  JOURNAL_ENTRIES: 'JournalEntries',
  REPORTS: 'Reports',
  TRIAL_BALANCE: 'TrialBalance',
  PROFIT_LOSS: 'ProfitLoss',
  BALANCE_SHEET: 'BalanceSheet',
  DONATIONS: 'Donations',
  ROLES_PERMISSIONS: 'RolesPermissions',
  SETTINGS: 'Settings',
  EVENTS: 'Events',
  EVENT_DETAILS: 'EventDetails',
  CREATE_EVENT: 'CreateEvent',
} as const;
