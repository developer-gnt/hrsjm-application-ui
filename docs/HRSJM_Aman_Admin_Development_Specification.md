# HRSJM Admin Mobile App --- Aman Development Specification

**Project:** HRSJM Digital Membership & Donation Platform\
**Platform:** React Native CLI --- Android + iOS\
**Language:** TypeScript\
**Backend:** `HRSJM-back-api` --- `/api/v1`\
**Developer:** Aman --- Frontend Lead / UI System / Core Admin Features\
**BRD Version:** 1.0.0 --- September 2026

------------------------------------------------------------------------

# 1. Purpose

This document defines Aman's complete ownership for the HRSJM Admin
mobile application.

Aman owns the **shared frontend UI foundation** and the core Admin
user-facing modules:

``` text
UI/UX Design System
Shared Components
Navigation UI
Members
Membership
Applications
KYC UI
Membership Card
Renewal UI

```

The implementation must work from the same React Native codebase for:

``` text
Android
iOS
```

The Admin BRD defines a React Native CLI TypeScript application, a
five-tab Admin navigation, the Admin visual system,
Members/Membership/Application screens, and reusable UI components.

------------------------------------------------------------------------

# 2. Aman Ownership

``` text
AMAN
│
├── 1. Design System
├── 2. Theme
├── 3. Typography
├── 4. Shared Components
├── 5. Admin Components
├── 6. Navigation UI
├── 7. Members
├── 8. Membership
├── 9. Applications
├── 10. KYC UI
├── 11. Digital Membership Card UI
└── 12. Renewal UI
```

Mubasshir owns the API/auth/RBAC infrastructure. Aman consumes that
infrastructure and must not create a second API client, token system, or
permission system.

------------------------------------------------------------------------

# 3. Product UI Direction

The supplied Admin screenshots establish the following visual direction:

``` text
Modern NGO / Enterprise Admin
Clean
Professional
Compact
Information-dense
White cards
Deep navy branding
Soft status colors
Rounded controls
Minimal shadows
Clear typography hierarchy
Mobile-first data presentation
```

The Admin BRD defines:

``` text
Primary:       #1B3F8F
Primary Dark:  #0F2860
Primary Light: #EBF1FF
Gold:          #C9A227

Active:        #10B981
Expiring:      #F59E0B
Inactive:      #EF4444
Pending:       #3B82F6

Background:    #F5F7FA
Card:          #FFFFFF

Text Primary:  #0F172A
Text Secondary:#64748B
Text Muted:    #94A3B8

Border:        #E2E8F0
Divider:       #F1F5F9
```

Do not introduce a different color palette inside Aman's modules.

------------------------------------------------------------------------

# 4. Typography

Use the project's Admin typography specification.

``` text
Font:
Inter / Poppins

Screen Title:
22sp / Bold

Section Header:
17sp / SemiBold

Body:
14sp / Regular

Secondary:
12–13sp

Badge / Caption:
11sp / Medium

Button:
15sp / SemiBold

Metric:
20–24sp / Bold
```

The visual hierarchy must remain consistent between Members,
Applications, Membership and all shared components.

------------------------------------------------------------------------

# 5. Spacing System

Use a consistent spacing scale rather than arbitrary values.

Recommended base:

``` text
4
8
12
16
20
24
32
```

Typical usage:

``` text
Screen horizontal padding: 16
Card padding:              12–16
Section spacing:           16–24
Input vertical spacing:    12
Button height:             44–48
Bottom navigation height:  platform-safe
```

Do not use random spacing such as 13, 19, 27 throughout the application
unless required by the design.

------------------------------------------------------------------------

# 6. Border Radius

Use a small consistent radius system.

``` text
Small controls:  8
Cards:           10–12
Inputs:          8–10
Buttons:         8–10
Bottom sheets:   16–20
Avatars:         999
```

The screenshots use rounded cards, filters, buttons and status badges.

------------------------------------------------------------------------

# 7. Shadow / Elevation

The design is intentionally clean and should not use heavy shadows.

Use:

``` text
Cards:
Very subtle elevation

Bottom Sheet:
Moderate elevation

Modal:
Moderate elevation

Buttons:
Usually no heavy shadow
```

Prefer borders and surface contrast over strong shadows.

------------------------------------------------------------------------

# 8. Global Admin Header

Aman owns the visual implementation of the shared Admin header.

Visual pattern:

``` text
┌─────────────────────────────────────┐
│ ☰   HRSJM       🔔 3      👤  ˅    │
└─────────────────────────────────────┘
```

Header contains:

``` text
Menu button
HRSJM logo
Notification button
Notification count
Profile avatar
Profile dropdown/action
```

Component:

``` text
src/core/components/common/AppHeader.tsx
```

Aman owns its UI.

Mubasshir owns authentication/session behavior behind the profile/logout
actions.

------------------------------------------------------------------------

# 9. Admin Page Header

Create a reusable:

``` text
AdminPageHeader.tsx
```

Example:

``` text
Members                         + Add Member
Manage and view all registered members.
```

Props should support:

``` typescript
type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionPermission?: string;
};
```

Permission visibility should use Mubasshir's shared permission helper
rather than implementing permission logic locally.

------------------------------------------------------------------------

# 10. Admin Bottom Navigation

The Admin BRD specifies five primary tabs:

``` text
Dashboard
Members
Applications
Complaints
More
```

Visual:

``` text
┌───────────────────────────────────────┐
│  🏠       👥       📄       💬      ▦ │
│Dashboard Members Applications Complaints More
└───────────────────────────────────────┘
```

Active:

``` text
#1B3F8F
```

Inactive:

``` text
#94A3B8
```

Navigation UI ownership:

``` text
Aman
```

Navigation/session/permission infrastructure:

``` text
Mubasshir
```

Do not duplicate navigation implementations inside feature modules.

------------------------------------------------------------------------

# 11. More Menu UI

The More menu should provide access to secondary Admin modules.

Current BRD-defined items include:

``` text
Financial Reports
Accounting Ledger
Expense Vouchers
Receipt Vouchers
Donations Management
Roles & Permissions
Settings & Profile
```

Additional modules can be added through the shared navigator without
changing the bottom navigation structure.

Aman's responsibility is the **visual menu component**, not the business
logic of those modules.

------------------------------------------------------------------------

# 12. Shared Component Architecture

Aman is the owner of the shared UI component library.

``` text
src/core/components/
│
├── common/
│   ├── AppButton.tsx
│   ├── AppIconButton.tsx
│   ├── AppInput.tsx
│   ├── AppTextArea.tsx
│   ├── AppCard.tsx
│   ├── AppBadge.tsx
│   ├── AppAvatar.tsx
│   ├── AppHeader.tsx
│   ├── AppSearchBar.tsx
│   ├── AppFilterButton.tsx
│   ├── AppDivider.tsx
│   ├── AppLoader.tsx
│   ├── AppEmptyState.tsx
│   ├── AppErrorState.tsx
│   └── AppProgressBar.tsx
│
├── admin/
│   ├── AdminStatCard.tsx
│   ├── AdminPageHeader.tsx
│   ├── AdminSectionHeader.tsx
│   ├── AdminStatusBadge.tsx
│   ├── AdminFilterTabs.tsx
│   ├── AdminFilterSheet.tsx
│   ├── AdminActionMenu.tsx
│   ├── AdminDataRow.tsx
│   ├── AdminDataList.tsx
│   ├── AdminDateFilter.tsx
│   ├── AdminAmount.tsx
│   └── AdminPagination.tsx
│
├── forms/
│   ├── FormInput.tsx
│   ├── FormSelect.tsx
│   ├── FormDatePicker.tsx
│   ├── FormTextArea.tsx
│   ├── DocumentUpload.tsx
│   └── StepProgress.tsx
│
└── feedback/
    ├── AppModal.tsx
    ├── AppBottomSheet.tsx
    ├── ConfirmDialog.tsx
    ├── Toast.tsx
    ├── SkeletonCard.tsx
    └── NetworkBanner.tsx
```

------------------------------------------------------------------------

# 13. Shared Component Rules

Every shared component must be:

``` text
Reusable
Typed
Responsive
Accessible
Theme-aware
Platform-safe
```

Do not create:

``` text
MemberButton.tsx
ApplicationButton.tsx
DonationButton.tsx
PaymentButton.tsx
```

when `AppButton.tsx` can support the required variant.

Instead:

``` tsx
<AppButton
  title="Approve"
  variant="primary"
/>
```

------------------------------------------------------------------------

# 14. AppButton Specification

Variants:

``` text
primary
secondary
outline
danger
success
ghost
```

States:

``` text
normal
pressed
disabled
loading
```

Example:

``` tsx
<AppButton
  title="Add Member"
  variant="primary"
  onPress={handleAdd}
/>
```

The visual style must match the deep navy HRSJM design.

------------------------------------------------------------------------

# 15. AppInput Specification

Support:

``` text
label
placeholder
value
error
helperText
leftIcon
rightIcon
secureTextEntry
keyboardType
disabled
```

Visual states:

``` text
default
focused
error
disabled
```

Focus should use the primary brand color.

------------------------------------------------------------------------

# 16. AdminStatCard

The screenshots consistently use compact four-card statistics.

Example:

``` text
┌─────────────────┐
│ 👥              │
│ 2,486            │
│ Total Members    │
└─────────────────┘
```

Variants:

``` text
primary
success
warning
danger
```

Component:

``` text
AdminStatCard.tsx
```

Props:

``` typescript
type AdminStatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'danger';
};
```

------------------------------------------------------------------------

# 17. AdminStatusBadge

Use a single reusable status component.

Examples:

``` text
Active
Expiring Soon
Inactive
Pending
Under Review
Approved
Rejected
Draft
Published
Archived
```

Do not create different badge components for every status.

------------------------------------------------------------------------

# 18. Search Component

Screenshots show:

``` text
┌────────────────────────────────┐
│ 🔍 Search by name, member ID...│
└────────────────────────────────┘
```

Component:

``` text
AppSearchBar.tsx
```

Requirements:

``` text
Debounced input
Clear button
Search icon
Keyboard-aware
Responsive width
```

The feature owns the search query/state; the shared component owns the
visual behavior.

------------------------------------------------------------------------

# 19. Filter UI

On mobile:

``` text
Search                    Filters
```

Filter opens a bottom sheet/modal.

Common filter controls:

``` text
Status
Date range
Category
City
Membership category
```

Component:

``` text
AdminFilterSheet.tsx
```

------------------------------------------------------------------------

# 20. Data List Pattern

The supplied UI references are dense mobile admin lists.

Use:

``` text
Desktop/table concept
        ↓
Mobile card/list representation
```

Do not force a wide desktop table onto a phone.

Example Member Row:

``` text
┌────────────────────────────────────┐
│ ○  Aman Shaikh                 ⋮  │
│    +91 98765 43210                │
│    aman@gmail.com                  │
│                                    │
│    HRSJM202600123                  │
│    Valid till: 15 Sep 2027         │
│                            Active  │
└────────────────────────────────────┘
```

------------------------------------------------------------------------

# 21. Aman Folder Ownership

``` text
src/
│
├── app/
│   └── navigation/
│
├── core/
│   ├── components/
│   └── theme/
│
└── features/admin/
    │
    ├── members/
    ├── membership/
    └── applications/
```

Aman should not modify:

``` text
src/core/api/
src/core/storage/
src/core/permissions/
```

unless coordinated with Mubasshir.

------------------------------------------------------------------------

# 22. Members Module

This module corresponds to the supplied **Members** UI.

## Folder

``` text
src/features/admin/members/
│
├── screens/
│   ├── MembersScreen.tsx
│   ├── MemberDetailsScreen.tsx
│   ├── AddMemberScreen.tsx
│   └── EditMemberScreen.tsx
│
├── components/
│   ├── MemberStats.tsx
│   ├── MemberSearch.tsx
│   ├── MemberFilterTabs.tsx
│   ├── MemberRow.tsx
│   ├── MemberCard.tsx
│   ├── MemberActions.tsx
│   └── MemberStatusBadge.tsx
│
├── services/
│   └── members.service.ts
│
├── hooks/
│   └── useMembers.ts
│
├── types/
│   └── members.types.ts
│
└── index.ts
```

------------------------------------------------------------------------

# 23. Members Screen UI

Header:

``` text
Members                         + Add Member
Manage and view all registered members.
```

Statistics:

``` text
Total Members
Active
Expiring Soon
Inactive
```

Search:

``` text
Search by name, member ID, phone or email
```

Filters:

``` text
All
Active
Expiring Soon
Inactive
```

List:

``` text
Member
Membership ID
Valid Till
Status
Actions
```

------------------------------------------------------------------------

# 24. Members Row

Each row/card should contain:

``` text
Avatar
Full Name
Phone
Email
Membership ID
Join Date
Valid Till
Days Remaining
Status
More Actions
```

Actions defined in the BRD:

``` text
View Profile
Edit
Activate
Deactivate
Reset Password
```

Bulk actions:

``` text
Activate Selected
Deactivate Selected
```

------------------------------------------------------------------------

# 25. Members Filters

The BRD specifies:

``` text
Status
Date Range
Category
City
```

Filter flow:

``` text
Tap Filters
    ↓
Bottom Sheet
    ↓
Select values
    ↓
Apply
    ↓
Refresh list
```

Provide:

``` text
Apply
Clear
```

------------------------------------------------------------------------

# 26. Members API Integration

The backend service is owned by the feature but must use Mubasshir's
central API client.

Example folder:

``` text
members/services/members.service.ts
```

Expected BRD endpoint:

``` text
GET /api/v1/users?page=1&limit=20
```

Permission:

``` text
user.read
user.manage_status
```

The exact backend response type must match the implemented API.

Do not invent fields.

------------------------------------------------------------------------

# 27. Members Loading / Empty / Error

Loading:

``` text
Skeleton Member Rows
```

Empty:

``` text
No Members Found

Try changing your search or filters.

[Clear Filters]
```

Error:

``` text
Unable to load members.

[Retry]
```

Pull-to-refresh must be supported.

------------------------------------------------------------------------

# 28. Add Member

Route:

``` text
AddMemberScreen
```

UI:

``` text
Add Member

Personal Information
--------------------
Full Name
Email
Phone
Date of Birth

Membership
--------------------
Membership Category

Account
--------------------
Password / invitation flow as defined by backend

[Create Member]
```

Do not invent fields that the backend does not support.

------------------------------------------------------------------------

# 29. Member Details

Layout:

``` text
Profile Header
Avatar
Full Name
Member ID
Status

Contact
Phone
Email

Membership
Category
Joined Date
Valid Till

Documents
KYC status

Actions
Edit
Activate/Deactivate
Reset Password
```

Use sections rather than one huge form.

------------------------------------------------------------------------

# 30. Membership Module

## Folder

``` text
src/features/admin/membership/
│
├── screens/
│   ├── MembershipCategoriesScreen.tsx
│   ├── MembershipApplyStep1Screen.tsx
│   ├── MembershipApplyStep2Screen.tsx
│   ├── MembershipApplyStep3Screen.tsx
│   ├── MembershipCardScreen.tsx
│   └── RenewalScreen.tsx
│
├── components/
│   ├── MembershipCategoryCard.tsx
│   ├── MembershipCard.tsx
│   ├── MembershipStatus.tsx
│   ├── KycDocumentCard.tsx
│   ├── RenewalCard.tsx
│   └── MembershipSummary.tsx
│
├── services/
│   └── membership.service.ts
│
├── hooks/
│   └── useMembership.ts
│
├── types/
│   └── membership.types.ts
│
└── index.ts
```

------------------------------------------------------------------------

# 31. Membership Category Selector

BRD:

``` text
GET /api/v1/membership-categories
```

Permission:

``` text
membership_category.read
```

UI:

``` text
Membership Categories

┌──────────────────────────┐
│ Annual Regular           │
│ ₹1,200                   │
│ Validity: 365 days       │
│ Active                   │
└──────────────────────────┘
```

Support:

``` text
Active
Inactive
Fee
Validity
Category Name
Category Code
```

------------------------------------------------------------------------

# 32. Membership Application

The Admin can create a membership on behalf of a user.

Use a step-based flow:

``` text
Step 1
Basic Information

Step 2
Membership Information

Step 3
KYC
```

Progress:

``` text
●──────○──────○
1      2      3
```

Do not create three unrelated forms.

Use one application flow with persisted state between steps.

------------------------------------------------------------------------

# 33. Membership Step 1

UI:

``` text
Membership Application

Step 1 of 3

Personal Information

Full Name
Email
Phone
Other backend-defined fields

[Continue]
```

Validation must occur before continuing.

------------------------------------------------------------------------

# 34. Membership Step 2

``` text
Step 2 of 3

Membership Details

Membership Category
Fee
Validity

Summary

[Back] [Continue]
```

Do not allow the UI to manually calculate authoritative fees if the
backend provides the fee.

------------------------------------------------------------------------

# 35. Membership Step 3 --- KYC

``` text
Step 3 of 3

KYC Documents

Document Type
Document Number
Upload Document

Uploaded documents

[Back] [Submit Application]
```

Component:

``` text
DocumentUpload.tsx
```

Support:

``` text
Camera
Gallery
Files
```

Actual available mechanisms must follow the selected React Native
libraries and platform permissions.

------------------------------------------------------------------------

# 36. KYC Document Card

``` text
┌─────────────────────────────────┐
│ Aadhaar / ID Document           │
│ Uploaded                        │
│ VERIFIED                        │
│                                 │
│ [View] [Replace]                │
└─────────────────────────────────┘
```

Status:

``` text
Pending
Verified
Rejected
```

------------------------------------------------------------------------

# 37. Digital Membership Card

Route:

``` text
MembershipCardScreen
```

UI:

``` text
┌─────────────────────────────────┐
│ HRSJM                           │
│ HUMAN RIGHTS & SOCIAL JUSTICE   │
│                                 │
│       MEMBER PHOTO              │
│                                 │
│ Aman Shaikh                     │
│ HRSJM202600123                  │
│                                 │
│ Category: Annual Regular        │
│ Valid Till: 15 Sep 2027         │
│                                 │
│ QR / backend-defined identifier │
└─────────────────────────────────┘
```

The Admin BRD says Admin can view any member's digital card and does not
own QR-code controls.

------------------------------------------------------------------------

# 38. Membership Card Actions

Depending on backend capability:

``` text
View
Share
Download
```

Do not add editing or ownership actions to the card.

------------------------------------------------------------------------

# 39. Renewal Screen

Route:

``` text
RenewalScreen
```

Purpose:

``` text
View renewal history per member
```

UI:

``` text
Renewal History

Current Membership
Category
Start Date
Expiry Date
Status

History
-------------------------
15 Sep 2026
Annual Regular
Approved

15 Sep 2025
Annual Regular
Approved
```

The Admin BRD defines this as a view-oriented screen.

------------------------------------------------------------------------

# 40. Applications Module

This corresponds directly to the supplied **Membership Applications**
screenshot.

## Folder

``` text
src/features/admin/applications/
│
├── screens/
│   ├── ApplicationsScreen.tsx
│   ├── ApplicationDetailsScreen.tsx
│   └── ApplicationReviewScreen.tsx
│
├── components/
│   ├── ApplicationStats.tsx
│   ├── ApplicationRow.tsx
│   ├── ApplicationCard.tsx
│   ├── ApplicationFilters.tsx
│   ├── ApplicationStatusBadge.tsx
│   ├── KycDocuments.tsx
│   ├── ApproveApplicationModal.tsx
│   └── RejectApplicationModal.tsx
│
├── services/
│   └── applications.service.ts
│
├── hooks/
│   └── useApplications.ts
│
├── types/
│   └── applications.types.ts
│
└── index.ts
```

------------------------------------------------------------------------

# 41. Applications Screen UI

Header:

``` text
Membership Applications                 + Add Member

Review, verify and manage membership applications.
```

Stats:

``` text
Total Applications
Under Review
Approved
Rejected
```

Search:

``` text
Search by name, application ID, phone or email
```

Filters:

``` text
All
Under Review
Approved
Rejected
```

------------------------------------------------------------------------

# 42. Application Row

Each row:

``` text
Avatar

Applicant Name
Membership Type
Application ID
Phone
Email

Status
Submitted Date/Time

Action
View
Review
Reconsider
```

Match the visual density of the supplied screenshot.

------------------------------------------------------------------------

# 43. Application Details

Structure:

``` text
Applicant Header
    ↓
Application Summary
    ↓
Personal Information
    ↓
Membership Information
    ↓
KYC Documents
    ↓
Application Timeline
    ↓
Review Actions
```

Actions:

``` text
Approve
Reject
Reconsider
```

Only display actions permitted by the backend permission state.

------------------------------------------------------------------------

# 44. Application Review

Review UI should make the decision explicit.

``` text
Application Review

Applicant
Membership
KYC Documents
Submitted Information

Review Notes

[Reject]
[Approve]
```

Reject should open a confirmation/modal with the required reason if the
backend requires it.

------------------------------------------------------------------------

# 45. KYC Document Viewer

Use a reusable viewer.

Requirements:

``` text
Image
PDF
Loading
Error
Zoom where supported
Close
```

For sensitive documents:

``` text
Do not cache unnecessarily
Do not log document URLs
Do not expose document tokens in analytics/logging
```

------------------------------------------------------------------------

# 46. Applications API Integration

The Admin BRD defines:

``` text
GET /api/v1/memberships?status=PENDING_APPROVAL
```

Permission:

``` text
membership.approve
membership.manage_status
```

The service should be:

``` text
applications.service.ts
```

All requests go through:

``` text
core/api/client.ts
```

------------------------------------------------------------------------

# 47. React Query / Server State

If the project uses TanStack Query, Aman should structure feature hooks
around it.

Example:

``` text
useMembers()
useMember()
useApplications()
useApplication()
useMembershipCategories()
useMembership()
```

Mutation examples:

``` text
useCreateMember()
useUpdateMember()
useApproveApplication()
useRejectApplication()
```

Keep server state out of unrelated global stores.

------------------------------------------------------------------------

# 48. Local UI State

Use local state for:

``` text
Search text
Selected filters
Modal visibility
Selected row
Current step
Expanded sections
Temporary form values
```

Do not place these into global auth/application state.

------------------------------------------------------------------------

# 49. Form State

For complex forms, use the project's agreed form library.

Recommended structure:

``` text
Screen
 ↓
Form
 ↓
Validation
 ↓
Feature service
 ↓
API client
```

Do not call the API directly from button components.

------------------------------------------------------------------------

# 50. UI State Standards

Every Aman screen must support:

``` text
Initial Loading
Refreshing
Submitting
Success
Empty
Error
Disabled
Permission Restricted
```

Examples:

``` text
Loading Members
→ skeleton rows

Submitting Application
→ button spinner + disabled state

No Applications
→ empty state

API Failure
→ error state + retry

Permission Missing
→ hide/disable action according to product behavior
```

------------------------------------------------------------------------

# 51. Accessibility

All shared components should support:

``` text
accessibilityLabel
accessibilityRole
accessible
```

Important controls:

``` text
Buttons
Icons
Filters
Search
Navigation
Status indicators
```

Do not rely on color alone to communicate status.

Example:

``` text
Active
[✓ Active]
```

rather than only a green dot.

------------------------------------------------------------------------

# 52. Keyboard Handling

Forms must work correctly on Android and iOS.

Requirements:

``` text
KeyboardAvoidingView where needed
ScrollView for long forms
Input focus management
Next-field navigation
Dismiss keyboard on submit
```

Test:

``` text
Login
Add Member
Membership application
KYC
Search
Filters
```

------------------------------------------------------------------------

# 53. Safe Area

All top-level screens must respect:

``` text
iOS safe areas
Android status bar
Bottom gesture/navigation area
```

Do not manually add arbitrary top padding.

Use the project's safe-area solution consistently.

------------------------------------------------------------------------

# 54. Android + iOS Compatibility

Aman's modules must be tested on both.

## Android

Check:

``` text
Back button
Keyboard
Status bar
Image picker
Document picker
Scrolling
Bottom navigation
Modal behavior
```

## iOS

Check:

``` text
Safe area
Navigation gestures
Keyboard
Image picker
Document picker
Share
Modal behavior
Bottom navigation
```

Avoid platform-specific UI unless necessary.

------------------------------------------------------------------------

# 55. Performance

Members and Applications can become large lists.

Use:

``` text
FlatList
keyExtractor
memoized row components
debounced search
pagination
pull-to-refresh
```

Avoid:

``` text
.map() over thousands of records inside ScrollView
```

Example:

``` tsx
<FlatList
  data={members}
  renderItem={renderMember}
  keyExtractor={(item) => item.id}
/>
```

------------------------------------------------------------------------

# 56. Search Performance

Search should be debounced.

Flow:

``` text
User types
   ↓
Local input state
   ↓
Debounce
   ↓
API/query update
```

Do not send a network request for every keystroke.

------------------------------------------------------------------------

# 57. Design Fidelity Rules

The supplied screenshots should be treated as the visual reference.

Maintain:

``` text
Header height
Title hierarchy
Card proportions
Status badge appearance
Search/filter placement
List density
Bottom navigation
Spacing
Colors
```

Do not make the UI unnecessarily larger or more spacious than the
reference.

The screenshots intentionally show a relatively dense Admin UI suitable
for operational work.

------------------------------------------------------------------------

# 58. Screen-by-Screen Ownership

## Aman

  Screen / Area             Ownership
  ------------------------- -----------
  Shared Header             UI
  Bottom Navigation         UI
  More Menu                 UI
  Members                   Full
  Member Details            Full
  Add Member                Full
  Edit Member               Full
  Membership Categories     Full
  Membership Step 1         Full
  Membership Step 2         Full
  Membership Step 3 / KYC   Full
  Digital Membership Card   Full
  Renewal                   Full
  Applications              Full
  Application Details       Full
  Application Review        Full
  KYC Viewer                Full
  Shared UI Components      Full
  Theme                     Full

------------------------------------------------------------------------

# 59. What Aman Does NOT Own

Aman should not independently implement:

``` text
Authentication/token refresh
API client
Secure token storage
Global permission service
Accounting
Financial reports
Payment verification business logic
RBAC backend logic
```

Those belong to Mubasshir.

Aman consumes them.

------------------------------------------------------------------------

# 60. API Integration Boundary

The correct architecture is:

``` text
Aman's Screen
      ↓
Aman's Hook
      ↓
Aman's Feature Service
      ↓
Mubasshir's API Client
      ↓
Auth Interceptor
      ↓
Permission / Backend
      ↓
HRSJM API
```

Example:

``` text
MembersScreen
    ↓
useMembers()
    ↓
members.service.ts
    ↓
apiClient.get('/users')
```

Do not do:

``` text
MembersScreen
    ↓
axios.get(...)
```

------------------------------------------------------------------------

# 61. Permission Boundary

Aman should consume:

``` typescript
can('user.read')
can('user.manage_status')
can('membership.approve')
can('membership_category.create')
```

The shared permission implementation remains under Mubasshir.

Example:

``` tsx
{can('user.manage_status') && (
  <AppButton
    title="Deactivate"
    variant="danger"
    onPress={handleDeactivate}
  />
)}
```

Backend authorization remains authoritative.

------------------------------------------------------------------------

# 62. Error Handling Boundary

Aman owns the UI presentation:

``` text
ErrorState
Toast
Field Error
Confirm Dialog
Retry
```

Mubasshir owns:

``` text
API error normalization
401 refresh
403 handling contract
Network interceptor
```

------------------------------------------------------------------------

# 63. Git Branches

Aman should use:

``` text
feature/aman/design-system
feature/aman/navigation-ui
feature/aman/members
feature/aman/membership
feature/aman/applications
```

Recommended development order:

``` text
design-system
      ↓
navigation-ui
      ↓
members
      ↓
applications
      ↓
membership
      ↓
KYC/card/renewal polish
```

------------------------------------------------------------------------

# 64. Commit Convention

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
feat(ui): create admin design system
feat(ui): add reusable admin stat card
feat(members): implement members list
feat(members): add member filters
feat(applications): implement approval queue
feat(membership): implement application wizard
feat(kyc): add document viewer
fix(members): fix list refresh
test(applications): add application status tests
```

------------------------------------------------------------------------

# 65. Pull Request Requirements

Every PR should include:

``` text
Summary
Screens implemented
Components added
APIs integrated
Permissions consumed
Testing performed
Android status
iOS status
Screenshots
Known issues
```

Example:

``` text
## Summary
Implemented Members Management.

## Screens
Members
Member Details
Add Member
Edit Member

## API
GET /api/v1/users

## Permissions
user.read
user.manage_status

## Testing
Android: PASS
iOS: PASS
TypeScript: PASS
```

------------------------------------------------------------------------

# 66. Testing Requirements

## Component Tests

Test:

``` text
AppButton
AppInput
AdminStatCard
AdminStatusBadge
SearchBar
FilterSheet
MemberCard
ApplicationCard
MembershipCard
```

## Screen Tests

Test:

``` text
Members
Applications
Membership
KYC
```

## Interaction Tests

Test:

``` text
Search
Filter
Refresh
Approve
Reject
Add Member
Edit Member
Upload document
Back/Next wizard
```

------------------------------------------------------------------------

# 67. Definition of Done

Aman must not mark a module complete when only the UI is finished.

``` text
[ ] UI matches approved screenshot/reference
[ ] Android layout tested
[ ] iOS layout tested
[ ] Shared components used
[ ] No duplicated components
[ ] API integrated
[ ] TypeScript types created
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Refresh
[ ] Search where required
[ ] Filters where required
[ ] Pagination where required
[ ] Form validation
[ ] Permission-aware actions
[ ] Success feedback
[ ] Failure feedback
[ ] Navigation complete
[ ] Keyboard tested
[ ] Safe area tested
[ ] Accessibility labels added
[ ] Unit/component tests
[ ] TypeScript clean
[ ] ESLint clean
[ ] PR submitted
```

------------------------------------------------------------------------

# 68. Development Order

## Phase 1 --- Design Foundation

``` text
1. Theme
2. Colors
3. Typography
4. Spacing
5. Buttons
6. Inputs
7. Cards
8. Badges
9. Header
10. Search
11. Filters
12. Stat cards
13. Loading
14. Empty
15. Error
```

Do this before building feature screens.

------------------------------------------------------------------------

## Phase 2 --- Navigation UI

``` text
1. Root visual integration
2. Admin bottom navigation
3. More menu
4. Header
5. Screen transitions
```

------------------------------------------------------------------------

## Phase 3 --- Members

``` text
1. Members list
2. Stats
3. Search
4. Filters
5. Member row/card
6. Member details
7. Add member
8. Edit member
9. Actions
10. Bulk actions
```

------------------------------------------------------------------------

## Phase 4 --- Applications

``` text
1. Applications list
2. Stats
3. Search
4. Filters
5. Application details
6. KYC documents
7. Review
8. Approve
9. Reject
10. Status refresh
```

------------------------------------------------------------------------

## Phase 5 --- Membership

``` text
1. Category selector
2. Application Step 1
3. Application Step 2
4. Application Step 3
5. KYC upload
6. Membership card
7. Renewal
```

------------------------------------------------------------------------

# 69. Parallel Work With Mubasshir

Aman and Mubasshir should agree on these interfaces before feature
development:

``` text
API Client
Auth State
Permission Helper
Navigation Params
User Type
Pagination Type
API Error Type
Upload Result Type
```

After these contracts are stable, Aman can work independently.

------------------------------------------------------------------------

# 70. Shared Types

Avoid creating incompatible types.

For example, do not have:

``` typescript
// Aman
type User = {
  id: string;
  name: string;
};

// Another module
type User = {
  userId: number;
  fullName: string;
};
```

Use centralized/shared API/domain types where appropriate.

Feature-specific view models can still exist:

``` text
MemberListItem
MemberDetails
ApplicationListItem
ApplicationDetails
```

------------------------------------------------------------------------

# 71. Folder Ownership Summary

``` text
src/
│
├── app/
│   └── navigation/                  ← AMAN UI
│
├── core/
│   ├── components/                   ← AMAN
│   │   ├── common/
│   │   ├── admin/
│   │   ├── forms/
│   │   └── feedback/
│   │
│   └── theme/                       ← AMAN
│
└── features/admin/
    │
    ├── members/                     ← AMAN
    │
    ├── membership/                  ← AMAN
    │
    └── applications/                ← AMAN
```

Mubasshir's areas:

``` text
core/api
core/storage
core/permissions
features/auth
dashboard
payments
expenses
receipts
accounting
reports
rbac
```

Other developers:

``` text
Arshad → assistance/support/notifications/settings
Sahil  → donations/receipts/payment operations
Suraj  → events/news/blogs/rights
```

------------------------------------------------------------------------

# 72. Final Aman Architecture

``` text
                         AMAN
                          │
             ┌────────────┴────────────┐
             │                         │
       DESIGN SYSTEM              NAVIGATION UI
             │                         │
     ┌───────┼────────┐                │
     │       │        │                │
 Components Theme   Forms              │
     │                                  │
     └──────────────┬───────────────────┘
                    │
                    ▼
              ADMIN FEATURES
                    │
          ┌─────────┼──────────┐
          │         │          │
       MEMBERS  APPLICATIONS MEMBERSHIP
          │         │          │
          │         │          ├── Categories
          │         │          ├── Step 1
          │         │          ├── Step 2
          │         │          ├── KYC
          │         │          ├── Card
          │         │          └── Renewal
          │         │
          │         ├── List
          │         ├── Details
          │         ├── Review
          │         └── Approve/Reject
          │
          ├── List
          ├── Details
          ├── Add
          ├── Edit
          ├── Search
          └── Filters
```

------------------------------------------------------------------------

# 73. Final Objective for Aman

> **Build the complete shared Admin frontend system and the Members,
> Membership and Applications experiences so that every other developer
> can reuse the same components, design tokens, navigation patterns,
> forms, cards, filters and responsive behavior.**

The most important rule is:

``` text
DO NOT build each screen independently.

Build the DESIGN SYSTEM first.
Then build FEATURES using that system.
```

This keeps the entire HRSJM Admin application visually consistent across
Android and iOS.
