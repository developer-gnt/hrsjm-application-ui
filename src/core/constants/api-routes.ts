export const ApiRoutes = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Users
  USERS: {
    ME_PERMISSIONS: '/users/me/permissions',
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

  // Memberships
  MEMBERSHIPS: {
    BASE: '/memberships',
    STATS: '/memberships/stats',
    DETAILS: (id: string | number) => `/memberships/${id}`,
    STATUS: (id: string | number) => `/memberships/${id}/status`,
    DOCUMENTS: (id: string | number) => `/memberships/${id}/documents`,
    PAYMENT_HISTORY: (id: string | number) => `/memberships/${id}/payment-history`,
    RENEWAL_HISTORY: (id: string | number) => `/memberships/${id}/renewal-history`,
    CATEGORIES: '/membership-categories',
    ID_CARD: (id: string | number) => `/membership-id/memberships/${id}/card`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    MEMBERS: '/memberships',
  },

  // Assistance Requests
  ASSISTANCE_REQUESTS: '/assistance-requests',

  // Notifications
  NOTIFICATIONS: {
    ME: '/notifications/me',
  },

  // Payments
  PAYMENTS: {
    MEMBERSHIP_PAYMENTS: '/membership-payments',
    DETAILS: (id: string | number) => `/membership-payments/${id}`,
    VERIFY: (id: string | number) => `/membership-payments/${id}/verify`,
    STATUS: (id: string | number) => `/membership-payments/${id}/status`,
    RECEIPT: (id: string | number) => `/membership-payments/${id}/receipt`,
  },

  // Expenses & Receipts
  EXPENSES: {
    BASE: '/expense-entries',
    DETAILS: (id: string | number) => `/expense-entries/${id}`,
    STATUS: (id: string | number) => `/expense-entries/${id}/status`,
  },
  RECEIPTS: {
    BASE: '/receipt-entries',
    DETAILS: (id: string | number) => `/receipt-entries/${id}`,
    STATUS: (id: string | number) => `/receipt-entries/${id}/status`,
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

  // Events
  EVENTS: {
    BASE: '/events',
    DETAILS: (id: string | number) => `/events/${id}`,
  },

  // News
  NEWS: {
    BASE: '/news',
    DETAILS: (id: string | number) => `/news/${id}`,
    VIEWS: (id: string | number) => `/news/${id}/views`,
  },

  // Blogs
  BLOGS: {
    BASE: '/blogs',
    DETAILS: (id: string | number) => `/blogs/${id}`,
    VIEWS: (id: string | number) => `/blogs/${id}/views`,
  },
} as const;
