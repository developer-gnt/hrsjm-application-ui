# HRSJM Admin Mobile App --- Sahil Development Specification

**Project:** HRSJM Digital Membership & Donation Platform\
**Platform:** React Native CLI --- Android + iOS\
**Language:** TypeScript\
**Backend:** `HRSJM-back-api` --- `/api/v1`\
**Developer:** Sahil --- Donations / Receipt Center / Donation
Operations\
**BRD Version:** 1.0.0 --- September 2026

------------------------------------------------------------------------

# 1. Purpose

This document defines Sahil's complete frontend implementation scope for
the HRSJM Admin mobile application.

Sahil owns the **Donation Management and generated Receipt/Donation
Operations UI**.

The work includes:

``` text
Donation Dashboard
Donation List
Donation Details
Donation Search
Donation Filters
Donation Status
Donation Receipt Center
Receipt Preview
Receipt Download/Share
Donation Statistics
Donation API Integration
Loading / Empty / Error states
Permission-aware actions
Android + iOS testing
```

The backend already exists.

Sahil must integrate with the existing backend and must use the shared
API/auth/permission infrastructure created by Mubasshir.

------------------------------------------------------------------------

# 2. Important Scope Boundary

There are two different receipt concepts in the Admin BRD.

## A. Donation / Member Receipt Center

This belongs to **Sahil**.

Examples:

``` text
Donation receipt
Membership payment receipt
Generated receipt
Receipt preview
Receipt download/share
```

## B. Manual Receipt Voucher

This belongs to **Mubasshir**.

Examples:

``` text
Manual receipt entry
Income account
Bank/Cash account
Accounting journal
Receipt voucher cancellation
Accounting reversal
```

Do NOT implement the manual accounting Receipt Voucher module inside
Sahil's feature.

------------------------------------------------------------------------

# 3. Sahil Ownership

``` text
SAHIL
│
├── Donations
│   ├── Donation List
│   ├── Donation Statistics
│   ├── Donation Details
│   ├── Search
│   ├── Filters
│   ├── Status
│   └── Donation Operations
│
└── Generated Receipts
    ├── Receipt List
    ├── Receipt Details
    ├── Receipt Preview
    ├── Download
    └── Share
```

------------------------------------------------------------------------

# 4. Architecture Rule

Sahil consumes shared infrastructure.

Correct:

``` text
Sahil Screen
    ↓
Sahil Hook
    ↓
Sahil Feature Service
    ↓
Shared API Client
    ↓
Auth / Refresh Interceptor
    ↓
HRSJM Backend
```

Incorrect:

``` text
Sahil Screen
    ↓
axios.get(...)
```

Do not create another:

``` text
API Client
Auth Client
Token Manager
Permission Manager
```

------------------------------------------------------------------------

# 5. Folder Architecture

``` text
src/features/admin/
│
├── donations/                         ← SAHIL
│   ├── screens/
│   │   ├── DonationsScreen.tsx
│   │   ├── DonationDetailsScreen.tsx
│   │   └── DonationReceiptScreen.tsx
│   │
│   ├── components/
│   │   ├── DonationStats.tsx
│   │   ├── DonationCard.tsx
│   │   ├── DonationRow.tsx
│   │   ├── DonationSearch.tsx
│   │   ├── DonationFilters.tsx
│   │   ├── DonationStatusBadge.tsx
│   │   ├── DonationAmount.tsx
│   │   ├── DonationSummary.tsx
│   │   └── DonationActions.tsx
│   │
│   ├── services/
│   │   └── donations.service.ts
│   │
│   ├── hooks/
│   │   ├── useDonations.ts
│   │   ├── useDonationDetails.ts
│   │   └── useDonationActions.ts
│   │
│   ├── types/
│   │   └── donations.types.ts
│   │
│   └── index.ts
│
└── receipts/                          ← SAHIL
    ├── screens/
    │   ├── ReceiptsScreen.tsx
    │   ├── ReceiptDetailsScreen.tsx
    │   └── ReceiptPreviewScreen.tsx
    │
    ├── components/
    │   ├── ReceiptCard.tsx
    │   ├── ReceiptSearch.tsx
    │   ├── ReceiptFilters.tsx
    │   ├── ReceiptStatusBadge.tsx
    │   ├── ReceiptHeader.tsx
    │   ├── ReceiptSummary.tsx
    │   └── ReceiptActions.tsx
    │
    ├── services/
    │   └── receipts.service.ts
    │
    ├── hooks/
    │   ├── useReceipts.ts
    │   └── useReceiptDetails.ts
    │
    ├── types/
    │   └── receipts.types.ts
    │
    └── index.ts
```

------------------------------------------------------------------------

# 6. Shared Components

Sahil must use the shared UI system created by Aman.

Examples:

``` text
AppButton
AppCard
AppBadge
AppAvatar
AppHeader
AppSearchBar
AppFilterButton
AppLoader
AppEmptyState
AppErrorState

AdminStatCard
AdminPageHeader
AdminStatusBadge
AdminFilterTabs
AdminFilterSheet
AdminActionMenu
AdminDataRow
AdminDateFilter
AdminAmount
ConfirmDialog
Toast
```

Do not create separate versions such as:

``` text
DonationButton
ReceiptButton
DonationSearchBar
DonationCardBase
```

unless the component has genuinely donation-specific behavior.

------------------------------------------------------------------------

# 7. Design System

All Sahil screens must follow the HRSJM Admin visual system.

``` text
Primary:        #1B3F8F
Primary Dark:   #0F2860
Primary Light:  #EBF1FF
Accent Gold:    #C9A227

Active:         #10B981
Expiring:       #F59E0B
Inactive:       #EF4444
Pending:        #3B82F6

Background:     #F5F7FA
Card:           #FFFFFF

Text Primary:   #0F172A
Text Secondary: #64748B
Text Muted:     #94A3B8

Border:         #E2E8F0
Divider:        #F1F5F9
```

Do not introduce a separate donation color theme.

------------------------------------------------------------------------

# 8. Typography

Use the shared Admin typography.

``` text
Screen Title:
22sp / Bold

Section:
17sp / SemiBold

Body:
14sp / Regular

Secondary:
12–13sp

Badge:
11sp / Medium

Button:
15sp / SemiBold

Amount / Metric:
20–24sp / Bold
```

Donation amounts should have stronger visual hierarchy than secondary
metadata.

------------------------------------------------------------------------

# 9. Donation Module

The Admin BRD defines:

``` text
Donations Management
Donation List
Donation Details
```

The supplied UI references use an operational Admin pattern:

``` text
Title
Statistics
Search
Filters
Status tabs
Donation list
Action menu
```

------------------------------------------------------------------------

# 10. Donations Screen

## Route

``` text
AdminDonations
```

## Folder

``` text
src/features/admin/donations/
```

## Layout

``` text
Donations

Manage and view donations.

[Total Donations]
[Total Amount]
[Pending]
[Completed]

[Search........................]
[Filters]

[All]
[Pending]
[Completed]
[Failed]

Donation Cards
```

The exact statistics must be based on the backend response. Do not
calculate financial totals from a paginated page unless the backend
explicitly provides enough data.

------------------------------------------------------------------------

# 11. Donation Statistics

Use:

``` text
AdminStatCard
```

Possible metrics:

``` text
Total Donations
Total Amount
Pending
Completed
```

Only show metrics supported by the backend.

Example:

``` text
┌───────────────┐
│ ₹12.5L        │
│ Total Amount  │
└───────────────┘
```

Amount should use the shared INR formatter.

------------------------------------------------------------------------

# 12. Donation Card

Each donation card should show:

``` text
Donor Name
Donation ID
Amount
Donation Type
Date
Payment Status
Receipt Status
Action
```

Example:

``` text
┌────────────────────────────────────┐
│ ○  Ahmed Khan                  ⋮  │
│                                    │
│ Donation #DON-10245                │
│ General Donation                   │
│                                    │
│ ₹5,000                             │
│ 28 Sep 2026                        │
│                                    │
│ [Completed]      [Receipt Ready]  │
└────────────────────────────────────┘
```

------------------------------------------------------------------------

# 13. Donation Details

## Route

``` text
DonationDetailsScreen
```

Structure:

``` text
Donation Header
    ↓
Donor Information
    ↓
Donation Information
    ↓
Payment Information
    ↓
Receipt Information
    ↓
Timeline
    ↓
Available Actions
```

------------------------------------------------------------------------

# 14. Donor Information

Display backend-provided information such as:

``` text
Donor Name
Email
Phone
Member ID
```

Do not display fields that the backend does not provide.

------------------------------------------------------------------------

# 15. Donation Information

Display:

``` text
Donation ID
Donation Type
Amount
Date
Purpose / Campaign
Anonymous status where supported
```

Amount:

``` text
₹1,000
₹10,000
₹1,25,000
```

Use the central currency formatter.

------------------------------------------------------------------------

# 16. Payment Information

Where available:

``` text
Payment ID
Payment Method
Payment Status
Transaction Reference
Payment Date
```

Do not expose sensitive payment credentials or secrets.

------------------------------------------------------------------------

# 17. Donation Status

Use backend status enums.

Possible UI states may include:

``` text
Pending
Completed
Failed
Cancelled
Refunded
```

Do not invent backend states.

Map backend enums to human-readable UI labels.

------------------------------------------------------------------------

# 18. Donation Search

Search should support backend-supported fields.

Potential search:

``` text
Donor Name
Donation ID
Payment ID
Phone
Email
```

Use:

``` text
AppSearchBar
```

Search must be debounced.

------------------------------------------------------------------------

# 19. Donation Filters

Possible filters:

``` text
Status
Date Range
Donation Type
Payment Method
Campaign / Purpose
Amount Range
```

Only implement filters supported by the backend.

Mobile UI:

``` text
[Search........................] [Filters]
```

Tap Filters:

``` text
┌──────────────────────────────┐
│ Filters                      │
│                              │
│ Status                       │
│ ○ All                        │
│ ○ Pending                    │
│ ○ Completed                  │
│ ○ Failed                     │
│                              │
│ Date Range                   │
│ [From]        [To]           │
│                              │
│ Donation Type                │
│ [Select]                     │
│                              │
│ [Clear]          [Apply]     │
└──────────────────────────────┘
```

------------------------------------------------------------------------

# 20. Donation Actions

Actions depend on backend permissions.

Possible actions:

``` text
View
View Receipt
Download Receipt
Share Receipt
```

Do not expose payment verification controls here if payment verification
belongs to Mubasshir's Payment Verification module.

Sahil should link to or refresh from the payment status rather than
duplicate payment verification logic.

------------------------------------------------------------------------

# 21. Donation API Integration

The Admin BRD defines a donation management area and identifies the
donation domain.

Before implementation, confirm the exact backend contract.

Required checklist:

``` text
[ ] GET donation list endpoint
[ ] GET donation details endpoint
[ ] Query params
[ ] Pagination
[ ] Search
[ ] Filters
[ ] Donation status enum
[ ] Payment status enum
[ ] Receipt status
[ ] Permission
```

If the backend contract differs from the BRD route naming, use the
implemented backend route.

Never create a mock endpoint in the mobile app.

------------------------------------------------------------------------

# 22. Receipt Center

Sahil owns the **generated receipt experience** associated with
donations and membership payments.

This is not the accounting Receipt Voucher module.

Folder:

``` text
src/features/admin/receipts/
```

------------------------------------------------------------------------

# 23. Receipts Screen

## Route

``` text
AdminReceipts
```

UI:

``` text
Receipts

[Search receipt number, donor/member...]

[All]
[Generated]
[Failed]

Receipt Cards
```

Card:

``` text
Receipt #RCP-10245

Donor:
Ahmed Khan

Amount:
₹5,000

Type:
Donation

Generated:
28 Sep 2026

[View]
```

------------------------------------------------------------------------

# 24. Receipt Details

Structure:

``` text
Receipt Header
    ↓
Receipt Number
    ↓
Donor Details
    ↓
Payment / Donation Details
    ↓
Amount
    ↓
Date
    ↓
80G information where provided
    ↓
Receipt Actions
```

Do not fabricate 80G/tax information. Render it only when returned by
the backend.

------------------------------------------------------------------------

# 25. Receipt Preview

Receipt preview should resemble the actual generated document.

``` text
┌──────────────────────────────────┐
│              HRSJM               │
│ Human Rights & Social Justice    │
│                                  │
│             RECEIPT              │
│                                  │
│ Receipt No: RCP-10245            │
│ Date: 28 Sep 2026                │
│                                  │
│ Received from: Ahmed Khan        │
│ Amount: ₹5,000                   │
│                                  │
│ Donation Type: General           │
│ Payment Reference: XXXXX         │
│                                  │
│ [Download] [Share]               │
└──────────────────────────────────┘
```

The actual receipt layout must follow the backend/generated document or
approved design.

------------------------------------------------------------------------

# 26. Receipt Download

When the backend provides a PDF/document:

``` text
Tap Download
     ↓
Request document
     ↓
Loading
     ↓
Save/open/share according to platform capability
```

Android and iOS must both be supported.

Do not permanently cache sensitive documents unless required.

------------------------------------------------------------------------

# 27. Receipt Share

Use the native platform share mechanism.

``` text
Receipt
  ↓
Share
  ↓
Android Share Sheet / iOS Share Sheet
```

Do not implement separate custom social-sharing screens.

------------------------------------------------------------------------

# 28. Receipt API Integration

Confirm:

``` text
Receipt list endpoint
Receipt details endpoint
Receipt document/PDF endpoint
Receipt status
Download authorization
```

The Admin BRD references receipt APIs in the wider Admin flow. Use the
exact backend implementation.

------------------------------------------------------------------------

# 29. Receipt Status

Possible presentation:

``` text
Generated
Pending
Failed
```

Only use statuses supplied by the backend.

Use:

``` text
AdminStatusBadge
```

------------------------------------------------------------------------

# 30. Donation and Receipt Relationship

Correct flow:

``` text
Donation
   │
   ├── Payment Status
   │
   └── Receipt
          │
          ├── View
          ├── Download
          └── Share
```

Do not make Receipt a separate unrelated financial transaction.

------------------------------------------------------------------------

# 31. Accounting Boundary

Sahil does NOT implement:

``` text
Chart of Accounts
General Ledger
Journal Entries
Manual Receipt Voucher
Expense Voucher
Trial Balance
P&L
Balance Sheet
```

Those belong to Mubasshir.

Sahil's receipt screen only displays the generated receipt associated
with the underlying transaction.

------------------------------------------------------------------------

# 32. Payment Verification Boundary

Sahil does NOT own:

``` text
Payment Verification
Verify Payment
Payment Status Mutation
Accounting Journal Creation
Payment Reconciliation
```

Those are owned by Mubasshir.

Sahil may:

``` text
Display payment status
Display payment reference
Navigate to payment details where assigned
Refresh donation state
```

------------------------------------------------------------------------

# 33. Permissions

Use the centralized permission service.

Potential permissions from the backend catalog should be confirmed
before coding.

Typical mapping:

``` text
donation.read
donation.manage
receipt.read
receipt.download
```

These are examples only unless they exactly match the backend permission
names.

Never create frontend-only permissions that do not exist in the backend
authorization model.

------------------------------------------------------------------------

# 34. Permission-Based UI

Example:

``` tsx
{can('receipt.read') && (
  <AppButton
    title="View Receipt"
    onPress={handleViewReceipt}
  />
)}
```

For download:

``` tsx
{can('receipt.download') && (
  <AppButton
    title="Download"
    onPress={handleDownload}
  />
)}
```

The backend remains authoritative.

------------------------------------------------------------------------

# 35. Loading States

Every API-driven screen must provide:

``` text
Initial loading
Refresh loading
Pagination loading
Action loading
Document loading
```

Donation list:

``` text
Skeleton donation cards
```

Receipt PDF:

``` text
Document loader
```

Download:

``` text
Button spinner
```

------------------------------------------------------------------------

# 36. Empty States

Donation list:

``` text
No Donations Found

Try changing your search or filters.

[Clear Filters]
```

Receipt list:

``` text
No Receipts Found

Generated receipts will appear here.
```

------------------------------------------------------------------------

# 37. Error States

Donation:

``` text
Unable to load donations.

[Retry]
```

Receipt:

``` text
Unable to load receipt.

[Retry]
```

Document:

``` text
Unable to open receipt.

[Retry]
```

Do not show raw API stack traces.

------------------------------------------------------------------------

# 38. Pagination

Donation and receipt lists may become large.

Use:

``` text
FlatList
Pagination
Pull-to-refresh
Load more
```

Do not load thousands of records into memory.

Example:

``` text
Page 1
 ↓
User reaches bottom
 ↓
Load Page 2
 ↓
Append
```

Avoid duplicate records when refreshing or loading more.

------------------------------------------------------------------------

# 39. Search Performance

Use debouncing.

``` text
Input
 ↓
Debounce
 ↓
Query
 ↓
API
```

Do not request the server for every keystroke.

------------------------------------------------------------------------

# 40. Financial Amount Formatting

Create/use:

``` text
formatINR()
```

Examples:

``` text
₹500
₹5,000
₹1,25,000
₹10,00,000
```

Never manually format amounts in each screen.

------------------------------------------------------------------------

# 41. Date Formatting

Use the shared date utility.

Preferred display:

``` text
28 Sep 2026
28 Sep 2026, 10:30 AM
```

Use one date format across donations and receipts.

------------------------------------------------------------------------

# 42. Security Rules

Donation and receipt information can contain personal/financial data.

Do not:

``` text
console.log(full donor object)
console.log(payment object)
console.log(receipt URL)
console.log access tokens
```

Do not expose:

``` text
Card details
Payment secrets
Private document tokens
```

Use secure backend-provided document access.

------------------------------------------------------------------------

# 43. Android Requirements

Test:

``` text
Donation list
Donation filters
Donation details
Receipt preview
PDF/document opening
Download
Share Sheet
Back button
Pull-to-refresh
Pagination
```

------------------------------------------------------------------------

# 44. iOS Requirements

Test:

``` text
Donation list
Donation filters
Donation details
Receipt preview
PDF/document opening
Download/share
Safe area
Navigation gestures
Pull-to-refresh
Pagination
```

------------------------------------------------------------------------

# 45. Responsive Rules

Support:

``` text
Small Android
Large Android
Small iPhone
Large iPhone
```

Do not hardcode device dimensions.

Use:

``` text
flex
useWindowDimensions
SafeArea
responsive spacing
```

------------------------------------------------------------------------

# 46. Donation UI Design

The visual hierarchy should prioritize:

``` text
1. Donor
2. Amount
3. Donation status
4. Date
5. Donation type
6. Receipt status
7. Secondary metadata
```

Example:

``` text
Ahmed Khan
₹5,000

Completed
General Donation

28 Sep 2026
Receipt Ready
```

------------------------------------------------------------------------

# 47. Receipt UI Design

Priority:

``` text
Receipt Number
Amount
Donor
Date
Donation Type
Payment Reference
```

Primary actions:

``` text
View
Download
Share
```

Do not overload the receipt screen with unrelated accounting controls.

------------------------------------------------------------------------

# 48. State Management

Server state:

``` text
Donations
Donation Details
Receipts
Receipt Details
```

should use the project's agreed server-state/query mechanism.

Local UI state:

``` text
Search
Filters
Modal
Selected donation
Selected receipt
```

should remain local to the feature where possible.

------------------------------------------------------------------------

# 49. Recommended Hooks

``` text
useDonations()
useDonationDetails(id)
useDonationFilters()

useReceipts()
useReceiptDetails(id)
```

Mutations:

``` text
useDonationAction()
useReceiptDownload()
```

Only create mutation hooks for backend operations that actually exist.

------------------------------------------------------------------------

# 50. Service Layer

Example:

``` text
donations.service.ts

getDonations()
getDonationById()
```

``` text
receipts.service.ts

getReceipts()
getReceiptById()
getReceiptDocument()
```

Do not place HTTP calls directly in screens.

------------------------------------------------------------------------

# 51. Type Architecture

Create feature types:

``` text
Donation
DonationListItem
DonationDetails
DonationQuery
DonationStatus

Receipt
ReceiptListItem
ReceiptDetails
ReceiptQuery
ReceiptStatus
```

Use backend response shapes as the source of truth.

Do not silently rename backend fields in the service unless a deliberate
view-model transformation is required.

------------------------------------------------------------------------

# 52. Component Tests

Test:

``` text
DonationCard
DonationStatusBadge
DonationStats
DonationFilters
ReceiptCard
ReceiptPreview
ReceiptActions
```

Test states:

``` text
Normal
Loading
Disabled
Error
Empty
Permission restricted
```

------------------------------------------------------------------------

# 53. Integration Tests

Donation:

``` text
List loads
Search works
Filters work
Pagination works
Details opens
Refresh works
```

Receipt:

``` text
Receipt list loads
Details opens
Preview loads
Download works
Share opens
```

------------------------------------------------------------------------

# 54. Git Branches

Use:

``` text
feature/sahil/donations
feature/sahil/receipts
feature/sahil/donation-ui
```

Recommended sequence:

``` text
donation-ui
    ↓
donations
    ↓
receipts
    ↓
download/share
    ↓
final integration
```

------------------------------------------------------------------------

# 55. Commit Convention

``` text
feat(donations): implement donation list
feat(donations): add donation filters
feat(donations): add donation details
feat(receipts): implement receipt list
feat(receipts): add receipt preview
feat(receipts): add receipt download
feat(receipts): add native sharing
fix(donations): fix pagination duplication
test(donations): add donation card tests
```

------------------------------------------------------------------------

# 56. Pull Request Requirements

Every PR must contain:

``` text
Summary
Screens implemented
Components added
API endpoints
Permissions
Testing
Android status
iOS status
Screenshots
Known issues
```

Example:

``` text
## Summary
Implemented Donation Management.

## Screens
Donations
Donation Details

## APIs
<actual backend endpoints>

## Permissions
<actual backend permissions>

## Testing
Android: PASS
iOS: PASS
TypeScript: PASS
```

------------------------------------------------------------------------

# 57. Definition of Done

A module is complete only when:

``` text
[ ] UI matches approved design
[ ] API integrated
[ ] Correct backend types
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Search
[ ] Filters
[ ] Pagination
[ ] Pull-to-refresh
[ ] Permission-aware actions
[ ] Success feedback
[ ] Failure feedback
[ ] Navigation
[ ] Android tested
[ ] iOS tested
[ ] Accessibility
[ ] Component tests
[ ] TypeScript clean
[ ] ESLint clean
[ ] No debug logs
[ ] PR reviewed
```

------------------------------------------------------------------------

# 58. Development Sequence

## Phase 1 --- Donation Foundation

``` text
1. Donation types
2. Donation service
3. Donation hook
4. Donation list
5. Donation card
6. Statistics
7. Search
8. Filters
9. Pagination
10. Details
```

## Phase 2 --- Receipt Center

``` text
1. Receipt types
2. Receipt service
3. Receipt list
4. Receipt details
5. Receipt preview
6. Document loading
7. Download
8. Share
```

## Phase 3 --- Integration

``` text
1. Navigation
2. Permission checks
3. Loading/error states
4. Android test
5. iOS test
6. Component tests
7. API contract verification
8. PR
```

------------------------------------------------------------------------

# 59. Dependencies

Sahil depends on:

## Mubasshir

``` text
API client
Auth/session
Permission helper
Navigation infrastructure
Backend API contracts
```

## Aman

``` text
Theme
AppCard
AppButton
AppSearchBar
AdminStatCard
AdminStatusBadge
AdminFilterSheet
AdminPageHeader
AdminAmount
AppEmptyState
AppErrorState
```

Sahil should consume these components rather than create replacements.

------------------------------------------------------------------------

# 60. Important Collaboration Boundary

If Sahil needs a shared component that does not exist:

``` text
Sahil identifies requirement
        ↓
Tell Aman
        ↓
Aman adds reusable component
        ↓
Sahil consumes component
```

If Sahil finds a backend/API problem:

``` text
Sahil identifies contract issue
        ↓
Tell Mubasshir
        ↓
Backend/API contract confirmed
        ↓
Sahil updates service
```

Do not silently work around backend problems with hardcoded/mock data.

------------------------------------------------------------------------

# 61. API Contract Checklist

Before implementation:

``` text
[ ] Donation endpoint confirmed
[ ] Donation details endpoint confirmed
[ ] Search params confirmed
[ ] Filter params confirmed
[ ] Pagination confirmed
[ ] Donation statuses confirmed
[ ] Receipt endpoint confirmed
[ ] Receipt details confirmed
[ ] Receipt document endpoint confirmed
[ ] Download authorization confirmed
[ ] Permission confirmed
[ ] Error format confirmed
```

------------------------------------------------------------------------

# 62. Final Sahil Folder Map

``` text
src/features/admin/
│
├── donations/
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types/
│
└── receipts/
    ├── screens/
    ├── components/
    ├── services/
    ├── hooks/
    └── types/
```

------------------------------------------------------------------------

# 63. Final Sahil Responsibility Matrix

  Module                  UI            API   Search    Filters   Details   Documents   Testing
  --------------------- ---- -------------- -------- ---------- --------- ----------- ---------
  Donations               ✅             ✅       ✅         ✅        ✅         ---        ✅
  Donation Operations     ✅             ✅      ---        ---        ✅         ---        ✅
  Generated Receipts      ✅             ✅       ✅   Optional        ✅          ✅        ✅
  Receipt Preview         ✅             ✅      ---        ---        ✅          ✅        ✅
  Receipt Download        ✅             ✅      ---        ---       ---          ✅        ✅
  Receipt Share           ✅   Platform/API      ---        ---       ---          ✅        ✅

------------------------------------------------------------------------

# 64. What Sahil Does NOT Own

Sahil must not implement:

``` text
Authentication
Token Refresh
Global API Client
Global RBAC
Admin Dashboard
Payment Verification
Expense Vouchers
Manual Receipt Vouchers
Accounting
General Ledger
Journal Entries
Financial Reports
Membership Management
Applications
Assistance
Support
Notifications
Settings
```

Those belong to the other developers.

------------------------------------------------------------------------

# 65. Final Objective

> **Sahil's objective is to deliver a complete, production-ready Admin
> donation and generated-receipt experience for Android and iOS,
> integrated with the existing HRSJM backend and using the shared HRSJM
> UI, API, authentication and permission architecture.**

The key rules are:

``` text
Use shared infrastructure.
Use shared UI components.
Do not duplicate payment verification.
Do not duplicate accounting receipt vouchers.
Do not invent backend APIs.
Keep donation and accounting domains separate.
Build for Android + iOS from the same React Native codebase.
```
