# HRSJM Project Memory & State (`docs/memory.md`)

**Platform:** React Native CLI (Android minSdk 24 / targetSdk 34, iOS 15.0+)  
**Language:** TypeScript  
**Backend API:** `HRSJM-back-api` (`/api/v1`)  
**Lead / Architect:** Mubasshir  
**Last Updated:** September 30, 2026  

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
| **Phase 2** | Authentication, Secure Storage (Keychain/MMKV), Token Rotation & Root Navigation | 🟡 Ready to Begin |
| **Phase 3** | Dynamic RBAC Permission Engine (`can()` helper) & Navigation Guards | ⚪ Pending |
| **Phase 4** | Admin Executive Dashboard (KPI metrics, revenue overview, pending actions) | ⚪ Pending |
| **Phase 5** | Payment Verification, Expense Vouchers & Manual Receipt Vouchers | ⚪ Pending |
| **Phase 6** | Accounting Engine (Interactive Chart of Accounts tree, General Ledger, Journal Entries) | ⚪ Pending |
| **Phase 7** | Financial Reports (Trial Balance, P&L, Balance Sheet + PDF Export) | ⚪ Pending |
| **Phase 8** | RBAC Management, Cross-Module Integration, QA Verification & Release Build | ⚪ Pending |

---

## 4. Key Endpoints Reference

```text
Auth:
  POST /api/v1/auth/login
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
  POST /api/v1/users/:id/roles
```

---

## 5. Development Changelog & Status Updates

* **2026-09-30**:
  - Initialized project roadmap in [`phase.md`](file:///c:/GNT_CodeBase/HRSJM_APPLICATION_UI/phase.md).
  - Defined architecture standards and guidelines in [`rule.md`](file:///c:/GNT_CodeBase/HRSJM_APPLICATION_UI/rule.md) (including mandatory side-by-side API integration).
  - Established project memory tracker in [`docs/memory.md`](file:///c:/GNT_CodeBase/HRSJM_APPLICATION_UI/docs/memory.md).
