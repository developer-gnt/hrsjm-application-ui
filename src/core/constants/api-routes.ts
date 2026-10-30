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
    CHANGE_PASSWORD: '/auth/change-password',
    CHECK_DUPLICATES: '/auth/check-duplicates',
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
    RESET_PASSWORD: (id: string | number) => `/memberships/${id}/reset-password`,
  },

  // Renewals
  RENEWALS: {
    ADMIN_LIST: '/admin/renewals',
    QUOTE: '/renewals/quote',
    MEMBERSHIP_QUOTE: (id: string | number) => `/renewals/quote/${id}`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    MEMBERS: '/admin/members',
  },

  // Assistance Requests
  ASSISTANCE_REQUESTS: '/assistance-requests',

  // Notifications
  NOTIFICATIONS: {
    ME: '/notifications/me',
    UNREAD_COUNT: '/notifications/me/unread-count',
    READ_ALL: '/notifications/me/read-all',
    MARK_READ: (recipientId: string) => `/notifications/recipients/${recipientId}/read`,
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
    MY: '/receipts/my',
    ITEM: (id: string | number) => `/receipts/${id}`,
    BASE: '/receipt-entries',
    STATS: '/receipt-entries/stats',
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
    PASSBOOK_EXPORT: '/passbook/export',
  },

  // Passbook
  PASSBOOK: {
    EXPORT: '/passbook/export',
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

  // Rights
  RIGHTS: {
    BASE: '/rights',
    DETAILS: (id: string | number) => `/rights/${id}`,
    VIEWS: (id: string | number) => `/rights/${id}/views`,
  },
} as const;
