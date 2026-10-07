# HRSJM — All Roles Screen Progress Report
> Generated: 2026-10-07 | Based on: BRD_Admin.md · BRD_Member.md · BRD_Seeker.md · BRD_Guest.md

---

## 📊 Master Summary

| Role | BRD Screens | ✅ Done | ⚠️ Partial | ❌ Not Started | Progress |
|---|---|---|---|---|---|
| **Admin** | 26 | 22 | 2 | 2 | ~85% |
| **Member** | 20 | 1 | 0 | 19 | ~5% |
| **Seeker** | 12 | 1 | 0 | 11 | ~8% |
| **Guest** | 9 | 0 | 0 | 9 | 0% |
| **TOTAL** | **67** | **24** | **2** | **41** | **~36%** |

---

## 🟦 SHARED / COMMON SCREENS (Reusable across all roles)

These screens are built **ONCE** and shared by all roles via the same auth flow.

| Screen | File (Actual) | Used By | Status |
|---|---|---|---|
| SplashScreen | `auth/screens/SplashScreen.tsx` | All 4 roles | ✅ Done |
| OnboardingScreen | `auth/screens/OnboardingScreen.tsx` | All 4 roles | ✅ Done |
| LoginScreen | `auth/screens/LoginScreen.tsx` | All 4 roles | ✅ Done |
| RegisterScreen | `auth/screens/RegisterScreen.tsx` | All 4 roles | ✅ Done |
| RegisterIntroScreen | `auth/screens/RegisterIntroScreen.tsx` | All 4 roles | ✅ Done |
| ForgotPasswordScreen | `auth/screens/ForgotPasswordScreen.tsx` | All 4 roles | ✅ Done |
| ResetPasswordScreen | `auth/screens/ResetPasswordScreen.tsx` | All 4 roles | ✅ Done |

**Auth screens: 7/7 ✅ COMPLETE**

---

## 🟥 ADMIN ROLE — 26 Screens

### ✅ Done (22 screens)

| # | Screen | File | Notes |
|---|---|---|---|
| 1 | Admin Dashboard | `admin/dashboard/screens/AdminDashboardScreen.tsx` | Stat cards |
| 2 | Members List | `admin/members/screens/MembersScreen.tsx` | Search, filter, status |
| 3 | Expense Vouchers List | `admin/expenses/screens/ExpenseVouchersScreen.tsx` | |
| 4 | Create Expense Voucher | `admin/expenses/screens/CreateExpenseVoucherScreen.tsx` | Calendar + auto-ref ✨ |
| 5 | Expense Details | `admin/expenses/screens/ExpenseDetailsScreen.tsx` | |
| 6 | Receipt Vouchers List | `admin/receipts/screens/ReceiptVouchersScreen.tsx` | |
| 7 | Create Receipt Voucher | `admin/receipts/screens/CreateReceiptVoucherScreen.tsx` | Calendar + auto-ref ✨ |
| 8 | Receipt Voucher Details | `admin/receipts/screens/ReceiptVoucherDetailsScreen.tsx` | |
| 9 | Chart of Accounts | `admin/accounting/screens/ChartOfAccountsScreen.tsx` | |
| 10 | General Ledger | `admin/accounting/screens/GeneralLedgerScreen.tsx` | |
| 11 | Journal Entries | `admin/accounting/screens/JournalEntriesScreen.tsx` | |
| 12 | Reports Hub | `admin/reports/screens/ReportsScreen.tsx` | |
| 13 | Trial Balance | `admin/reports/screens/TrialBalanceScreen.tsx` | |
| 14 | Profit & Loss | `admin/reports/screens/ProfitLossScreen.tsx` | |
| 15 | Balance Sheet | `admin/reports/screens/BalanceSheetScreen.tsx` | |
| 16 | Assistance Requests | `admin/assistance/screens/AssistanceRequestsScreen.tsx` | |
| 17 | Assistance Details | `admin/assistance/screens/AssistanceDetailsScreen.tsx` | |
| 18 | Assistance Documents | `admin/assistance/screens/AssistanceDocumentsScreen.tsx` | |
| 19 | Support Tickets | `admin/support/screens/SupportTicketsScreen.tsx` | |
| 20 | Ticket Details | `admin/support/screens/TicketDetailsScreen.tsx` | |
| 21 | Ticket Chat | `admin/support/screens/TicketChatScreen.tsx` | |
| 22 | Payment Verification | `admin/payments/screens/PaymentVerificationScreen.tsx` | |
| 23 | Payment Details | `admin/payments/screens/PaymentDetailsScreen.tsx` | |
| 24 | Donations List | `admin/donations/screens/DonationsScreen.tsx` | |
| 25 | Profile Settings | `admin/settings/screens/ProfileSettingsScreen.tsx` | |

### ❌ Not Started (2 screens)

| # | Screen | BRD Reference | Notes |
|---|---|---|---|
| 1 | Membership Approvals Queue | TC-ADMIN-017 to 022 | Approve/reject, view KYC docs |
| 2 | Roles & Permissions | TC-ADMIN-042 to 045 | RBAC management screen |

> **Note**: Membership Categories may be nested inside MembersScreen — needs verification.

---

## 🟩 MEMBER ROLE — 20 Screens

### ✅ Done (1 screen)

| # | Screen | File | Notes |
|---|---|---|---|
| 1 | Member Home | `member/screens/MemberHomeScreen.tsx` | Placeholder/stub only (3.4 KB) |

### ❌ Not Started (19 screens)

| # | Screen | BRD Section | Description |
|---|---|---|---|
| 2 | Membership Categories | TC-MEM-015 | Browse available membership tiers |
| 3 | Membership Apply Step 1 | TC-MEM-017/018 | Personal info form |
| 4 | Membership Apply Step 2 | TC-MEM-019 | Address details form |
| 5 | Membership Apply Step 3 | TC-MEM-020/022 | Document upload (3 docs) |
| 6 | Membership Card | TC-MEM-024/025 | Flip card with QR code |
| 7 | Renewal Screen | TC-MEM-029/031 | Days remaining + payment |
| 8 | Cause List (Member) | TC-MEM-032/033 | Browse active causes with filters |
| 9 | Cause Detail (Member) | TC-MEM-034 | Full cause detail |
| 10 | Donation Checkout | TC-MEM-035/037 | Preset + custom amounts, PAN |
| 11 | Payment Success | TC-MEM-038/039 | Success animation + receipt |
| 12 | Donation History | TC-MEM-040 | All personal donations |
| 13 | Receipts List | TC-MEM-041/042 | Membership + donation receipts |
| 14 | Document Vault | TC-MEM-045/046 | KYC status + re-upload |
| 15 | Tickets List (Member) | TC-MEM-047 | Support ticket list |
| 16 | Create Ticket | TC-MEM-047 | Submit new support ticket |
| 17 | Ticket Chat (Member) | TC-MEM-048/050 | Real-time chat with attach |
| 18 | Notifications Screen | TC-MEM-054 | Push notification preferences |
| 19 | Profile Settings (Member) | TC-MEM-051/053 | Edit profile, biometrics |

---

## 🟨 SEEKER ROLE — 12 Screens

### ✅ Done (1 screen)

| # | Screen | File | Notes |
|---|---|---|---|
| 1 | Seeker Home | `seeker/screens/SeekerHomeScreen.tsx` | Placeholder/stub only (2.8 KB) |

### ❌ Not Started (11 screens)

| # | Screen | BRD Section | Description |
|---|---|---|---|
| 2 | Aid Apply Screen | TC-SEEK-013 to 029 | 4-step form: Category → Details → Description → Docs |
| 3 | Aid Tracker Screen | TC-SEEK-031 to 038 | Request list + timeline stepper |
| 4 | Document Vault (Seeker) | TC-SEEK-039 to 042 | Aid docs, re-upload rejected |
| 5 | Tickets List (Seeker) | TC-SEEK-050/051 | Support tickets |
| 6 | Create Ticket (Seeker) | TC-SEEK-050/051 | Application/Document query |
| 7 | Ticket Chat (Seeker) | TC-SEEK-052/054 | Thread chat |
| 8 | Notifications (Seeker) | TC-SEEK-043 to 049 | Status updates, disbursement alerts |
| 9 | Profile Settings (Seeker) | TC-SEEK-055 to 057 | Address, password, biometrics |

> **Note**: Aid Apply is a 4-step wizard — could be split into 4 sub-screens.

---

## 🟧 GUEST ROLE — 9 Screens

### ✅ Done (0 screens)

None — the Guest flow has no dedicated screens built yet.

### ❌ Not Started (9 screens)

| # | Screen | BRD Section | Description |
|---|---|---|---|
| 1 | Guest Explore Screen | TC-GUEST-012 to 018 | Hero banner, impact counters, featured campaigns |
| 2 | Cause List (Public) | TC-GUEST-019 to 028 | Public read-only cause feed |
| 3 | Cause Detail (Public) | TC-GUEST-029 to 033 | Public cause detail + Login CTA |
| 4 | Guest Join Screen | TC-GUEST-049 to 053 | Role selection: Member / Donor / Seeker |
| 5 | Login Screen | *(shared)* | Already built ✅ |
| 6 | Register Screen | *(shared)* | Already built ✅ |
| 7 | Forgot Password | *(shared)* | Already built ✅ |
| 8 | Reset Password | *(shared)* | Already built ✅ |
| 9 | Onboarding Screen | *(shared)* | Already built ✅ |

**New screens needed for Guest: 4** (Explore, CauseList, CauseDetail, GuestJoin)

---

## 🔄 REUSABLE / SHARED SCREENS (Same screen, different role context)

These screens appear in multiple BRDs — they should be **built once and parameterized**:

| Screen | Used By | Strategy |
|---|---|---|
| `TicketsListScreen` | Member + Seeker | Same screen, filtered by user |
| `CreateTicketScreen` | Member + Seeker | Shared, category options differ |
| `TicketChatScreen` | Member + Seeker + Admin | Shared, sender side differs |
| `DocumentVaultScreen` | Member + Seeker | Shared, doc types differ |
| `NotificationsScreen` | Member + Seeker + (Admin) | Shared, notification types differ |
| `ProfileSettingsScreen` | Member + Seeker + Admin | Shared, admin already built |
| `CauseListScreen` | Member + Guest (public) | Shared, donate button gated by auth |
| `CauseDetailScreen` | Member + Guest (public) | Shared, action gated by auth |

---

## 🧩 SHARED COMPONENTS — Status

These components are referenced in all 4 BRDs and should live in `core/components/common/`:

| Component | BRD Spec Name | Actual File | Status |
|---|---|---|---|
| Button | Button.tsx | `AppButton.tsx` | ✅ Done |
| Input | Input.tsx | `AppInput.tsx` | ✅ Done |
| Card | Card.tsx | `AppCard.tsx` | ✅ Done |
| Badge | Badge.tsx | `AppBadge.tsx` | ✅ Done |
| Avatar | Avatar.tsx | `AppAvatar.tsx` | ✅ Done |
| Loader | Loader.tsx | `AppSkeleton.tsx` | ✅ Done |
| EmptyState | EmptyState.tsx | `AppEmptyState.tsx` | ✅ Done |
| Modal | Modal.tsx | `AppModal.tsx` | ✅ Done |
| BottomSheet | — | `AppBottomSheet.tsx` | ✅ Done |
| ConfirmDialog | ConfirmDialog.tsx | `ConfirmDialog.tsx` | ✅ Done |
| Toast/Feedback | Toast.tsx | `AppFeedbackModal.tsx` | ✅ Done |
| Skeleton | SkeletonCard.tsx | `AppSkeleton.tsx` | ✅ Done |
| DatePicker | FormDatePicker.tsx | `AppDatePickerInput.tsx` + `DatePickerModal.tsx` | ✅ Done ✨ |
| DocumentUpload | DocumentUpload.tsx | `AppMediaUploadSheet.tsx` | ✅ Done |
| SearchBar | — | `AppSearchBar.tsx` | ✅ Done |
| ProgressBar | ProgressBar.tsx | ❌ Missing | ❌ Not built |
| NetworkBanner | NetworkBanner.tsx | ❌ Missing | ❌ Not built |
| StepProgress | StepProgress.tsx | ❌ Missing | ❌ Not built |
| MembershipCard | MembershipCard.tsx | ❌ Missing | ❌ Not built (flip animation) |
| CategoryCard | CategoryCard.tsx | ❌ Missing | ❌ Not built |
| StatusTimeline | StatusTimeline.tsx | ❌ Missing | ❌ Not built |
| DataTable | DataTable.tsx | ❌ Missing | ❌ Not built (Admin) |
| FilterModal | FilterModal.tsx | ❌ Missing | ❌ Not built (Admin) |

**Components: 14/22 ✅ | 8 missing ❌**

---

## 📋 BUILD PRIORITY ORDER

### Phase 1 — Complete Admin (2 screens)
1. `AdminMembershipApprovalsScreen` — approve/reject queue with KYC docs
2. `AdminRolesPermissionsScreen` — RBAC management

### Phase 2 — Shared Components (needed by Member + Seeker)
3. `ProgressBar` — cause funding bar + membership progress
4. `StepProgress` — multi-step form indicator (3–4 steps)
5. `StatusTimeline` / `TimelineStepper` — aid application tracker
6. `MembershipCard` — flip card with QR
7. `NetworkBanner` — offline indicator

### Phase 3 — Member Role (19 screens, build in order)
8. `MembershipCategoriesScreen`
9. `MembershipApplyStep1/2/3Screen`
10. `MembershipCardScreen`
11. `RenewalScreen`
12. `CauseListScreen` + `CauseDetailScreen` (shared with Guest)
13. `DonationCheckoutScreen` + `PaymentSuccessScreen`
14. `DonationHistoryScreen`
15. `ReceiptsListScreen` + `DocumentVaultScreen`
16. `TicketsListScreen` + `CreateTicketScreen` + `TicketChatScreen` (shared with Seeker)
17. `NotificationsScreen` (shared)

### Phase 4 — Seeker Role (using shared screens above)
18. `AidApplyScreen` (4-step wizard)
19. `AidTrackerScreen`
20. Seeker-specific `DocumentVaultScreen`

### Phase 5 — Guest Role
21. `GuestExploreScreen`
22. `GuestJoinScreen`
23. (Reuse shared `CauseListScreen` + `CauseDetailScreen`)

---

> **Legend**: ✅ Done | ⚠️ Partial | ❌ Not Started | ✨ Recently Added
