export const ApiRoutes = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Donations
  DONATIONS: {
    BASE: '/donations',
  },

  // Dashboard
  DASHBOARD: {
    USERS: '/users',
    MEMBERSHIPS: '/memberships',
    RECEIPTS: '/receipts',
  },

  // Payments
  PAYMENTS: {
    MEMBERSHIP_PAYMENTS: '/membership-payments',
    VERIFY: (id: string | number) => `/membership-payments/${id}/verify`,
  },

  // Expenses & Receipts
  EXPENSES: {
    BASE: '/expense-entries',
    DETAILS: (id: string | number) => `/expense-entries/${id}`,
  },
  RECEIPTS: {
    BASE: '/receipt-entries',
    DETAILS: (id: string | number) => `/receipt-entries/${id}`,
  },

  // Accounting Engine
  ACCOUNTING: {
    ACCOUNTS: '/accounts',
    LEDGER: '/accounting/ledger',
    ACCOUNT_LEDGER: (id: string | number) => `/accounts/${id}/ledger`,
    ENTRIES: '/accounting/entries',
    REVERSE_ENTRY: (id: string | number) => `/accounting/entries/${id}/reverse`,
  },

  // Financial Reports
  REPORTS: {
    TRIAL_BALANCE: '/reports/trial-balance',
    PROFIT_LOSS: '/reports/profit-loss',
    BALANCE_SHEET: '/reports/balance-sheet',
  },

  // RBAC
  RBAC: {
    ROLES: '/roles',
    ROLE_DETAILS: (id: string | number) => `/roles/${id}`,
    PERMISSIONS: '/permissions',
    USER_ROLES: (id: string | number) => `/users/${id}/roles`,
  },
} as const;
