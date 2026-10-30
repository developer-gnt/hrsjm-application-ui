/**
 * Centralized API Endpoints registry for the HRSJM Mobile Application
 * Single source of truth for all API path definitions matching the backend contract
 */
export const API_ENDPOINTS = {
  // Authentication & Identity
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User Management & Profile
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ROLES: (id: string) => `/users/${id}/roles`,
    PERMISSIONS: '/users/me/permissions',
  },

  // Super Admin & Admin Operations
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    MEMBERS: '/admin/members',
    MEMBER_360: (id: string) => `/admin/members/${id}/360`,
  },

  // Membership Module
  MEMBERSHIPS: {
    LIST: '/memberships',
    DETAIL: (id: string) => `/memberships/${id}`,
    APPLY: '/memberships/apply',
    MY: '/memberships/my',
    STATS: '/memberships/stats',
    CATEGORIES: '/membership-categories',
    CATEGORY_DETAIL: (id: string) => `/membership-categories/${id}`,
    DIGITAL_ID: (membershipNumber: string) => `/membership-id/${membershipNumber}`,
    VALIDATE_ID: (membershipNumber: string) => `/membership-id/${membershipNumber}/validate`,
    RENEW: (id: string) => `/memberships/${id}/renew`,
  },

  // Events & Community Activities
  EVENTS: {
    LIST: '/events',
    DETAIL: (id: string) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
    REGISTER: (id: string) => `/events/${id}/register`,
  },

  // News, Press & Announcements
  NEWS: {
    LIST: '/news',
    DETAIL: (id: string) => `/news/${id}`,
    CREATE: '/news',
    UPDATE: (id: string) => `/news/${id}`,
    DELETE: (id: string) => `/news/${id}`,
    VIEWS: (id: string) => `/news/${id}/views`,
  },

  // Rights & Legal Knowledgebase
  RIGHTS: {
    LIST: '/rights',
    DETAIL: (id: string) => `/rights/${id}`,
    CREATE: '/rights',
    UPDATE: (id: string) => `/rights/${id}`,
    DELETE: (id: string) => `/rights/${id}`,
  },

  // Donations & Causes
  DONATIONS: {
    LIST: '/donations',
    DETAIL: (id: string) => `/donations/${id}`,
    CREATE: '/donations',
    REFUND: (id: string) => `/donations/${id}/refund`,
  },

  // Support & Complaints Tickets
  SUPPORT: {
    TICKETS: '/support-tickets',
    TICKET_DETAIL: (id: string) => `/support-tickets/${id}`,
    STATS: '/support-tickets/stats/summary',
    MESSAGES: (ticketId: string) => `/support-tickets/${ticketId}/messages`,
  },

  // Assistance / Welfare Aid
  ASSISTANCE: {
    LIST: '/assistance-requests',
    DETAIL: (id: string) => `/assistance-requests/${id}`,
    CREATE: '/assistance-requests',
  },

  // Accounting & Financial Engine
  ACCOUNTING: {
    ACCOUNTS: '/accounts',
    LEDGER: '/accounting/ledger',
    ENTRIES: '/accounting/entries',
    REPORTS_TRIAL_BALANCE: '/reports/trial-balance',
    REPORTS_PROFIT_LOSS: '/reports/profit-loss',
    REPORTS_BALANCE_SHEET: '/reports/balance-sheet',
  },

  // System Settings
  CONTACT: '/contact',
  SETTINGS: {
    GENERAL: '/settings/general',
    ROLES: '/roles',
    PERMISSIONS: '/permissions',
  },

  // Payment Gateway Engine (Cashfree & Core Payment Pipelines)
  PAYMENTS: {
    CASHFREE_ORDERS: '/payments/cashfree/orders',
    CASHFREE_VERIFY: (orderId: string) => `/payments/cashfree/orders/${encodeURIComponent(orderId)}/verify`,
    DONATION_PAYMENTS: '/donation-payments',
    MEMBERSHIP_PAYMENTS: '/membership-payments',
    MOCK_ORDERS: '/mock-gateway/orders',
    MOCK_CHARGE: '/mock-gateway/charge',
  },
} as const;
