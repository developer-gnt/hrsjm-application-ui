# HRSJM Admin Mobile App --- Arshad Development Specification

**Project:** HRSJM Digital Membership & Donation Platform\
**Platform:** React Native CLI --- Android + iOS\
**Language:** TypeScript\
**Backend:** `HRSJM-back-api` --- `/api/v1`\
**Developer:** Arshad --- Operations / Support / Assistance /
Notifications / Settings\
**BRD Version:** 1.0.0 --- September 2026

------------------------------------------------------------------------

# 1. Purpose

This document defines the complete implementation scope for **Arshad**
in the HRSJM Admin mobile application.

Arshad owns these Admin operational modules:

``` text
1. Donation Seekers / Welfare Assistance
2. Complaints / Support Tickets
3. Notifications
4. Admin Profile & Settings
```

The work includes:

``` text
UI
API Integration
Forms
Search
Filters
Status handling
Loading states
Empty states
Error states
Permission-aware actions
Navigation
Validation
Testing
Android compatibility
iOS compatibility
```

The backend already exists. Arshad must integrate with the existing
`/api/v1` backend and must not create duplicate API infrastructure.

------------------------------------------------------------------------

# 2. Important Architecture Rule

Arshad consumes the shared infrastructure created by Mubasshir and the
shared UI system created by Aman.

``` text
Arshad Screen
    ↓
Arshad Hook
    ↓
Feature Service
    ↓
Shared API Client
    ↓
Auth / Refresh Interceptor
    ↓
HRSJM Backend
```

Do NOT do:

``` text
Screen
 ↓
axios.get(...)
```

Do NOT create:

``` text
arshadApiClient
arshadAuth
arshadPermissionService
```

Use the shared project infrastructure.

------------------------------------------------------------------------

# 3. Arshad Ownership

``` text
ARSHAD
│
├── Assistance / Donation Seekers
│   ├── Request List
│   ├── Request Details
│   ├── Documents
│   ├── Review
│   ├── Approve
│   └── Reject
│
├── Complaints / Support
│   ├── Ticket List
│   ├── Ticket Details
│   ├── Ticket Conversation
│   ├── Reply
│   ├── Assign
│   ├── Escalate
│   └── Resolve
│
├── Notifications
│   ├── Notification Feed
│   ├── Read/Unread
│   └── Navigation
│
└── Profile / Settings
    ├── Profile
    ├── Edit Profile
    ├── Change Password
    ├── Biometric Lock UI
    ├── Legal Links
    ├── App Information
    └── Logout UI
```

------------------------------------------------------------------------

# 4. Source-of-Truth Terminology

The supplied UI calls the assistance area:

``` text
Donation Seekers
```

The Admin BRD defines the module as:

``` text
Welfare Assistance
Assistance Requests Review
```

Therefore use:

``` text
Feature folder:
assistance/

UI label:
Donation Seekers

Domain:
Welfare Assistance / Assistance Requests
```

Do not create a folder called:

``` text
donation-seekers/
```

because Donations and Assistance are separate business domains.

------------------------------------------------------------------------

# 5. Folder Architecture

``` text
src/features/admin/
│
├── assistance/                         ← ARSHAD
│   ├── screens/
│   │   ├── AssistanceRequestsScreen.tsx
│   │   ├── AssistanceDetailsScreen.tsx
│   │   └── AssistanceDocumentsScreen.tsx
│   │
│   ├── components/
│   │   ├── AssistanceStats.tsx
│   │   ├── AssistanceCard.tsx
│   │   ├── AssistanceRow.tsx
│   │   ├── AssistanceFilters.tsx
│   │   ├── AssistanceStatusBadge.tsx
│   │   ├── AssistanceAmount.tsx
│   │   ├── AssistanceDocuments.tsx
│   │   ├── ApproveAssistanceModal.tsx
│   │   └── RejectAssistanceModal.tsx
│   │
│   ├── services/
│   │   └── assistance.service.ts
│   │
│   ├── hooks/
│   │   ├── useAssistance.ts
│   │   ├── useAssistanceDetails.ts
│   │   └── useAssistanceActions.ts
│   │
│   ├── types/
│   │   └── assistance.types.ts
│   │
│   └── index.ts
│
├── support/                            ← ARSHAD
│   ├── screens/
│   │   ├── SupportTicketsScreen.tsx
│   │   ├── TicketDetailsScreen.tsx
│   │   └── TicketChatScreen.tsx
│   │
│   ├── components/
│   │   ├── TicketStats.tsx
│   │   ├── TicketCard.tsx
│   │   ├── TicketRow.tsx
│   │   ├── TicketFilters.tsx
│   │   ├── TicketStatusBadge.tsx
│   │   ├── TicketPriorityBadge.tsx
│   │   ├── TicketAssignee.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── AssignTicketModal.tsx
│   │   ├── EscalateTicketModal.tsx
│   │   └── ResolveTicketModal.tsx
│   │
│   ├── services/
│   │   └── support.service.ts
│   │
│   ├── hooks/
│   │   ├── useTickets.ts
│   │   ├── useTicketDetails.ts
│   │   └── useTicketActions.ts
│   │
│   ├── types/
│   │   └── support.types.ts
│   │
│   └── index.ts
│
├── notifications/                      ← ARSHAD
│   ├── screens/
│   │   └── NotificationsScreen.tsx
│   │
│   ├── components/
│   │   ├── NotificationCard.tsx
│   │   ├── NotificationIcon.tsx
│   │   ├── NotificationStatus.tsx
│   │   └── NotificationFilter.tsx
│   │
│   ├── services/
│   │   └── notifications.service.ts
│   │
│   ├── hooks/
│   │   └── useNotifications.ts
│   │
│   ├── types/
│   │   └── notification.types.ts
│   │
│   └── index.ts
│
└── settings/                           ← ARSHAD
    ├── screens/
    │   └── ProfileSettingsScreen.tsx
    │
    ├── components/
    │   ├── ProfileHeader.tsx
    │   ├── ProfileForm.tsx
    │   ├── SecuritySection.tsx
    │   ├── ChangePasswordForm.tsx
    │   ├── BiometricToggle.tsx
    │   ├── LegalLinks.tsx
    │   ├── AppInfo.tsx
    │   └── LogoutButton.tsx
    │
    ├── services/
    │   └── settings.service.ts
    │
    ├── hooks/
    │   └── useSettings.ts
    │
    ├── types/
    │   └── settings.types.ts
    │
    └── index.ts
```

------------------------------------------------------------------------

# 6. Shared UI Components

Do not recreate common components.

Use:

``` text
src/core/components/common/
```

and:

``` text
src/core/components/admin/
```

Examples:

``` text
AppButton
AppInput
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
AdminDataList
AdminDateFilter
AdminAmount
```

If a missing component is genuinely reusable across multiple modules,
coordinate with Aman and add it to the shared component library rather
than keeping it permanently inside Arshad's feature.

------------------------------------------------------------------------

# 7. Admin Design System

All Arshad screens must follow the same Admin design system.

## Colors

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

------------------------------------------------------------------------

# 8. Typography

Use the shared Admin typography.

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

Do not create a separate font system.

------------------------------------------------------------------------

# 9. Screen Layout Standard

All Arshad screens should use:

``` text
Header
   ↓
Page Title
   ↓
Statistics if required
   ↓
Search
   ↓
Filters
   ↓
Status Tabs
   ↓
Data List
```

Example:

``` text
┌─────────────────────────────────────┐
│ HRSJM                         🔔 👤 │
├─────────────────────────────────────┤
│ Donation Seekers                    │
│ Review welfare assistance requests  │
│                                     │
│ [Total] [Review] [Approved] [Reject]│
│                                     │
│ [ Search................ ] [Filter] │
│                                     │
│ [All] [Under Review] [Approved]     │
│                                     │
│ Request Card                        │
│ Request Card                        │
└─────────────────────────────────────┘
```

------------------------------------------------------------------------

# 10. Assistance / Donation Seekers

The supplied screenshot shows:

``` text
Donation Seekers

Total Requests
Under Review
Approved
Rejected

Search
Filters

Request / Seeker
Cause
Requested Amount
Status
Action
```

The BRD defines this domain as:

``` text
Welfare Assistance
Assistance Requests Review
```

with review actions such as:

``` text
View Documents
Approve
Reject
```

------------------------------------------------------------------------

# 11. Assistance Screen

## Route

``` text
AdminAssistanceRequests
```

## Folder

``` text
src/features/admin/assistance/
```

## UI

``` text
Donation Seekers

[Total Requests]
[Under Review]
[Approved]
[Rejected]

[ Search by name/request ID ] [Filters]

[All]
[Under Review]
[Approved]
[Rejected]

Request Cards
```

------------------------------------------------------------------------

# 12. Assistance Card

Each card should show:

``` text
Seeker Name
Avatar
Request ID
Cause / Category
Requested Amount
Submitted Date
Status
Action
```

Example:

``` text
┌────────────────────────────────────┐
│ ○  Ahmed Khan                  ⋮  │
│    Medical Treatment               │
│                                    │
│    Request #REQ-10024              │
│    Requested: ₹50,000              │
│    Submitted: 28 Sep 2026          │
│                                    │
│    [Under Review]                  │
│                                    │
│    [View Details]                  │
└────────────────────────────────────┘
```

------------------------------------------------------------------------

# 13. Assistance Filters

Use:

``` text
Status
Category
Date Range
Amount Range
```

Status:

``` text
All
Under Review
Approved
Rejected
```

The filter UI should open as a mobile bottom sheet.

------------------------------------------------------------------------

# 14. Assistance Details

Structure:

``` text
Request Header
    ↓
Seeker Information
    ↓
Request Information
    ↓
Cause
    ↓
Requested Amount
    ↓
Description
    ↓
Supporting Documents
    ↓
Request Timeline
    ↓
Review Actions
```

------------------------------------------------------------------------

# 15. Assistance Documents

Document section:

``` text
Documents

Medical Report
Identity Document
Supporting Document

[View]
```

States:

``` text
Uploaded
Verified
Rejected
Missing
```

Use the shared document viewer where possible.

Do not log private document URLs.

------------------------------------------------------------------------

# 16. Assistance Approval

Flow:

``` text
Request Details
     ↓
Approve
     ↓
Confirmation
     ↓
Optional note/reason
     ↓
API
     ↓
Success
     ↓
Refresh request
```

UI:

``` text
Approve Assistance

Are you sure you want to approve this request?

[Cancel] [Approve]
```

Button:

``` text
Success / Primary
```

------------------------------------------------------------------------

# 17. Assistance Rejection

Flow:

``` text
Reject
 ↓
Reject Modal
 ↓
Reason
 ↓
Confirm
 ↓
API
 ↓
Refresh
```

UI:

``` text
Reject Assistance

Reason

[Enter reason...]

[Cancel] [Reject]
```

Reject button:

``` text
Danger
```

------------------------------------------------------------------------

# 18. Assistance Loading State

Initial:

``` text
Skeleton stats
Skeleton cards
```

Action:

``` text
Approve
→ button spinner
→ disabled
```

Refresh:

``` text
Pull to refresh
```

------------------------------------------------------------------------

# 19. Assistance Empty State

``` text
No Assistance Requests

There are no requests matching
your current filters.

[Clear Filters]
```

------------------------------------------------------------------------

# 20. Assistance Error State

``` text
Unable to load assistance requests.

[Retry]
```

------------------------------------------------------------------------

# 21. Assistance API Integration

The exact backend contract must be taken from the implemented HRSJM
backend.

Before coding, confirm:

``` text
Endpoint
Method
Request body
Query params
Response
Pagination
Status enums
Permissions
Error format
```

Do not invent endpoints.

The BRD identifies the feature as:

``` text
GET /api/v1/assistance-requests
```

if that endpoint exists in the implemented backend contract; otherwise
use the actual backend route.

------------------------------------------------------------------------

# 22. Assistance Permission Handling

Use the shared permission helper.

Examples:

``` text
assistance.read
assistance.approve
assistance.reject
assistance.manage_status
```

These permission names are implementation placeholders unless they
exactly match the backend.

Use the backend's actual permission catalog.

Never assume that Admin role automatically means every action should be
visible.

------------------------------------------------------------------------

# 23. Complaints / Support Tickets

The Admin BRD defines:

``` text
Support Tickets
Ticket Details & Conversation
```

Admin capabilities include:

``` text
View all tickets
Reply
Resolve
Escalate
Assign
```

------------------------------------------------------------------------

# 24. Support Folder

``` text
src/features/admin/support/
│
├── screens/
│   ├── SupportTicketsScreen.tsx
│   ├── TicketDetailsScreen.tsx
│   └── TicketChatScreen.tsx
│
├── components/
│   ├── TicketStats.tsx
│   ├── TicketCard.tsx
│   ├── TicketRow.tsx
│   ├── TicketFilters.tsx
│   ├── TicketStatusBadge.tsx
│   ├── TicketPriorityBadge.tsx
│   ├── TicketAssignee.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── AssignTicketModal.tsx
│   ├── EscalateTicketModal.tsx
│   └── ResolveTicketModal.tsx
│
├── services/
│   └── support.service.ts
│
├── hooks/
│   ├── useTickets.ts
│   ├── useTicketDetails.ts
│   └── useTicketActions.ts
│
├── types/
│   └── support.types.ts
│
└── index.ts
```

------------------------------------------------------------------------

# 25. Support Ticket List UI

``` text
Complaints / Support

[Total]
[Open]
[In Progress]
[Resolved]

[Search................] [Filters]

[All]
[Open]
[In Progress]
[Resolved]

Ticket Cards
```

Each card:

``` text
Ticket ID
Subject
User
Category
Priority
Created Date
Status
Assignee
```

------------------------------------------------------------------------

# 26. Ticket Status

Use backend status enums.

Typical UI presentation:

``` text
Open
In Progress
Resolved
Closed
Escalated
```

Do not hardcode additional backend states without confirmation.

------------------------------------------------------------------------

# 27. Ticket Priority

Possible UI:

``` text
Low
Medium
High
Urgent
```

Use the backend's actual enum values.

Visual hierarchy:

``` text
Low      → neutral
Medium   → info
High     → warning
Urgent   → danger
```

Do not communicate priority only through color.

------------------------------------------------------------------------

# 28. Ticket Details

Structure:

``` text
Ticket Header
Ticket ID
Subject
Status
Priority

User
Name
Phone
Email

Description

Attachments

Conversation

Assignment

Actions
```

------------------------------------------------------------------------

# 29. Ticket Conversation

UI:

``` text
┌─────────────────────────────────┐
│ Support Ticket #SUP-1234        │
├─────────────────────────────────┤
│                                 │
│ User message                    │
│                          10:30 AM│
│                                 │
│        Admin reply              │
│        10:35 AM                 │
│                                 │
│ User message                    │
│                          10:40 AM│
│                                 │
├─────────────────────────────────┤
│ Type a reply...           Send  │
└─────────────────────────────────┘
```

Requirements:

``` text
Message list
Message timestamp
Sender distinction
Attachments where backend supports
Reply input
Send state
Error state
```

------------------------------------------------------------------------

# 30. Reply Flow

``` text
Input
 ↓
Validate
 ↓
Send
 ↓
Button loading
 ↓
API
 ↓
Append/refresh message
```

Prevent duplicate submissions.

------------------------------------------------------------------------

# 31. Assign Ticket

UI:

``` text
Assign Ticket

Select Admin / Staff

[Cancel] [Assign]
```

Do not expose users who the backend does not allow to receive
assignments.

------------------------------------------------------------------------

# 32. Escalate Ticket

``` text
Escalate Ticket

Escalation reason

[Cancel] [Escalate]
```

Use danger/warning presentation but keep the language neutral and
professional.

------------------------------------------------------------------------

# 33. Resolve Ticket

``` text
Resolve Ticket

Resolution note

[Cancel] [Resolve]
```

After successful resolution:

``` text
Status → Resolved
```

Refresh the ticket.

------------------------------------------------------------------------

# 34. Support API Integration

The BRD identifies:

``` text
GET /api/v1/support/tickets
GET /api/v1/support/tickets/:id
POST /api/v1/support/tickets/:id/messages
```

Use the exact implemented backend paths if they differ.

Potential additional backend actions may include:

``` text
Assign
Escalate
Resolve
```

Confirm the actual backend contract before implementation.

------------------------------------------------------------------------

# 35. Support Search / Filters

Search:

``` text
Ticket ID
Subject
User name
```

Filters:

``` text
Status
Priority
Category
Assignee
Date Range
```

------------------------------------------------------------------------

# 36. Support Empty State

``` text
No Support Tickets

There are no tickets matching
your current filters.
```

------------------------------------------------------------------------

# 37. Support Error State

``` text
Unable to load support tickets.

[Retry]
```

For chat send failure:

``` text
Message failed to send.

[Retry]
```

------------------------------------------------------------------------

# 38. Notifications

The Admin BRD defines:

``` text
Notification Feed
```

with:

``` text
GET /api/v1/notifications
```

and includes:

``` text
Mark as read
Unread count
Notification type
```

------------------------------------------------------------------------

# 39. Notifications Folder

``` text
src/features/admin/notifications/
│
├── screens/
│   └── NotificationsScreen.tsx
│
├── components/
│   ├── NotificationCard.tsx
│   ├── NotificationIcon.tsx
│   ├── NotificationStatus.tsx
│   └── NotificationFilter.tsx
│
├── services/
│   └── notifications.service.ts
│
├── hooks/
│   └── useNotifications.ts
│
├── types/
│   └── notification.types.ts
│
└── index.ts
```

------------------------------------------------------------------------

# 40. Notification UI

Header:

``` text
Notifications
```

Filter:

``` text
All
Unread
```

Card:

``` text
┌────────────────────────────────────┐
│ ● Membership Application            │
│                                    │
│ New application requires review.  │
│                                    │
│ 10 minutes ago                    │
└────────────────────────────────────┘
```

Unread:

``` text
Primary/light-blue indicator
```

Read:

``` text
Muted
```

------------------------------------------------------------------------

# 41. Notification Types

Display according to backend type.

Possible examples:

``` text
Membership
Payment
Donation
Assistance
Support
System
```

Do not invent backend notification types. Map the implemented enum to UI
labels/icons.

------------------------------------------------------------------------

# 42. Notification Actions

At minimum:

``` text
Open notification
Mark as read
```

If backend supports:

``` text
Mark all as read
```

Implement only when available.

------------------------------------------------------------------------

# 43. Notification Navigation

A notification can deep-link to a relevant feature when the backend
provides enough context.

Example:

``` text
Membership notification
        ↓
Membership Application Details
```

``` text
Support notification
        ↓
Ticket Details
```

Do not hardcode arbitrary navigation based only on notification text.

Use structured notification payloads from the backend.

------------------------------------------------------------------------

# 44. Notification API

BRD:

``` text
GET /api/v1/notifications
```

Use the actual implemented mark-read endpoint.

The service should expose:

``` text
getNotifications()
markAsRead()
markAllAsRead()   // only if supported
```

------------------------------------------------------------------------

# 45. Profile & Settings

The BRD defines:

``` text
Profile & Security Settings
```

Features:

``` text
Edit profile
Change password
Biometric lock
Privacy Policy
Terms
App version
Logout
```

------------------------------------------------------------------------

# 46. Settings Folder

``` text
src/features/admin/settings/
│
├── screens/
│   └── ProfileSettingsScreen.tsx
│
├── components/
│   ├── ProfileHeader.tsx
│   ├── ProfileForm.tsx
│   ├── SecuritySection.tsx
│   ├── ChangePasswordForm.tsx
│   ├── BiometricToggle.tsx
│   ├── LegalLinks.tsx
│   ├── AppInfo.tsx
│   └── LogoutButton.tsx
│
├── services/
│   └── settings.service.ts
│
├── hooks/
│   └── useSettings.ts
│
├── types/
│   └── settings.types.ts
│
└── index.ts
```

------------------------------------------------------------------------

# 47. Settings UI

``` text
Profile

┌───────────────────────────────┐
│           Avatar              │
│        Admin Name             │
│        admin@email.com        │
└───────────────────────────────┘

Personal Information
─────────────────────
Name
Email
Phone

Security
─────────────────────
Change Password
Biometric Lock

Legal
─────────────────────
Privacy Policy
Terms & Conditions

About
─────────────────────
App Version

[Logout]
```

------------------------------------------------------------------------

# 48. Edit Profile

Fields should exactly match the backend.

Possible:

``` text
Name
Email
Phone
Profile Image
```

Do not create editable fields that the backend does not support.

------------------------------------------------------------------------

# 49. Change Password

UI:

``` text
Change Password

Current Password
New Password
Confirm New Password

[Change Password]
```

Validation:

``` text
Required
Minimum length according to backend policy
New password confirmation
```

Never log passwords.

------------------------------------------------------------------------

# 50. Biometric Lock

UI:

``` text
Biometric Lock

Use fingerprint / Face ID
[ ON ]
```

The setting controls local app access behavior.

It must never replace server authentication.

If the device does not support biometrics:

``` text
Biometric authentication is not available
on this device.
```

------------------------------------------------------------------------

# 51. Legal Links

``` text
Privacy Policy
Terms & Conditions
```

Use the URLs/content configured by the application.

Do not hardcode arbitrary production URLs without project confirmation.

------------------------------------------------------------------------

# 52. Logout

Flow:

``` text
Logout
 ↓
Confirmation
 ↓
Shared auth logout
 ↓
Clear secure session
 ↓
Auth Navigator
```

Arshad owns the UI.

Mubasshir owns the shared session/auth behavior.

------------------------------------------------------------------------

# 53. API Integration Pattern

Every feature should follow:

``` text
Screen
 ↓
Hook
 ↓
Service
 ↓
apiClient
```

Example:

``` typescript
export const getTickets = async (params: TicketQuery) => {
  return apiClient.get<TicketListResponse>(
    '/support/tickets',
    { params },
  );
};
```

The exact path must match the backend.

------------------------------------------------------------------------

# 54. Server State

Use the project's agreed server-state solution.

Recommended:

``` text
useAssistance()
useAssistanceDetails()
useTickets()
useTicketDetails()
useNotifications()
useSettings()
```

Do not put full ticket lists or notification feeds into global client
state unnecessarily.

------------------------------------------------------------------------

# 55. Local State

Use local state for:

``` text
Search
Selected filters
Modal open/close
Selected ticket
Selected request
Form values
Current tab
Expanded card
```

------------------------------------------------------------------------

# 56. Loading Standards

Every API screen needs:

``` text
Initial loading
Refresh loading
Action loading
Pagination loading
```

Examples:

``` text
List:
Skeleton cards

Approve:
Button spinner

Reply:
Send spinner

Notification list:
Skeleton notification rows
```

Never show a blank screen while loading.

------------------------------------------------------------------------

# 57. Empty Standards

Every list needs an empty state.

Example:

``` text
No Requests Found

Try changing your search or filters.

[Clear Filters]
```

------------------------------------------------------------------------

# 58. Error Standards

Use shared:

``` text
AppErrorState
```

Example:

``` text
Unable to load requests.

Please try again.

[Retry]
```

For actions:

``` text
Action failed.

Please try again.
```

Do not expose raw server stack traces.

------------------------------------------------------------------------

# 59. Permission Standards

Arshad must use the centralized permission helper.

Example:

``` tsx
{can('assistance.approve') && (
  <AppButton title="Approve" />
)}
```

``` tsx
{can('support.resolve') && (
  <AppButton title="Resolve" />
)}
```

``` tsx
{can('support.assign') && (
  <AppButton title="Assign" />
)}
```

The exact permission identifiers must match the backend permission
catalog.

Never use:

``` typescript
role === 'ADMIN'
```

as the only authorization check.

Backend authorization remains authoritative.

------------------------------------------------------------------------

# 60. Search Standards

Search should be debounced.

Example:

``` text
User types:
Ahmed

Wait for debounce

API/query:
Ahmed
```

Do not call the backend for every character.

------------------------------------------------------------------------

# 61. Filter Standards

All filters should:

``` text
Open bottom sheet
Show current selections
Allow multiple selections where applicable
Apply
Clear
Close
```

Example:

``` text
Filters

Status
☑ Under Review
☐ Approved
☐ Rejected

Category
☐ Medical
☐ Education
☐ Emergency

Date Range
[From] [To]

[Clear] [Apply]
```

------------------------------------------------------------------------

# 62. Responsive Rules

The application must support:

``` text
Small Android phones
Large Android phones
iPhones
iOS safe area
Android navigation area
```

Do not hardcode device width.

Use:

``` text
flex
useWindowDimensions
responsive sizing
SafeArea
```

------------------------------------------------------------------------

# 63. Android Requirements

Test:

``` text
Android back button
Keyboard
Status bar
Bottom navigation
Bottom sheets
File/document viewing
Image/document upload
Chat input
Pull-to-refresh
```

------------------------------------------------------------------------

# 64. iOS Requirements

Test:

``` text
Safe area
Navigation gestures
Keyboard
Bottom sheets
Document picker
Image viewer
Chat input
Pull-to-refresh
```

------------------------------------------------------------------------

# 65. Document Handling

For Assistance:

``` text
View document
Open image/PDF
Loading
Error
Close
```

Use the approved shared document viewer.

Security rules:

``` text
Do not log private document URLs
Do not persist sensitive documents unnecessarily
Do not expose access tokens in logs
```

------------------------------------------------------------------------

# 66. Chat UX

Support chat should feel like a native conversation.

``` text
Incoming message:
left aligned

Admin message:
right aligned

Timestamp:
small muted text

Input:
bottom anchored

Send:
primary icon/button
```

When sending:

``` text
Disable duplicate submission
Show spinner
Append confirmed message
```

If sending fails:

``` text
Show retry action
```

------------------------------------------------------------------------

# 67. Accessibility

Use:

``` text
accessibilityLabel
accessibilityRole
accessible
```

for:

``` text
Buttons
Icons
Filters
Status controls
Chat send
Notification items
```

Never communicate a status using color alone.

------------------------------------------------------------------------

# 68. Performance

Use:

``` text
FlatList
Memoized list items
Pagination
Debounced search
Stable callbacks
Lazy loading
```

Avoid:

``` text
ScrollView + map() for large ticket/request lists
```

------------------------------------------------------------------------

# 69. Testing

## Assistance

Test:

``` text
List loads
Search
Filters
Details
Documents
Approve
Reject
Refresh
Empty state
Error state
Permission restriction
```

## Support

Test:

``` text
List
Search
Filters
Details
Messages
Reply
Assign
Escalate
Resolve
Refresh
Error
```

## Notifications

Test:

``` text
List
Unread state
Mark read
Deep link
Refresh
Empty
```

## Settings

Test:

``` text
Profile
Edit
Password
Biometric
Legal links
Logout
```

------------------------------------------------------------------------

# 70. Git Branches

Use:

``` text
feature/arshad/assistance
feature/arshad/support
feature/arshad/notifications
feature/arshad/settings
```

Recommended order:

``` text
assistance
    ↓
support
    ↓
notifications
    ↓
settings
```

------------------------------------------------------------------------

# 71. Commit Convention

``` text
feat(assistance): implement assistance request list
feat(assistance): add approval workflow
feat(support): implement ticket list
feat(support): add ticket conversation
feat(support): add ticket assignment
feat(notifications): implement notification feed
feat(settings): implement profile settings
feat(settings): add biometric setting
fix(support): fix message retry
test(assistance): add approval tests
```

------------------------------------------------------------------------

# 72. Pull Request Requirements

Every PR must contain:

``` text
Summary
Screens
Components
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
Implemented Assistance Requests.

## Screens
Assistance List
Assistance Details
Documents

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

# 73. Definition of Done

A feature is complete only when:

``` text
[ ] UI matches approved design
[ ] API integrated
[ ] Correct backend types
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Search
[ ] Filters
[ ] Pagination if required
[ ] Pull-to-refresh
[ ] Form validation
[ ] Permission-aware actions
[ ] Success feedback
[ ] Failure feedback
[ ] Navigation
[ ] Android tested
[ ] iOS tested
[ ] Accessibility
[ ] Unit/component tests
[ ] TypeScript clean
[ ] ESLint clean
[ ] No debug logs
[ ] PR reviewed
```

------------------------------------------------------------------------

# 74. Development Sequence

## Phase 1 --- Assistance

``` text
1. List
2. Stats
3. Search
4. Filters
5. Details
6. Documents
7. Approve
8. Reject
9. Loading/empty/error
10. Tests
```

## Phase 2 --- Support

``` text
1. Ticket list
2. Search
3. Filters
4. Ticket details
5. Conversation
6. Reply
7. Assign
8. Escalate
9. Resolve
10. Tests
```

## Phase 3 --- Notifications

``` text
1. Feed
2. Read/unread
3. Mark read
4. Deep links
5. Empty/error/loading
6. Tests
```

## Phase 4 --- Settings

``` text
1. Profile
2. Edit profile
3. Change password
4. Biometric UI
5. Legal
6. App information
7. Logout
8. Tests
```

------------------------------------------------------------------------

# 75. Dependency With Other Developers

Arshad depends on:

``` text
Mubasshir
├── API client
├── Auth
├── Permission helper
└── Navigation infrastructure

Aman
├── Theme
├── Shared components
├── Admin cards
├── Search
├── Filter sheet
├── Status badge
└── Modal
```

Arshad should not wait for the complete application.

Once the shared interfaces/components are available, use them
immediately.

------------------------------------------------------------------------

# 76. Integration Rules

Arshad's feature service:

``` text
src/features/admin/assistance/services/assistance.service.ts
```

must call:

``` text
src/core/api/client.ts
```

Arshad's screens should consume:

``` text
useAssistance()
useTickets()
useNotifications()
useSettings()
```

rather than directly handling networking.

------------------------------------------------------------------------

# 77. API Contract Checklist

Before each feature:

``` text
[ ] Endpoint confirmed
[ ] HTTP method confirmed
[ ] Request body confirmed
[ ] Query parameters confirmed
[ ] Response confirmed
[ ] Pagination confirmed
[ ] Status enum confirmed
[ ] Permission confirmed
[ ] Error format confirmed
```

If the backend does not expose an expected endpoint, report it to
Mubasshir instead of creating a mock API inside the mobile app.

------------------------------------------------------------------------

# 78. Final Arshad Folder Map

``` text
src/features/admin/
│
├── assistance/
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types/
│
├── support/
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types/
│
├── notifications/
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types/
│
└── settings/
    ├── screens/
    ├── components/
    ├── services/
    ├── hooks/
    └── types/
```

------------------------------------------------------------------------

# 79. Final Arshad Responsibility Matrix

  Module                  UI     API   Forms   Search    Filters   Permissions   Testing
  --------------------- ---- ------- ------- -------- ---------- ------------- ---------
  Assistance              ✅      ✅      ✅       ✅         ✅            ✅        ✅
  Support Tickets         ✅      ✅      ✅       ✅         ✅            ✅        ✅
  Ticket Conversation     ✅      ✅      ✅      ---        ---            ✅        ✅
  Notifications           ✅      ✅     ---      ---   Optional            ✅        ✅
  Profile                 ✅      ✅      ✅      ---        ---            ✅        ✅
  Security                ✅      ✅      ✅      ---        ---            ✅        ✅
  Biometric UI            ✅   Local     ---      ---        ---           ---        ✅

------------------------------------------------------------------------

# 80. Final Objective

> **Arshad's objective is to deliver the complete Admin operational
> workflow for Welfare Assistance, Support/Complaints, Notifications and
> Profile/Settings, fully integrated with the existing HRSJM backend and
> shared React Native architecture.**

The key rule is:

``` text
Use shared infrastructure.
Use shared UI components.
Own your feature completely.
Do not duplicate architecture.
Do not invent backend APIs.
```

The result should be production-ready on:

``` text
Android
+
iOS
```
