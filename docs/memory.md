# HRSJM Project Memory & State (`docs/memory.md`)

**Platform:** React Native CLI (Android minSdk 24 / targetSdk 34, iOS 15.0+)  
**Language:** TypeScript  
**Backend API:** `HRSJM-back-api` (`/api/v1`)  
**Lead / Architect:** Mubasshir  
**Last Updated:** October 1, 2026  

---

## 1. Project Overview & Core Mission
**HRSJM Digital Membership & Donation Platform** is a cross-platform mobile application supporting community members, charitable donors, welfare seekers, and administrators. 

### Primary Focus (Mubasshir Scope)
Mubasshir owns the foundational architecture and the core enterprise Admin financial and management modules:
- Foundation, theme tokens, and common components.
- Centralized Axios networking layer with automatic 401 JWT token refresh interceptor.
- Dynamic RBAC engine with backend-resolved permissions via `can()` helper.
- Admin Modules:
  1. **Dashboard** (KPIs, revenue breakdown, pending approvals queue).
  2. **Payment Verification** (offline/cash and gateway payments with idempotent actions).
  3. **Expense Vouchers** (Dr Expense / Cr Bank with backend reversal).
  4. **Receipt Vouchers** (Dr Bank / Cr Income with backend reversal).
  5. **Accounting Engine** (Chart of Accounts tree, General Ledger, Journal Entries & Mirror Reversals).
  6. **Financial Reports** (Trial Balance, Profit & Loss, Balance Sheet with PDF export).
  7. **Roles & Permissions Administration** (Role builder, permissions catalog, user role assignments).

---

## 2. Architecture Decisions Record (ADR)

| Decision | Technology / Choice | Rationale |
|---|---|---|
| **State Management** | `Zustand` (Client State) + `@tanstack/react-query` (Server State) | Clean separation between fast local UI/auth state and cached, paginated server data. |
| **Networking** | `axios` with dedicated interceptors | Centralized base URL, Bearer token injection, silent 401 token rotation, unified error envelope. |
| **Token Storage** | `react-native-keychain` + `react-native-mmkv` | Hardware-backed secure enclave for refresh token; ultra-fast synchronous storage for cached preferences. |
| **Permissions / RBAC** | Dynamic backend resolution via `can('permission.key')` | Never rely on static `role === 'ADMIN'`; permissions resolved dynamically from backend API. |
| **Design System** | Custom tokens (`AdminColors`, `Typography`, `Spacing`) | Consistent NGO/Enterprise aesthetic (Deep Navy `#1B3F8F`, Gold `#C9A227`, soft status badges). |
| **Utilities** | Centralized `formatINR` & `formatDate` | Prevents inconsistent financial representations or date formats across screens. |

---

## 3. Current Phase Tracking

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Foundation Setup, Design Tokens (`AdminColors`), Common Base Components & Central Axios Client | 🟢 Completed |
| **Phase 2** | Authentication, Secure Storage (Keychain/MMKV), Token Rotation & Root Navigation | 🟢 Completed |
| **Phase 3** | Dynamic RBAC Permission Engine (`can()` helper) & Navigation Guards | 🟢 Completed |
| **Phase 4** | Admin Executive Dashboard (KPI metrics, revenue overview, pending actions) | 🟢 Completed |
| **Phase 5** | Payment Verification, Expense Vouchers & Manual Receipt Vouchers | 🟡 Ready to Begin |
| **Phase 6** | Accounting Engine (Interactive Chart of Accounts tree, General Ledger, Journal Entries) | ⚪ Pending |
| **Phase 7** | Financial Reports (Trial Balance, P&L, Balance Sheet + PDF Export) | ⚪ Pending |
| **Phase 8** | RBAC Management, Cross-Module Integration, QA Verification & Release Build | ⚪ Pending |

---

## 4. Key Endpoints Reference

```text
Auth:
  POST /api/v1/auth/login
  POST /api/v1/auth/refresh
  POST /api/v1/auth/forgot-password
  POST /api/v1/auth/reset-password
  GET  /api/v1/auth/me
  POST /api/v1/auth/logout

Dashboard:
  GET  /api/v1/users
  GET  /api/v1/memberships
  GET  /api/v1/receipts

Payments:
  GET  /api/v1/membership-payments
  POST /api/v1/membership-payments/:id/verify

Expenses & Receipts:
  GET  /api/v1/expense-entries
  POST /api/v1/expense-entries
  GET  /api/v1/receipt-entries
  POST /api/v1/receipt-entries

Accounting:
  GET  /api/v1/accounts
  GET  /api/v1/accounting/ledger
  GET  /api/v1/accounting/entries
  POST /api/v1/accounting/entries/:id/reverse

Reports:
  GET  /api/v1/reports/trial-balance
  GET  /api/v1/reports/profit-loss
  GET  /api/v1/reports/balance-sheet

RBAC:
  GET/POST/PATCH/DELETE /api/v1/roles
  GET  /api/v1/permissions
  GET  /api/v1/users/me/permissions
  POST /api/v1/users/:id/roles
```

---

## 5. Development Changelog & Status Updates

* **2026-10-01 (Phase 4)**:
  - **Phase 4 completed** — Admin Executive Dashboard built to the approved mockup, integrated side-by-side with the backend.
  - **Backend** (`GET /api/v1/admin/dashboard` extended in `AdminService.getDashboard`, all behind existing `user.read`): added `membershipPayments` {pending, success, failed}, `applicationsByStatus` & `ticketsByStatus` maps, `revenue` {membershipIncome, donationIncome, total} from receipts SUM grouped by `receipt_type` (also sidesteps the pre-existing `donations.receivedAmount` bug which always read 0), `memberGrowth` cumulative 6-month series, per-KPI `thisMonth`/`prevMonth` deltas, and `recentActivity` (last 10 audit-log events). Registered the 3 new entities in `AdminModule`.
  - **Backend bug fix**: `GET /admin/members` 500'd on `leftJoinAndSelect('user.roles', ...)` — the UserEntity relation is `user_roles`; nobody had called this route before.
  - **Mobile core**: new `src/core/components/admin/` — `AdminStatCard` (tinted KPI cards with MoM growth badge), `AdminSectionHeader` (title + View All), `AdminStatusBadge` (+ canonical `adminStatusTone` mapping). Added `accentPurple`/`accentPurpleLight` tokens. `react-native-svg` installed for the charts (native module — Android rebuild required).
  - **Dashboard feature** (`src/features/admin/dashboard/`): typed contracts for the extended payload, React Query hooks (`useDashboard`, `useRecentMembers`, `useRecentApplications`, `useUnreadNotifications`, `useDashboardRefresh`), utils (MoM growth %, month labels, donut segments), SVG `MembershipGrowthCard` (line chart + callout) and `StatusDonutCard` (donut + legend), `RevenueSummaryCard`, `PendingActionsCard` (permission-gated, `navigation.jumpTo` to queues), `RecentMembersCard`, `RecentApplicationsCard`, and `AdminDashboardScreen` with navy header band (menu → More hub, real unread bell badge via `/notifications/me`, avatar), welcome row + month chip, skeleton shimmer loading, error state with retry, pull-to-refresh.
  - Tab bar active tint set to gold per the mockup; Dashboard tab now mounts the real screen (Members/Applications/Complaints remain team placeholders).
  - Verification: backend build clean; live smoke — dashboard payload complete (99 users, MoM deltas 2/97, revenue ₹12,300 + ₹24,400, growth series, payments 1/14/0, 10 audit events), `/admin/members` fixed and returning rows, unread count OK. Mobile: tsc clean, ESLint 0 errors, Jest 49/49.
  - Phase 5 next: Payment Verification, Expense Vouchers & Receipt Vouchers.
* **2026-10-01 (Phase 3)**:
  - **Phase 3 completed** — Dynamic RBAC engine & permission-aware navigation, integrated side-by-side with the backend.
  - **Backend additions** (small, contract-driven): `GET /api/v1/users/me/permissions` returns the caller's effective permission keys (same aggregation as PermissionsGuard; no `role.read` needed — non-admin roles can self-serve); `POST /api/v1/auth/register` now accepts `role_name` restricted to a public allowlist `['MEMBER','DONOR','DONATION_SEEKER']` (ADMIN self-registration rejected 400).
  - **Permission engine (`src/core/permissions/`)**: `permission.constants.ts` pins the full 53-key backend catalog; `permission.service.ts` calls `/users/me/permissions`; `permission.store.ts` (Zustand) holds the session-scoped set; `can()`/`canAny()`/`canAll()` imperative checks; `useCan()`/`useCanAny()` reactive hooks; `permission.guard.tsx` with `<PermissionGate>` + `<PermissionDenied>`.
  - **Wiring**: authStore loads permissions right after login / register / session-restore; cleared on logout and session expiry.
  - **Navigation**: `AdminTabNavigator` (5 tabs — Dashboard, Members, Applications, Complaints, More) with permission-gated tabs (Members=`membership.read`, Applications=`assistance.review`, Complaints=`support.manage`); `MoreNavigator` + `MoreMenuScreen` hub with permission-filtered items (Payments, Expenses, Receipts, Accounting, Reports, Donations, Roles & Permissions, Settings); typed params in `NavigationTypes.ts`; `RootNavigator` routes authenticated ADMIN → AdminTabNavigator, other roles → placeholder home. Module screens are placeholders until Phases 4–8 (route contracts live now).
  - **Register flow added** (user-requested, uses backend `role_name`): `RegisterIntroScreen` ("New to HRSJM?") + 3-step `RegisterScreen` (personal details → account type & password with strength checklist → complete), Remember-me on Login (unchecking keeps the session memory-only), Login/Register screens restyled to the approved HRSJM design (logo band, gold buttons, Google sign-in marked "coming soon" — backend has no OAuth endpoint).
  - Verification: backend build clean; live smoke — seeker register → role DONATION_SEEKER, admin `me/permissions` = 53 keys (incl. payment.verify, accounting_entry.reverse), member permissions = 0, ADMIN self-register rejected 400, seeded suspended member login → 403 ACCOUNT_DISABLED (TC-ADMIN-003). Mobile: tsc clean, ESLint 0 errors, Jest 49/49 (permission engine, register schema, authStore register/remember-me flows added).
  - Phase 4 next: Admin Executive Dashboard.
* **2026-10-01**:
  - **Phase 2 completed** — Auth feature (`src/features/auth`): Splash / Onboarding / Login / Forgot / Reset screens wired side-by-side to the real backend `HRSJM-back-api /api/v1/auth` endpoints (no mocks).
  - Secure storage implemented per ADR: access token memory-only, refresh token in `react-native-keychain` (`com.hrsjm.admin`); preferences in `react-native-mmkv` via `app-storage.ts` (onboarding + biometric flags). `token-storage.ts` is no longer an in-memory stub.
  - **Fixed refresh interceptor contract bug**: it previously sent `{refreshToken}` and read `accessToken`; the backend expects `{refresh_token}` and returns `access_token`/`refresh_token` (snake_case). Verified live against the running backend.
  - **Fixed base URL port mismatch**: backend runs on port **3000** (`APP_PORT` in `HRSJM-back-api/.env`); mobile base URL moved from `:5000` to `:3000` and centralized in `src/app/config/app.config.ts`.
  - Added session-expiry wiring: refresh-failure → `setSessionExpiredHandler` → `authStore.handleSessionExpired` → back to Auth flow.
  - Navigation: `RootNavigator` (auth vs app switch on auth store status), `AuthNavigator` (Splash → Onboarding → Login → Forgot → Reset), typed params in `NavigationTypes.ts`; `App.tsx` now renders `AppProviders` (SafeArea + React Query) wrapping the root navigator. Authenticated area is a placeholder home until Phase 3's `AdminTabNavigator`.
  - Biometric unlock shipped (`react-native-biometrics`): enable-after-first-login prompt, biometric button on Login that gates silent session restore (BRD TC-ADMIN-004).
  - Verification: `tsc --noEmit` clean, ESLint 0 errors, Jest 32/32 (auth schemas, token storage, auth service contract, authStore flows, App smoke test). Live backend smoke test passed: login → me → refresh rotation → forgot (dev reset_token) → logout revoke → revoked refresh rejected 401 → bad login 401 "Invalid credentials".
  - Phase 3 next: dynamic RBAC permission engine (`can()`) & navigation guards.
* **2026-09-30**:
  - Initialized project roadmap in [`phase.md`](file:///c:/GNT_CodeBase/HRSJM_APPLICATION_UI/phase.md).
  - Defined architecture standards and guidelines in [`rule.md`](file:///c:/GNT_CodeBase/HRSJM_APPLICATION_UI/rule.md) (including mandatory side-by-side API integration).
  - Established project memory tracker in [`docs/memory.md`](file:///c:/GNT_CodeBase/HRSJM_APPLICATION_UI/docs/memory.md).
