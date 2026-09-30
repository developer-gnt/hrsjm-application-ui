# HRSJM Admin Mobile App --- Mubasshir Development Specification

**Project:** HRSJM Digital Membership & Donation Platform\
**Platform:** React Native CLI --- Android + iOS\
**Language:** TypeScript\
**Backend:** `HRSJM-back-api` --- `/api/v1`\
**Role:** Mubasshir --- Lead / Architecture / Complex Modules /
Integration\
**BRD Version:** 1.0.0 --- September 2026

------------------------------------------------------------------------

# 1. Purpose of This Document

This document is the complete implementation specification for
**Mubasshir's work** on the HRSJM Admin React Native application.

Mubasshir owns:

1.  React Native project architecture
2.  Shared API infrastructure
3.  Authentication and token lifecycle
4.  Secure storage
5.  Admin authorization / RBAC integration
6.  Admin Dashboard
7.  Payment Verification & Management
8.  Expense Vouchers
9.  Receipt Vouchers
10. Accounting Ledger
11. Journal Entries
12. Financial Reports
13. Roles & Permissions Manager
14. Cross-module integration
15. Final integration, QA and release coordination

The Admin BRD defines the Admin as the platform super-user with 47
backend permissions. Admin accounts are provisioned manually and
permissions are resolved dynamically from the database rather than JWT
claims.

------------------------------------------------------------------------

# 2. Important Scope Rule

The current Admin BRD contains **40 screens**.

The supplied UI references additionally show:

-   Events
-   News
-   Blogs
-   Know Your Rights

These four content modules are **not included in the current 40-screen
Admin BRD**. They therefore remain outside Mubasshir's primary ownership
unless the team explicitly assigns them later.

The current Admin navigation defined by the BRD is:

``` text
Dashboard
Members
Applications
Complaints
More
```

Additional Admin modules should be reached through `More` or contextual
navigation.

------------------------------------------------------------------------

# 3. Mubasshir's Responsibility

## 3.1 Lead Responsibilities

Mubasshir is responsible for the parts of the application that can block
the other developers.

``` text
Mubasshir
│
├── Architecture
├── API Client
├── Authentication
├── Token Refresh
├── Secure Storage
├── Navigation Guard
├── RBAC / Permission Resolution
├── Dashboard
├── Payment Verification
├── Expense Vouchers
├── Receipt Vouchers
├── Accounting
├── Financial Reports
├── Roles & Permissions
├── Shared integration contracts
├── Code review
└── Final Android/iOS integration
```

------------------------------------------------------------------------

# 4. Technology Architecture

``` text
HRSJM/
│
├── android/
├── ios/
│
├── src/
│   ├── app/
│   ├── core/
│   ├── assets/
│   └── features/
│
├── App.tsx
├── index.js
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

The native folders are platform-specific:

``` text
android/   → Android
ios/       → iOS
```

The application logic remains shared:

``` text
src/       → Android + iOS
```

Do not create separate Android and iOS feature implementations unless a
genuine platform-specific requirement exists.

------------------------------------------------------------------------

# 5. Final Source Architecture

``` text
src/
│
├── app/
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── AdminTabNavigator.tsx
│   │   ├── MoreNavigator.tsx
│   │   └── NavigationTypes.ts
│   │
│   ├── providers/
│   │   └── AppProviders.tsx
│   │
│   └── config/
│       └── app.config.ts
│
├── core/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── api.types.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── refresh.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   └── api-error.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── admin/
│   │   ├── forms/
│   │   └── feedback/
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── routes.ts
│   │   ├── api-routes.ts
│   │   └── storage-keys.ts
│   │
│   ├── permissions/
│   │   ├── permission.constants.ts
│   │   ├── permission.service.ts
│   │   ├── permission.guard.ts
│   │   └── can.ts
│   │
│   ├── storage/
│   │   ├── secure-storage.ts
│   │   └── storage-keys.ts
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── theme.ts
│   │
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── logo/
│   └── fonts/
│
└── features/
    │
    ├── auth/                         ← MUBASSHIR
    │   ├── screens/
    │   ├── components/
    │   ├── services/
    │   ├── hooks/
    │   ├── store/
    │   └── types/
    │
    └── admin/
        │
        ├── dashboard/                ← MUBASSHIR
        ├── payments/                 ← MUBASSHIR
        ├── expenses/                 ← MUBASSHIR
        ├── receipts/                 ← MUBASSHIR
        ├── accounting/               ← MUBASSHIR
        ├── reports/                  ← MUBASSHIR
        └── rbac/                     ← MUBASSHIR
```

------------------------------------------------------------------------

# 6. Shared UI/UX Specification

All Mubasshir-owned screens must use the same Admin design system as the
rest of the team.

## 6.1 Visual Direction

``` text
Modern NGO / Enterprise Admin
Clean
Professional
Information dense
White cards
Deep navy branding
Soft status colors
Compact lists
Rounded controls
Minimal shadows
Strong typography hierarchy
```

------------------------------------------------------------------------

# 7. Design Tokens

## 7.1 Colors

``` typescript
export const AdminColors = {
  primary: '#1B3F8F',
  primaryDark: '#0F2860',
  primaryLight: '#EBF1FF',

  accentGold: '#C9A227',
  accentGoldLight: '#FFF8E6',

  statusActive: '#10B981',
  statusActiveLight: '#E8F7F0',

  statusExpiring: '#F59E0B',
  statusExpiringLight: '#FFF3E6',

  statusInactive: '#EF4444',
  statusInactiveLight: '#FFF0F0',

  statusPending: '#3B82F6',

  background: '#F5F7FA',
  cardSurface: '#FFFFFF',
  headerBg: '#1B3F8F',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',

  navActive: '#1B3F8F',
  navInactive: '#94A3B8',
  navBg: '#FFFFFF',
  navBorder: '#E2E8F0',

  border: '#E2E8F0',
  divider: '#F1F5F9',
};
```

------------------------------------------------------------------------

# 8. Typography

Use Inter/Poppins according to the project design system.

``` text
Screen Title:
22sp / Bold

Section Header:
17sp / SemiBold

Body:
14sp / Regular

Secondary:
12–13sp

Badge:
11sp / Medium

Button:
15sp / SemiBold

Metric:
20–24sp / Bold
```

------------------------------------------------------------------------

# 9. Standard Screen Layout

Every Admin screen should follow this structure:

``` text
┌──────────────────────────────────────┐
│ Status Bar                           │
├──────────────────────────────────────┤
│ ☰   HRSJM       🔔   👤             │
├──────────────────────────────────────┤
│                                      │
│ Screen Title              + Action   │
│ Subtitle                             │
│                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ Stat │ │ Stat │ │ Stat │ │ Stat │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ │
│                                      │
│ Search                      Filters  │
│                                      │
│ [All] [Pending] [Approved] [...]     │
│                                      │
│ Content List                         │
│                                      │
└──────────────────────────────────────┘
```

------------------------------------------------------------------------

# 10. Common Components Mubasshir Must Use

Do not create one-off versions of these.

``` text
AppHeader
AppButton
AppIconButton
AppInput
AppCard
AppBadge
AppAvatar
AppSearchBar
AppFilterButton
AppModal
AppBottomSheet
AppLoader
AppEmptyState
AppErrorState
AppProgressBar

AdminStatCard
AdminPageHeader
AdminSectionHeader
AdminStatusBadge
AdminFilterTabs
AdminFilterSheet
AdminActionMenu
AdminDataRow
AdminDataList
AdminDateFilter
AdminAmount
AdminPagination
ConfirmDialog
Toast
SkeletonCard
NetworkBanner
```

------------------------------------------------------------------------

# 11. Authentication Module

## Ownership

Mubasshir owns the entire authentication infrastructure.

## Screens

``` text
1. Splash
2. Onboarding
3. Login
4. Register
5. Forgot Password
6. Reset Password
```

Admin registration is disabled. Admin accounts are provisioned manually.

------------------------------------------------------------------------

## 11.1 Folder

``` text
src/features/auth/
│
├── screens/
│   ├── SplashScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   └── ResetPasswordScreen.tsx
│
├── components/
│   ├── AuthLogo.tsx
│   ├── LoginForm.tsx
│   ├── PasswordInput.tsx
│   └── BiometricButton.tsx
│
├── services/
│   └── auth.service.ts
│
├── hooks/
│   └── useAuth.ts
│
├── store/
│   └── authStore.ts
│
└── types/
    └── auth.types.ts
```

------------------------------------------------------------------------

# 12. Authentication API

``` text
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

The exact backend contract must be taken from the implemented backend.
Do not invent request/response fields in the mobile app.

------------------------------------------------------------------------

# 13. Authentication Flow

``` text
App Launch
    ↓
Splash
    ↓
Check stored credentials
    ↓
Refresh token if required
    ↓
GET /auth/me
    ↓
Check role
    ↓
ADMIN?
 ┌──┴──┐
Yes    No
 ↓      ↓
Admin   Appropriate
Navigator role navigator
```

------------------------------------------------------------------------

# 14. Token Strategy

Required behavior:

``` text
Access token
→ short-lived
→ memory/state where possible

Refresh token
→ secure storage

API request
→ Authorization: Bearer <accessToken>

401
→ refresh token

Refresh success
→ update access token
→ retry original request

Refresh failure
→ clear credentials
→ logout
→ AuthNavigator
```

Do not place long-lived secrets in normal AsyncStorage.

------------------------------------------------------------------------

# 15. API Client Architecture

## Folder

``` text
src/core/api/
│
├── client.ts
├── api.types.ts
├── api-error.ts
│
└── interceptors/
    ├── auth.interceptor.ts
    ├── refresh.interceptor.ts
    └── error.interceptor.ts
```

## Request flow

``` text
Screen
  ↓
Feature Hook
  ↓
Feature Service
  ↓
apiClient
  ↓
Interceptor
  ↓
Backend /api/v1
```

Screens must not directly call Axios/fetch.

------------------------------------------------------------------------

# 16. API Client Rules

Every feature service must:

-   Use the central API client
-   Never hardcode the base URL
-   Never duplicate auth headers
-   Never implement its own token refresh
-   Return typed responses
-   Normalize known API errors
-   Handle pagination consistently

Example:

``` typescript
export const getDashboard = async () => {
  return apiClient.get<DashboardResponse>('/dashboard');
};
```

------------------------------------------------------------------------

# 17. RBAC / Permission Architecture

The Admin has 47 backend permissions.

Permissions must be resolved dynamically from the backend.

Do not assume:

``` typescript
role === 'ADMIN'
```

means every UI action should automatically be visible.

Use:

``` typescript
can('payment.verify')
can('expense.create')
can('accounting_entry.reverse')
can('role.assign')
```

------------------------------------------------------------------------

# 18. Permission Folder

``` text
src/core/permissions/
│
├── permission.constants.ts
├── permission.service.ts
├── permission.guard.ts
└── can.ts
```

Example:

``` typescript
const canVerify = can('payment.verify');
```

UI:

``` tsx
{canVerify && (
  <AppButton title="Verify Payment" />
)}
```

Navigation should also respect permissions.

------------------------------------------------------------------------

# 19. Admin Dashboard

## Route

``` text
AdminDashboardScreen
```

## Folder

``` text
src/features/admin/dashboard/
│
├── screens/
│   └── AdminDashboardScreen.tsx
│
├── components/
│   ├── DashboardStats.tsx
│   ├── RevenueSummary.tsx
│   ├── PendingActions.tsx
│   ├── RecentActivity.tsx
│   └── ActivityItem.tsx
│
├── services/
│   └── dashboard.service.ts
│
├── hooks/
│   └── useDashboard.ts
│
└── types/
    └── dashboard.types.ts
```

------------------------------------------------------------------------

# 20. Dashboard UI

## Header

``` text
☰  HRSJM / Admin Panel     🔔  👤
```

## Statistics

``` text
Total Members
Active Members
Expiring Members
Inactive Members
```

## Revenue

``` text
Membership Income
Donation Income
Net Balance
```

## Pending Actions

``` text
Membership Approvals
Payment Verification
Assistance Requests
```

## Activity

``` text
Recent Activity
Last 10 actions
```

------------------------------------------------------------------------

# 21. Dashboard APIs

BRD-defined sources include:

``` text
GET /api/v1/users
GET /api/v1/memberships
GET /api/v1/receipts
```

Use the existing backend implementation to determine pagination and
aggregation behavior.

------------------------------------------------------------------------

# 22. Payment Verification Module

## Route

``` text
AdminPaymentVerificationScreen
```

## Folder

``` text
src/features/admin/payments/
│
├── screens/
│   ├── PaymentVerificationScreen.tsx
│   └── PaymentDetailsScreen.tsx
│
├── components/
│   ├── PaymentStats.tsx
│   ├── PaymentCard.tsx
│   ├── PaymentFilters.tsx
│   ├── PaymentStatusBadge.tsx
│   ├── VerifyPaymentModal.tsx
│   └── PaymentReceiptUpload.tsx
│
├── services/
│   └── payments.service.ts
│
├── hooks/
│   └── usePayments.ts
│
└── types/
    └── payments.types.ts
```

------------------------------------------------------------------------

# 23. Payment APIs

``` text
GET  /api/v1/membership-payments
POST /api/v1/membership-payments/:id/verify
```

Permissions:

``` text
payment.read
payment.verify
payment.manage_status
```

------------------------------------------------------------------------

# 24. Payment UI

``` text
Payment Verification

[Total] [Pending] [Verified] [Failed]

[Search................] [Filters]

[All] [Pending] [Verified] [Failed]

Payment
├── User
├── Payment ID
├── Type
├── Amount
├── Date
├── Status
└── Action
```

Verification flow:

``` text
Payment
   ↓
View details
   ↓
Verify
   ↓
Confirmation
   ↓
Backend verification
   ↓
Accounting journal
   ↓
Receipt generation
   ↓
Success
```

The backend must remain the authority for accounting side effects and
idempotency.

------------------------------------------------------------------------

# 25. Expense Vouchers

## Route

``` text
AdminExpenseVouchersScreen
```

## Folder

``` text
src/features/admin/expenses/
│
├── screens/
│   ├── ExpenseVouchersScreen.tsx
│   ├── ExpenseDetailsScreen.tsx
│   └── CreateExpenseVoucherScreen.tsx
│
├── components/
│   ├── ExpenseStats.tsx
│   ├── ExpenseVoucherCard.tsx
│   ├── ExpenseFilters.tsx
│   ├── ExpenseStatusBadge.tsx
│   └── CancelExpenseModal.tsx
│
├── services/
│   └── expenses.service.ts
│
├── hooks/
│   └── useExpenses.ts
│
└── types/
    └── expenses.types.ts
```

------------------------------------------------------------------------

# 26. Expense APIs

``` text
GET  /api/v1/expense-entries
POST /api/v1/expense-entries
```

Permissions:

``` text
expense.read
expense.create
expense.update
expense.manage_status
```

------------------------------------------------------------------------

# 27. Expense Voucher UI

List:

``` text
Expense Vouchers

[Search] [Filters]

Voucher
Expense Account
Amount
Bank/Cash
Date
Status
Action
```

Create:

``` text
Expense Account
Amount
Bank/Cash Account
Date
Narration

[Create Voucher]
```

BRD-defined accounting behavior:

``` text
Dr Expense Account
Cr Bank/Cash Account
```

Cancellation/void triggers an accounting reversal on the backend.

------------------------------------------------------------------------

# 28. Receipt Vouchers

This is **manual accounting receipt entry**, not the generated
donation/member receipt center.

## Folder

``` text
src/features/admin/receipts/
│
├── screens/
│   ├── ReceiptVouchersScreen.tsx
│   ├── ReceiptVoucherDetailsScreen.tsx
│   └── CreateReceiptVoucherScreen.tsx
│
├── components/
│   ├── ReceiptVoucherCard.tsx
│   ├── ReceiptVoucherFilters.tsx
│   ├── ReceiptVoucherStatusBadge.tsx
│   └── CancelReceiptVoucherModal.tsx
│
├── services/
│   └── receipt-vouchers.service.ts
│
├── hooks/
│   └── useReceiptVouchers.ts
│
└── types/
    └── receipt-vouchers.types.ts
```

------------------------------------------------------------------------

# 29. Receipt Voucher APIs

``` text
GET  /api/v1/receipt-entries
POST /api/v1/receipt-entries
```

Permissions:

``` text
receipt_entry.read
receipt_entry.create
receipt_entry.update
receipt_entry.manage_status
```

------------------------------------------------------------------------

# 30. Receipt Voucher Form

``` text
Income Account
Amount
Bank/Cash Account
Date
Reference
Narration

[Create Receipt]
```

Accounting behavior:

``` text
Dr Bank/Cash
Cr Income Account
```

Cancellation creates a mirrored reversal through the backend.

------------------------------------------------------------------------

# 31. Accounting Module

## Folder

``` text
src/features/admin/accounting/
│
├── screens/
│   ├── AccountingScreen.tsx
│   ├── ChartOfAccountsScreen.tsx
│   ├── GeneralLedgerScreen.tsx
│   └── JournalEntriesScreen.tsx
│
├── components/
│   ├── AccountTree.tsx
│   ├── AccountRow.tsx
│   ├── LedgerRow.tsx
│   ├── JournalEntryRow.tsx
│   ├── DebitCreditBadge.tsx
│   ├── LedgerFilters.tsx
│   └── ReverseEntryModal.tsx
│
├── services/
│   └── accounting.service.ts
│
├── hooks/
│   ├── useAccounts.ts
│   ├── useLedger.ts
│   └── useJournalEntries.ts
│
└── types/
    └── accounting.types.ts
```

------------------------------------------------------------------------

# 32. Accounting Navigation

``` text
Accounting
│
├── Chart of Accounts
├── General Ledger
└── Journal Entries
```

The BRD explicitly defines these three tabs.

------------------------------------------------------------------------

# 33. Accounting APIs

``` text
GET /api/v1/accounts
GET /api/v1/accounts/:id/ledger
GET /api/v1/accounting/ledger
GET /api/v1/accounting/entries
POST /api/v1/accounting/entries/:id/reverse
```

Permissions:

``` text
account.read
ledger.read
accounting_entry.read
accounting_entry.reverse
```

------------------------------------------------------------------------

# 34. Chart of Accounts UI

Use a tree:

``` text
Assets
├── Cash
├── Bank
└── Receivables

Liabilities
├── ...

Income
├── Membership Income
├── Donation Income
└── Other Income

Expenses
├── ...

Equity
└── ...
```

Do not hardcode the account tree. Render backend data.

------------------------------------------------------------------------

# 35. General Ledger UI

``` text
General Ledger

Account
Date Range

Opening Balance

Date | Reference | Debit | Credit | Balance

Closing Balance
```

Mobile layout:

``` text
Account
Date
Reference

Debit     Credit
₹10,000   ₹0

Balance
₹25,000
```

------------------------------------------------------------------------

# 36. Journal Entries UI

``` text
Journal Entries

Search
Date filter
Account filter

Entry #123
Date
Narration

Debit Lines
Credit Lines

[Reverse Entry]
```

Reverse flow:

``` text
Reverse
 ↓
Confirmation Modal
 ↓
POST /accounting/entries/:id/reverse
 ↓
Success
 ↓
Refresh ledger
```

------------------------------------------------------------------------

# 37. Financial Reports

## Folder

``` text
src/features/admin/reports/
│
├── screens/
│   ├── FinancialReportsScreen.tsx
│   ├── TrialBalanceScreen.tsx
│   ├── ProfitLossScreen.tsx
│   └── BalanceSheetScreen.tsx
│
├── components/
│   ├── ReportTabs.tsx
│   ├── ReportHeader.tsx
│   ├── DateRangePicker.tsx
│   ├── ReportTable.tsx
│   ├── ReportSummary.tsx
│   └── ExportReportButton.tsx
│
├── services/
│   └── reports.service.ts
│
├── hooks/
│   └── useReports.ts
│
└── types/
    └── reports.types.ts
```

------------------------------------------------------------------------

# 38. Financial Report APIs

``` text
GET /api/v1/reports/trial-balance
GET /api/v1/reports/profit-loss
GET /api/v1/reports/balance-sheet
```

Permissions:

``` text
trial_balance.read
profit_loss.read
balance_sheet.read
report.read
```

------------------------------------------------------------------------

# 39. Trial Balance

UI:

``` text
Trial Balance

As of:
[28 Sep 2026]

Account                 Debit       Credit
-------------------------------------------
Cash                    ₹X          ₹X
Bank                    ₹X          ₹X
Membership Income       ₹0          ₹X
Expenses                ₹X          ₹0
-------------------------------------------
Total                   ₹X          ₹X
```

Debit and credit totals must be displayed clearly.

------------------------------------------------------------------------

# 40. Profit & Loss

UI:

``` text
Profit & Loss

From [Date]
To   [Date]

Income
----------------
Membership Income
Donation Income
Other Income

Total Income

Expenses
----------------
Administrative
Program
Other

Total Expenses

Net Surplus / Deficit
```

------------------------------------------------------------------------

# 41. Balance Sheet

UI:

``` text
Balance Sheet

As of [Date]

Assets
----------------
Cash
Bank
Receivables

Total Assets

Liabilities
----------------
...

Equity
----------------
...

Total Liabilities + Equity

Assets = Liabilities + Equity
```

------------------------------------------------------------------------

# 42. Report Export

BRD specifies:

``` text
Download PDF
Share through native Share Sheet
```

Implementation should use a platform-compatible PDF/share solution and
keep the report data generated by the backend authoritative.

------------------------------------------------------------------------

# 43. RBAC Management

## Folder

``` text
src/features/admin/rbac/
│
├── screens/
│   └── RolesPermissionsScreen.tsx
│
├── components/
│   ├── RolesTab.tsx
│   ├── PermissionsCatalogTab.tsx
│   ├── UserRoleAssignmentsTab.tsx
│   ├── RoleCard.tsx
│   ├── PermissionItem.tsx
│   ├── RoleForm.tsx
│   └── AssignRoleModal.tsx
│
├── services/
│   └── rbac.service.ts
│
├── hooks/
│   └── useRbac.ts
│
└── types/
    └── rbac.types.ts
```

------------------------------------------------------------------------

# 44. RBAC APIs

``` text
GET    /api/v1/roles
POST   /api/v1/roles
PATCH  /api/v1/roles/:id
DELETE /api/v1/roles/:id

GET    /api/v1/permissions

POST   /api/v1/users/:id/roles
```

Permissions:

``` text
role.read
role.create
role.update
role.delete
role.assign
permission.read
```

------------------------------------------------------------------------

# 45. RBAC UI

Three tabs:

``` text
[ Roles ]
[ Permissions Catalog ]
[ User Role Assignments ]
```

Roles:

``` text
Role Name
Description
Permission Count
System/Custom
Actions
```

Permissions:

``` text
Permission
Module
Description
```

User assignment:

``` text
Search User

User
Current Roles

[Assign Role]
[Remove Role]
```

System roles:

``` text
ADMIN
MEMBER
DONOR
SEEKER
```

These are protected and cannot be renamed or deleted according to the
BRD.

------------------------------------------------------------------------

# 46. More Menu Integration

Mubasshir owns the route definitions for:

``` text
More
│
├── Financial Reports
├── Accounting
├── Expense Vouchers
├── Receipt Vouchers
├── Donations Management
├── Roles & Permissions
└── Settings
```

Other developers' modules will be added into this menu through shared
navigation contracts.

Do not duplicate the More navigator.

------------------------------------------------------------------------

# 47. Route Ownership

Recommended route names:

``` typescript
export const AdminRoutes = {
  Dashboard: 'AdminDashboard',

  Payments: 'AdminPaymentVerification',
  PaymentDetails: 'AdminPaymentDetails',

  Expenses: 'AdminExpenseVouchers',
  ExpenseDetails: 'AdminExpenseDetails',
  CreateExpense: 'AdminCreateExpense',

  ReceiptVouchers: 'AdminReceiptVouchers',
  ReceiptVoucherDetails: 'AdminReceiptVoucherDetails',
  CreateReceiptVoucher: 'AdminCreateReceiptVoucher',

  Accounting: 'AdminAccounting',
  ChartOfAccounts: 'AdminChartOfAccounts',
  GeneralLedger: 'AdminGeneralLedger',
  JournalEntries: 'AdminJournalEntries',

  Reports: 'AdminReports',
  TrialBalance: 'AdminTrialBalance',
  ProfitLoss: 'AdminProfitLoss',
  BalanceSheet: 'AdminBalanceSheet',

  RBAC: 'AdminRolesPermissions',
};
```

------------------------------------------------------------------------

# 48. State Management

Use the project's agreed state-management solution.

Separate:

``` text
Server state
    ↓
Query/cache layer

Client state
    ↓
Auth/session/UI state
```

Do not put large API lists into global client state unnecessarily.

Examples of server state:

``` text
Members
Payments
Ledger
Reports
Roles
Permissions
Dashboard metrics
```

Examples of local/client state:

``` text
Current logged-in user
Authentication status
Selected filters
Modal state
Navigation state
Theme
```

------------------------------------------------------------------------

# 49. Loading States

Every API-driven screen must support:

``` text
Initial Loading
Pull-to-refresh
Pagination Loading
Action Loading
```

Examples:

``` text
Loading list:
Skeleton rows

Loading button:
Spinner + disabled button

Loading report:
Report skeleton

Loading dashboard:
Stat card skeletons
```

Do not show a blank white screen during API calls.

------------------------------------------------------------------------

# 50. Empty States

Every list needs an empty state.

Example:

``` text
No Payments Found

There are no payments matching
your current filters.

[Clear Filters]
```

Use:

``` text
AppEmptyState
```

not custom empty UI per feature.

------------------------------------------------------------------------

# 51. Error States

Use:

``` text
AppErrorState
```

Example:

``` text
Unable to load payments

Please check your connection
and try again.

[Retry]
```

For validation errors, show the error beside the field.

For authorization:

``` text
You don't have permission
to perform this action.
```

------------------------------------------------------------------------

# 52. Network Handling

The app should handle:

``` text
No internet
Slow network
Timeout
401
403
404
422 validation
500 server error
```

Recommended behavior:

``` text
401
→ refresh token

403
→ permission error

422
→ field/form validation

500
→ generic server error + retry

Offline
→ network banner + retry
```

------------------------------------------------------------------------

# 53. Form Validation

Mubasshir-owned forms:

``` text
Login
Forgot Password
Reset Password
Expense Voucher
Receipt Voucher
Create/Edit Role
Assign Role
```

Validation should happen before API submission.

Required behavior:

``` text
Invalid
→ field error

Submit
→ disable duplicate submission

Success
→ close/redirect + success feedback

Failure
→ retain entered data where safe
```

------------------------------------------------------------------------

# 54. Financial Amount Formatting

All monetary values must use a central utility.

Example:

``` text
₹10,000
₹1,25,000
₹20,00,000
```

Do not format currency manually in every screen.

Create:

``` text
src/core/utils/currency.ts
```

Example:

``` typescript
formatINR(125000)
```

------------------------------------------------------------------------

# 55. Dates

Create one central date formatter:

``` text
src/core/utils/date.ts
```

Use consistent UI:

``` text
28 Sep 2026
28 Sep 2026, 10:30 AM
```

Do not mix formats across screens.

------------------------------------------------------------------------

# 56. Permission-Based UI

Every sensitive action must check permission.

Examples:

``` text
Create Expense
→ expense.create

Edit Expense
→ expense.update

Cancel Expense
→ expense.manage_status

Verify Payment
→ payment.verify

Reverse Journal
→ accounting_entry.reverse

Create Role
→ role.create

Delete Role
→ role.delete
```

The UI permission check is not a replacement for backend authorization.
Backend remains authoritative.

------------------------------------------------------------------------

# 57. Performance Rules

Admin lists can contain thousands of records.

Use:

``` text
Pagination
FlatList
Memoized row components
Debounced search
Stable callbacks
Lazy screen loading where appropriate
```

Do not render thousands of records at once.

Search should be debounced.

Example:

``` text
User types:
A
Am
Ama
Aman

Do not fire 4 immediate requests.

Wait for debounce.
```

------------------------------------------------------------------------

# 58. Responsive Mobile Rules

Target:

``` text
Android phones
iPhone
Small screens
Large screens
```

Do not hardcode:

``` text
width: 390
```

Use:

``` text
flex
percentage
Dimensions
useWindowDimensions
responsive spacing
```

Important:

-   Respect safe areas
-   Support iOS notch/Dynamic Island
-   Support Android status bar
-   Keep bottom navigation above gesture areas
-   Keyboard must not cover forms

------------------------------------------------------------------------

# 59. Android + iOS Rules

Every Mubasshir feature must be checked on both platforms.

### Android

Check:

``` text
Back button
Keyboard
Status bar
Permissions
File upload
PDF
Share
Navigation
```

### iOS

Check:

``` text
Safe Area
Keyboard
Navigation gestures
File picker
PDF
Share Sheet
Biometric
Status bar
```

Avoid Android-only APIs inside shared code.

Use platform-specific files only when necessary:

``` text
Component.android.tsx
Component.ios.tsx
```

------------------------------------------------------------------------

# 60. Testing Requirements

Every Mubasshir feature must have:

## Unit tests

``` text
Currency formatter
Date formatter
Permission helper
Auth reducer/store
Validation
```

## Component tests

``` text
Payment Card
Stat Card
Report Table
Permission-based button
Role card
```

## Integration tests

``` text
Login
Token refresh
Payment verification
Expense creation
Receipt creation
Journal reversal
Role assignment
```

## Manual device testing

``` text
Android emulator
Android physical device
iOS simulator
iPhone physical device when available
```

------------------------------------------------------------------------

# 61. Definition of Done

A feature is NOT complete when only the UI is finished.

It is complete only when:

``` text
[ ] UI matches approved design
[ ] Responsive mobile layout
[ ] API integrated
[ ] TypeScript types created
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Search where required
[ ] Filters where required
[ ] Pagination where required
[ ] Pull-to-refresh
[ ] Form validation
[ ] Permission checks
[ ] Success feedback
[ ] Error feedback
[ ] Navigation
[ ] Android tested
[ ] iOS checked
[ ] Unit tests
[ ] No TypeScript errors
[ ] No lint errors
[ ] No console errors
[ ] Code reviewed
```

------------------------------------------------------------------------

# 62. Git Branch Strategy

Mubasshir owns the architecture branches:

``` text
main
│
└── develop
    │
    ├── feature/mubasshir/auth
    ├── feature/mubasshir/api
    ├── feature/mubasshir/rbac
    ├── feature/mubasshir/dashboard
    ├── feature/mubasshir/payments
    ├── feature/mubasshir/expenses
    ├── feature/mubasshir/receipts
    ├── feature/mubasshir/accounting
    └── feature/mubasshir/reports
```

Never directly push feature work to `main`.

------------------------------------------------------------------------

# 63. Commit Convention

Use:

``` text
feat:
fix:
refactor:
test:
chore:
docs:
```

Examples:

``` text
feat(auth): implement admin login
feat(api): add refresh token interceptor
feat(payments): integrate payment verification
feat(accounting): add general ledger
feat(reports): add trial balance
fix(auth): handle expired refresh token
test(rbac): add permission guard tests
```

------------------------------------------------------------------------

# 64. Pull Request Requirements

Every PR must include:

``` text
Summary
Changed files
API endpoints used
Screens added
Permissions required
Testing performed
Known limitations
Screenshots/video
```

Example:

``` text
## Summary
Implemented Admin Payment Verification.

## APIs
GET /api/v1/membership-payments
POST /api/v1/membership-payments/:id/verify

## Permissions
payment.read
payment.verify
payment.manage_status

## Testing
Android emulator: PASS
TypeScript: PASS
Unit tests: PASS

## Screens
Payment List
Payment Details
Verify Payment Modal
```

------------------------------------------------------------------------

# 65. API Contract Checklist

Before implementing any screen, confirm:

``` text
[ ] Endpoint exists
[ ] HTTP method confirmed
[ ] Request body confirmed
[ ] Query params confirmed
[ ] Response shape confirmed
[ ] Pagination confirmed
[ ] Error response confirmed
[ ] Permission confirmed
[ ] Status enum confirmed
```

Never invent backend response fields based only on the UI screenshot.

------------------------------------------------------------------------

# 66. Mubasshir API Ownership Matrix

  ----------------------------------------------------------------------------------------------------
  Module            Endpoint                            Method            Permission
  ----------------- ----------------------------------- ----------------- ----------------------------
  Auth              `/auth/login`                       POST              Public

  Auth              `/auth/forgot-password`             POST              Public

  Auth              `/auth/reset-password`              POST              Public

  Auth              `/auth/me`                          GET               Auth

  Auth              `/auth/logout`                      POST              Auth

  Dashboard         `/users`                            GET               Backend-defined

  Dashboard         `/memberships`                      GET               Backend-defined

  Dashboard         `/receipts`                         GET               Backend-defined

  Payments          `/membership-payments`              GET               `payment.read`

  Payments          `/membership-payments/:id/verify`   POST              `payment.verify`

  Expenses          `/expense-entries`                  GET               `expense.read`

  Expenses          `/expense-entries`                  POST              `expense.create`

  Receipts          `/receipt-entries`                  GET               `receipt_entry.read`

  Receipts          `/receipt-entries`                  POST              `receipt_entry.create`

  Accounting        `/accounts`                         GET               `account.read`

  Accounting        `/accounts/:id/ledger`              GET               `ledger.read`

  Accounting        `/accounting/ledger`                GET               `ledger.read`

  Accounting        `/accounting/entries`               GET               `accounting_entry.read`

  Accounting        `/accounting/entries/:id/reverse`   POST              `accounting_entry.reverse`

  Reports           `/reports/trial-balance`            GET               `trial_balance.read`

  Reports           `/reports/profit-loss`              GET               `profit_loss.read`

  Reports           `/reports/balance-sheet`            GET               `balance_sheet.read`

  RBAC              `/roles`                            GET               `role.read`

  RBAC              `/roles`                            POST              `role.create`

  RBAC              `/roles/:id`                        PATCH             `role.update`

  RBAC              `/roles/:id`                        DELETE            `role.delete`

  RBAC              `/permissions`                      GET               `permission.read`

  RBAC              `/users/:id/roles`                  POST              `role.assign`
  ----------------------------------------------------------------------------------------------------

These endpoint and permission mappings are based on the current Admin
BRD. Backend implementation remains authoritative if the implemented API
contract differs.

------------------------------------------------------------------------

# 67. Dependency Order

Mubasshir should implement in this order.

``` text
PHASE 1
│
├── Project Architecture
├── Environment
├── Theme integration
└── API Client
        ↓
PHASE 2
│
├── Secure Storage
├── Auth
├── Token Refresh
└── Root Navigation
        ↓
PHASE 3
│
├── Permission Service
├── RBAC
└── Navigation Guards
        ↓
PHASE 4
│
└── Dashboard
        ↓
PHASE 5
│
├── Payment Verification
├── Expense Vouchers
└── Receipt Vouchers
        ↓
PHASE 6
│
├── Chart of Accounts
├── General Ledger
└── Journal Entries
        ↓
PHASE 7
│
├── Trial Balance
├── P&L
└── Balance Sheet
        ↓
PHASE 8
│
└── Full Integration / QA / Release
```

------------------------------------------------------------------------

# 68. Parallel Team Dependency

Other developers depend on Mubasshir for:

``` text
API Client
    ↓
Authentication
    ↓
Navigation
    ↓
Permission helper
    ↓
Shared API conventions
```

Aman provides:

``` text
Theme
    ↓
Common Components
    ↓
Admin Components
```

After those two foundations are stable:

``` text
                    MUBASSHIR
                 API + Architecture
                       │
                       ▼
                     AMAN
               Shared UI System
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      ARSHAD         SAHIL          SURAJ
   Operations     Donations       Content
```

------------------------------------------------------------------------

# 69. Code Ownership Rules

Mubasshir owns:

``` text
src/app/
src/core/api/
src/core/permissions/
src/core/storage/
src/features/auth/
src/features/admin/dashboard/
src/features/admin/payments/
src/features/admin/expenses/
src/features/admin/receipts/
src/features/admin/accounting/
src/features/admin/reports/
src/features/admin/rbac/
```

Other developers should not modify these without coordination.

Mubasshir should also review changes to:

``` text
navigation
API client
theme
shared types
shared components
permission logic
```

------------------------------------------------------------------------

# 70. Final Mubasshir Checklist

## Foundation

-   [ ] React Native CLI project verified
-   [ ] Android build verified
-   [ ] iOS project verified on macOS/Xcode
-   [ ] TypeScript configured
-   [ ] Environment configuration
-   [ ] API base URL configuration

## API

-   [ ] Central API client
-   [ ] Authorization interceptor
-   [ ] Refresh interceptor
-   [ ] Error interceptor
-   [ ] Typed API responses
-   [ ] Network error handling

## Authentication

-   [ ] Splash
-   [ ] Login
-   [ ] Forgot password
-   [ ] Reset password
-   [ ] Token refresh
-   [ ] Secure storage
-   [ ] Logout
-   [ ] Session restoration

## Authorization

-   [ ] Permission model
-   [ ] `can()` helper
-   [ ] Navigation guards
-   [ ] Action-level permission checks
-   [ ] 403 handling

## Dashboard

-   [ ] Stats
-   [ ] Revenue
-   [ ] Pending actions
-   [ ] Recent activity
-   [ ] Navigation shortcuts
-   [ ] Loading
-   [ ] Error
-   [ ] Refresh

## Payments

-   [ ] Payment list
-   [ ] Search
-   [ ] Filters
-   [ ] Payment details
-   [ ] Verify payment
-   [ ] Offline payment
-   [ ] Receipt scan/upload
-   [ ] Verification result
-   [ ] Idempotency handling

## Expenses

-   [ ] Expense list
-   [ ] Search
-   [ ] Filters
-   [ ] Create voucher
-   [ ] Expense details
-   [ ] Cancel/void
-   [ ] Status handling

## Receipts

-   [ ] Receipt voucher list
-   [ ] Create voucher
-   [ ] Details
-   [ ] Search
-   [ ] Filters
-   [ ] Cancel/reversal

## Accounting

-   [ ] Chart of Accounts
-   [ ] Account tree
-   [ ] General Ledger
-   [ ] Date filter
-   [ ] Journal Entries
-   [ ] Debit/Credit lines
-   [ ] Reverse Entry
-   [ ] Confirmation modal

## Reports

-   [ ] Trial Balance
-   [ ] P&L
-   [ ] Balance Sheet
-   [ ] Date selection
-   [ ] Report loading
-   [ ] Report empty state
-   [ ] PDF export
-   [ ] Native share

## RBAC

-   [ ] Roles
-   [ ] Create role
-   [ ] Edit role
-   [ ] Delete custom role
-   [ ] Protected system roles
-   [ ] Permissions catalog
-   [ ] User role assignment
-   [ ] Remove role

## Quality

-   [ ] Unit tests
-   [ ] Component tests
-   [ ] Integration tests
-   [ ] Android test
-   [ ] iOS test
-   [ ] TypeScript clean
-   [ ] ESLint clean
-   [ ] No debug logs
-   [ ] PR reviewed
-   [ ] Release build tested

------------------------------------------------------------------------

# 71. Final Architecture

``` text
                         HRSJM MOBILE
                              │
                  React Native CLI + TS
                              │
              ┌───────────────┴───────────────┐
              │                               │
           Android                            iOS
              │                               │
              └───────────────┬───────────────┘
                              │
                           src/
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
       app                  core                 features
        │                     │                     │
 Navigation              API / Auth               Admin
 Providers               RBAC                    │
                       Components                 ├── Dashboard
                                                 ├── Payments
                                                 ├── Expenses
                                                 ├── Receipts
                                                 ├── Accounting
                                                 ├── Reports
                                                 └── RBAC
```

## Mubasshir's primary objective

> **Build the foundation and complex Admin modules so the other
> developers can work independently without breaking authentication, API
> communication, permissions, navigation, accounting or the shared
> application architecture.**

The rest of the team should consume Mubasshir's shared infrastructure
rather than recreate it inside their feature folders.
