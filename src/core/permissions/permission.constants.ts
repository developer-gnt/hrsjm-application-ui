/**
 * Permission keys — the full backend catalog (HRSJM-back-api migrations,
 * `permissions` table; 53 keys). These strings MUST match the backend
 * exactly; they are the contract for `can('key')` checks and route guards.
 */
export const PermissionKeys = {
  // Users
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_MANAGE_STATUS: 'user.manage_status',

  // Roles & permissions (RBAC)
  ROLE_READ: 'role.read',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_ASSIGN: 'role.assign',
  PERMISSION_READ: 'permission.read',

  // Membership categories
  MEMBERSHIP_CATEGORY_READ: 'membership_category.read',
  MEMBERSHIP_CATEGORY_CREATE: 'membership_category.create',
  MEMBERSHIP_CATEGORY_UPDATE: 'membership_category.update',
  MEMBERSHIP_CATEGORY_MANAGE_STATUS: 'membership_category.manage_status',

  // Membership
  MEMBERSHIP_READ: 'membership.read',
  MEMBERSHIP_CREATE: 'membership.create',
  MEMBERSHIP_UPDATE: 'membership.update',
  MEMBERSHIP_MANAGE_STATUS: 'membership.manage_status',
  MEMBERSHIP_APPROVE: 'membership.approve',

  // Assistance requests & support (Arshad's modules)
  ASSISTANCE_REVIEW: 'assistance.review',
  SUPPORT_MANAGE: 'support.manage',

  // Payments
  PAYMENT_READ: 'payment.read',
  PAYMENT_CREATE: 'payment.create',
  PAYMENT_VERIFY: 'payment.verify',
  PAYMENT_MANAGE_STATUS: 'payment.manage_status',

  // Accounting engine
  ACCOUNT_READ: 'account.read',
  ACCOUNT_CREATE: 'account.create',
  ACCOUNT_UPDATE: 'account.update',
  ACCOUNT_MANAGE_STATUS: 'account.manage_status',
  ACCOUNTING_ENTRY_READ: 'accounting_entry.read',
  ACCOUNTING_ENTRY_REVERSE: 'accounting_entry.reverse',
  LEDGER_READ: 'ledger.read',

  // Donations (Sahil's module)
  DONATION_READ: 'donation.read',
  DONATION_CREATE: 'donation.create',
  DONATION_MANAGE: 'donation.manage',
  DONATION_REFUND: 'donation.refund',

  // Expense vouchers
  EXPENSE_READ: 'expense.read',
  EXPENSE_CREATE: 'expense.create',
  EXPENSE_UPDATE: 'expense.update',
  EXPENSE_MANAGE_STATUS: 'expense.manage_status',

  // Receipt vouchers
  RECEIPT_ENTRY_READ: 'receipt_entry.read',
  RECEIPT_ENTRY_CREATE: 'receipt_entry.create',
  RECEIPT_ENTRY_UPDATE: 'receipt_entry.update',
  RECEIPT_ENTRY_MANAGE_STATUS: 'receipt_entry.manage_status',

  // Financial reports
  REPORT_READ: 'report.read',
  TRIAL_BALANCE_READ: 'trial_balance.read',
  PROFIT_LOSS_READ: 'profit_loss.read',
  BALANCE_SHEET_READ: 'balance_sheet.read',

  // Notifications
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_CREATE: 'notification.create',
  NOTIFICATION_MANAGE: 'notification.manage',

  // Renewals
  RENEWAL_READ: 'renewal.read',
  RENEWAL_CREATE: 'renewal.create',
  RENEWAL_MANAGE: 'renewal.manage',
} as const;

export type PermissionKey = (typeof PermissionKeys)[keyof typeof PermissionKeys];

export const ALL_PERMISSION_KEYS: PermissionKey[] =
  Object.values(PermissionKeys);

/** Permission groups by backend module (for the Phase 8 catalog UI). */
export const PermissionGroups = {
  users: ['user.read', 'user.update', 'user.manage_status'],
  rbac: [
    'role.read',
    'role.create',
    'role.update',
    'role.delete',
    'role.assign',
    'permission.read',
  ],
  membership_category: [
    'membership_category.read',
    'membership_category.create',
    'membership_category.update',
    'membership_category.manage_status',
  ],
  membership: [
    'membership.read',
    'membership.create',
    'membership.update',
    'membership.manage_status',
    'membership.approve',
  ],
  assistance_support: ['assistance.review', 'support.manage'],
  payment: [
    'payment.read',
    'payment.create',
    'payment.verify',
    'payment.manage_status',
  ],
  accounting: [
    'account.read',
    'account.create',
    'account.update',
    'account.manage_status',
    'accounting_entry.read',
    'accounting_entry.reverse',
    'ledger.read',
  ],
  donation: [
    'donation.read',
    'donation.create',
    'donation.manage',
    'donation.refund',
  ],
  expense: [
    'expense.read',
    'expense.create',
    'expense.update',
    'expense.manage_status',
  ],
  receipt_entry: [
    'receipt_entry.read',
    'receipt_entry.create',
    'receipt_entry.update',
    'receipt_entry.manage_status',
  ],
  reports: [
    'report.read',
    'trial_balance.read',
    'profit_loss.read',
    'balance_sheet.read',
  ],
  notification: [
    'notification.read',
    'notification.create',
    'notification.manage',
  ],
  renewal: ['renewal.read', 'renewal.create', 'renewal.manage'],
} as const;