# HRSJM Admin Mobile App --- Suraj Development Specification

**Project:** HRSJM Digital Membership & Donation Platform\
**Platform:** React Native CLI --- Android + iOS\
**Language:** TypeScript\
**Backend:** `HRSJM-back-api` --- `/api/v1`\
**Developer:** Suraj --- Content / Public Information Management\
**Date:** September 2026

------------------------------------------------------------------------

# 1. Important Scope Note

The current **Admin BRD contains 40 screens**, but it does **not
formally define Events, News, Blogs, or Know Your Rights as Admin
screens**.

These modules were identified from the supplied UI/reference material
and the previously agreed developer division.

Therefore:

> Suraj's content-management scope is a **UI/reference-based development
> scope**. The exact backend endpoints, database fields, permissions,
> and CRUD contracts for these modules must be confirmed with
> Mubasshir/backend before API integration.

Do not invent backend endpoints or permissions.

The formally documented Admin BRD currently covers modules such as
membership, donations, assistance, receipts, support, accounting,
payments, RBAC, notifications and settings. fileciteturn5file3L1-L41

------------------------------------------------------------------------

# 2. Suraj Ownership

``` text
SURAJ
│
├── Events Management
│   ├── Event List
│   ├── Event Details
│   ├── Create Event
│   ├── Edit Event
│   ├── Publish / Unpublish
│   └── Delete / Archive
│
├── News Management
│   ├── News List
│   ├── News Details
│   ├── Create News
│   ├── Edit News
│   ├── Publish / Unpublish
│   └── Delete / Archive
│
├── Blogs Management
│   ├── Blog List
│   ├── Blog Details
│   ├── Create Blog
│   ├── Edit Blog
│   ├── Publish / Unpublish
│   └── Delete / Archive
│
└── Know Your Rights
    ├── Rights List
    ├── Rights Details
    ├── Create Article
    ├── Edit Article
    ├── Publish / Unpublish
    └── Delete / Archive
```

------------------------------------------------------------------------

# 3. Architecture Rule

Suraj must use the shared application infrastructure.

Correct:

``` text
Suraj Screen
    ↓
Feature Hook
    ↓
Feature Service
    ↓
Shared API Client
    ↓
Auth / Refresh
    ↓
Backend
```

Do not create:

``` text
surajApiClient.ts
surajAuth.ts
surajTokenManager.ts
```

The central API/auth/RBAC infrastructure is owned by Mubasshir.

------------------------------------------------------------------------

# 4. Folder Architecture

``` text
src/features/admin/
│
└── content/
    │
    ├── events/
    │   ├── screens/
    │   │   ├── EventsScreen.tsx
    │   │   ├── EventDetailsScreen.tsx
    │   │   └── EventFormScreen.tsx
    │   ├── components/
    │   │   ├── EventCard.tsx
    │   │   ├── EventStatusBadge.tsx
    │   │   ├── EventFilters.tsx
    │   │   └── EventForm.tsx
    │   ├── services/
    │   │   └── events.service.ts
    │   ├── hooks/
    │   │   ├── useEvents.ts
    │   │   └── useEventDetails.ts
    │   ├── types/
    │   │   └── events.types.ts
    │   └── index.ts
    │
    ├── news/
    │   ├── screens/
    │   ├── components/
    │   ├── services/
    │   ├── hooks/
    │   ├── types/
    │   └── index.ts
    │
    ├── blogs/
    │   ├── screens/
    │   ├── components/
    │   ├── services/
    │   ├── hooks/
    │   ├── types/
    │   └── index.ts
    │
    └── rights/
        ├── screens/
        ├── components/
        ├── services/
        ├── hooks/
        ├── types/
        └── index.ts
```

------------------------------------------------------------------------

# 5. Shared UI Dependency

Suraj must use the shared components created by Aman.

Examples:

``` text
AppButton
AppCard
AppInput
AppTextArea
AppSearchBar
AppImagePicker
AppHeader
AppLoader
AppEmptyState
AppErrorState
AdminStatusBadge
AdminFilterSheet
AdminPageHeader
ConfirmDialog
Toast
```

If a reusable component is missing:

``` text
Suraj identifies requirement
        ↓
Aman creates shared component
        ↓
Suraj consumes it
```

Do not duplicate the global component system.

------------------------------------------------------------------------

# 6. Design System

Use the HRSJM Admin visual system:

``` text
Primary:        #1B3F8F
Primary Dark:   #0F2860
Primary Light:  #EBF1FF
Accent Gold:    #C9A227

Active:         #10B981
Pending:        #3B82F6
Warning:        #F59E0B
Error:          #EF4444

Background:     #F5F7FA
Card:           #FFFFFF

Text Primary:   #0F172A
Text Secondary: #64748B
Text Muted:     #94A3B8
Border:         #E2E8F0
```

These colors are defined in the Admin BRD. fileciteturn5file5L1-L46

Do not create a separate visual identity for content modules.

------------------------------------------------------------------------

# 7. Content Management Principles

Every content module should follow the same pattern:

``` text
List
 ↓
Search
 ↓
Filter
 ↓
View
 ↓
Create / Edit
 ↓
Publish / Unpublish
 ↓
Delete / Archive
```

Only expose actions supported by the backend permission model.

------------------------------------------------------------------------

# 8. Events Management

## 8.1 Events List

Route:

``` text
AdminEventsScreen
```

Layout:

``` text
Events

Manage HRSJM events and activities.

[+ Add Event]

[Search........................] [Filters]

[All] [Published] [Draft] [Past]

Event Cards
```

------------------------------------------------------------------------

# 9. Event Card

Display:

``` text
Cover Image
Event Title
Event Date
Event Time
Location
Status
Organizer / Category where available
Action Menu
```

Example:

``` text
┌─────────────────────────────────────┐
│ [ Event Cover Image ]               │
│                                     │
│ HRSJM Community Awareness Program   │
│ 15 Oct 2026 • 10:00 AM             │
│ Mumbai                              │
│                                     │
│ [Published]                    ⋮    │
└─────────────────────────────────────┘
```

------------------------------------------------------------------------

# 10. Create Event

Fields should be based on the backend contract.

Potential fields:

``` text
Title
Short Description
Description
Cover Image
Event Date
Start Time
End Time
Location
Address
Category
Organizer
Registration URL / information
Status
```

Important:

> Do not add a field to the API payload unless the backend supports it.

------------------------------------------------------------------------

# 11. Event Details

Structure:

``` text
Cover Image
    ↓
Title
    ↓
Date / Time
    ↓
Location
    ↓
Description
    ↓
Additional Information
    ↓
Status
    ↓
Actions
```

Actions may include:

``` text
Edit
Publish
Unpublish
Delete
```

depending on permissions.

------------------------------------------------------------------------

# 12. Event Publishing

Expected UI flow:

``` text
Draft
  ↓
Review
  ↓
Publish
  ↓
Published
```

Unpublish:

``` text
Published
  ↓
Confirm
  ↓
Draft / Unpublished
```

The actual backend lifecycle must be confirmed.

------------------------------------------------------------------------

# 13. News Management

## 13.1 News List

Route:

``` text
AdminNewsScreen
```

Layout:

``` text
News

Manage HRSJM news and announcements.

[+ Add News]

[Search........................] [Filters]

[All] [Published] [Draft]

News Cards
```

------------------------------------------------------------------------

# 14. News Card

Display:

``` text
Image
Headline
Short Summary
Published Date
Author
Status
Action Menu
```

Example:

``` text
┌─────────────────────────────────────┐
│ [News Image]                        │
│                                     │
│ HRSJM launches new welfare program  │
│ 28 Sep 2026                         │
│ By HRSJM                             │
│                                     │
│ [Published]                    ⋮    │
└─────────────────────────────────────┘
```

------------------------------------------------------------------------

# 15. Create / Edit News

Potential fields:

``` text
Headline
Slug
Summary
Content
Featured Image
Author
Category
Tags
Publish Date
Status
```

Actual fields depend on backend.

------------------------------------------------------------------------

# 16. News Editor

The editor must support structured content where the backend supports
it.

Possible content features:

``` text
Heading
Paragraph
Bold
Italic
Lists
Links
Images
Quotes
```

If the backend stores plain HTML/Markdown/rich-text JSON, use the
corresponding format.

Do not build a complex editor until the backend content format is
confirmed.

------------------------------------------------------------------------

# 17. Blog Management

## 17.1 Blog List

Route:

``` text
AdminBlogsScreen
```

Layout:

``` text
Blogs

Manage HRSJM blog content.

[+ Add Blog]

[Search........................] [Filters]

[All] [Published] [Draft]

Blog Cards
```

------------------------------------------------------------------------

# 18. Blog Card

Display:

``` text
Cover Image
Title
Excerpt
Author
Published Date
Category
Status
```

Example:

``` text
┌─────────────────────────────────────┐
│ [Cover Image]                       │
│                                     │
│ Understanding Your Legal Rights     │
│ 28 Sep 2026 • HRSJM                │
│                                     │
│ [Published]                    ⋮    │
└─────────────────────────────────────┘
```

------------------------------------------------------------------------

# 19. Blog Create / Edit

Potential fields:

``` text
Title
Slug
Excerpt
Content
Cover Image
Author
Category
Tags
Publish Date
Status
```

Use the actual backend DTO once confirmed.

------------------------------------------------------------------------

# 20. Know Your Rights

This module should provide a structured information area for
rights-related educational content.

Because it is not explicitly defined as an Admin screen in the current
Admin BRD, the following is a proposed UI/reference scope rather than a
confirmed backend contract.

------------------------------------------------------------------------

# 21. Rights List

Route:

``` text
AdminRightsScreen
```

Layout:

``` text
Know Your Rights

Manage educational rights information.

[+ Add Article]

[Search........................] [Filters]

[All] [Published] [Draft]

Rights Articles
```

Card:

``` text
┌─────────────────────────────────────┐
│ Fundamental Rights                  │
│                                     │
│ Learn about available rights...     │
│                                     │
│ Category: Legal Awareness           │
│ Updated: 28 Sep 2026                │
│                                     │
│ [Published]                    ⋮    │
└─────────────────────────────────────┘
```

------------------------------------------------------------------------

# 22. Rights Article

Potential fields:

``` text
Title
Category
Summary
Content
Featured Image
References
Tags
Status
```

Do not present legal information as authoritative legal advice unless
the organization's approved content explicitly supports that
presentation.

------------------------------------------------------------------------

# 23. Content Search

All four modules should support search where backend supports it.

``` text
Events → title/location
News → headline/content
Blogs → title/category
Rights → title/category
```

Use debouncing.

Do not query the backend on every keystroke.

------------------------------------------------------------------------

# 24. Content Filters

Common filters:

``` text
Status
Category
Date
Author
```

Module-specific filters should only be added when supported by the
backend.

------------------------------------------------------------------------

# 25. Content Status

Potential UI states:

``` text
Draft
Published
Unpublished
Archived
```

Do not hardcode these as backend enums until the API contract is
confirmed.

Create a mapping layer:

``` text
backendStatus
      ↓
statusLabel
      ↓
AdminStatusBadge
```

------------------------------------------------------------------------

# 26. Images

Content modules will commonly use:

``` text
Cover Image
Thumbnail
Featured Image
Inline Image
```

Use the shared image picker/uploader.

Upload flow:

``` text
Select Image
   ↓
Validate
   ↓
Compress if required
   ↓
Upload
   ↓
Receive backend URL / asset ID
   ↓
Save content
```

Do not upload files directly to an arbitrary third-party service.

Use the backend's approved storage flow.

------------------------------------------------------------------------

# 27. Image Validation

Recommended client-side checks:

``` text
Supported MIME type
Maximum file size
Image dimensions where required
Readable image
```

Server validation remains authoritative.

------------------------------------------------------------------------

# 28. Delete Flow

Never delete content immediately after a destructive tap.

Use:

``` text
Delete
 ↓
Confirmation Dialog
 ↓
"Delete this content?"
 ↓
Cancel / Delete
 ↓
API
 ↓
Success Toast
```

If backend supports archive/soft-delete, use that instead of hard
deletion.

------------------------------------------------------------------------

# 29. Publish Flow

Use confirmation where publishing is consequential:

``` text
Publish
 ↓
Confirmation
 ↓
API
 ↓
Success
 ↓
Refresh list/detail
```

For content that requires review/approval, the backend workflow takes
precedence.

------------------------------------------------------------------------

# 30. Permission Model

The current Admin BRD establishes dynamic backend permission resolution
and a 47-permission catalog. fileciteturn5file5L1-L20

For Suraj's content modules:

> Exact permissions are **not defined in the current Admin BRD**.

Possible future permission naming could be:

``` text
event.read
event.create
event.update
event.delete
event.publish

news.read
news.create
news.update
news.delete
news.publish

blog.read
blog.create
blog.update
blog.delete
blog.publish

rights.read
rights.create
rights.update
rights.delete
rights.publish
```

These are **proposed names only**.

Do not implement them until Mubasshir/backend confirms the actual
permission catalog.

------------------------------------------------------------------------

# 31. Permission-Aware UI

Example:

``` tsx
{can('event.create') && (
  <AppButton
    title="Add Event"
    onPress={handleAddEvent}
  />
)}
```

And:

``` tsx
{can('event.update') && (
  <ActionMenuItem
    label="Edit"
    onPress={handleEdit}
  />
)}
```

The backend is authoritative.

------------------------------------------------------------------------

# 32. API Contract Requirement

Before writing services, Suraj must obtain:

``` text
Event endpoints
News endpoints
Blog endpoints
Rights endpoints
```

For each module:

``` text
GET list
GET detail
POST create
PATCH update
DELETE/archive
PATCH publish/unpublish
```

Only implement operations actually supported by the backend.

------------------------------------------------------------------------

# 33. Service Architecture

Example:

``` text
events.service.ts

getEvents()
getEventById()
createEvent()
updateEvent()
publishEvent()
unpublishEvent()
deleteEvent()
```

Similarly:

``` text
news.service.ts
blogs.service.ts
rights.service.ts
```

Do not place Axios calls directly inside screens.

------------------------------------------------------------------------

# 34. Hook Architecture

Events:

``` text
useEvents()
useEventDetails()
useCreateEvent()
useUpdateEvent()
useEventStatus()
```

News:

``` text
useNews()
useNewsDetails()
useCreateNews()
useUpdateNews()
useNewsStatus()
```

Blogs:

``` text
useBlogs()
useBlogDetails()
useCreateBlog()
useUpdateBlog()
useBlogStatus()
```

Rights:

``` text
useRights()
useRightDetails()
useCreateRight()
useUpdateRight()
useRightStatus()
```

Only create mutations corresponding to actual backend endpoints.

------------------------------------------------------------------------

# 35. TypeScript Types

Events:

``` text
Event
EventListItem
EventDetails
EventQuery
EventStatus
CreateEventPayload
UpdateEventPayload
```

News:

``` text
News
NewsListItem
NewsDetails
NewsQuery
NewsStatus
CreateNewsPayload
UpdateNewsPayload
```

Blogs:

``` text
Blog
BlogListItem
BlogDetails
BlogQuery
BlogStatus
CreateBlogPayload
UpdateBlogPayload
```

Rights:

``` text
RightArticle
RightListItem
RightDetails
RightQuery
RightStatus
CreateRightPayload
UpdateRightPayload
```

Types must match backend DTOs.

------------------------------------------------------------------------

# 36. Pagination

Use:

``` text
FlatList
Pull-to-refresh
Load more
```

Example:

``` text
Page 1
 ↓
Scroll
 ↓
Page 2
 ↓
Append
```

Prevent duplicate records during:

``` text
Refresh
Pagination
Filter change
Search change
```

------------------------------------------------------------------------

# 37. Loading States

Every content screen needs:

``` text
Initial loading
Refresh loading
Pagination loading
Create loading
Update loading
Publish loading
Delete loading
Image upload loading
```

------------------------------------------------------------------------

# 38. Empty States

Events:

``` text
No Events Found
```

News:

``` text
No News Found
```

Blogs:

``` text
No Blogs Found
```

Rights:

``` text
No Rights Articles Found
```

If filters are active:

``` text
No results match your filters.

[Clear Filters]
```

------------------------------------------------------------------------

# 39. Error States

Examples:

``` text
Unable to load events.
[Retry]
```

``` text
Unable to publish this article.
[Retry]
```

Never display:

``` text
AxiosError
500 Internal Server Error
SQL error
Stack trace
```

directly to the user.

------------------------------------------------------------------------

# 40. Forms

All create/edit forms should use the shared form architecture.

Recommended:

``` text
react-hook-form
```

with the project's agreed validation library/schema.

Form states:

``` text
Initial
Editing
Submitting
Success
Validation Error
Server Error
```

------------------------------------------------------------------------

# 41. Form Validation

Validate:

``` text
Required title
Required content
Date/time where applicable
Valid URLs
Image requirements
Maximum lengths
```

But backend validation remains authoritative.

Do not duplicate complicated business rules unnecessarily.

------------------------------------------------------------------------

# 42. Event Date Handling

Use a centralized date/time utility.

Display:

``` text
28 Sep 2026
10:00 AM
```

Handle:

``` text
Timezone
Start date
End date
Start time
End time
```

according to the backend's timezone contract.

------------------------------------------------------------------------

# 43. Content Preview

Before publishing, provide:

``` text
Preview
```

Flow:

``` text
Edit
 ↓
Preview
 ↓
Publish
```

Preview should represent the public-facing presentation as closely as
practical.

------------------------------------------------------------------------

# 44. Public/Admin Separation

Suraj builds the **Admin management interface**.

He does not create an independent public website inside the Admin
module.

The conceptual relationship is:

``` text
Admin Content
      ↓
Backend
      ↓
Public HRSJM Experience
```

------------------------------------------------------------------------

# 45. Navigation

The current Admin BRD defines the Admin bottom navigation as:

``` text
Dashboard
Members
Applications
Complaints
More
```

and does not define a Content Management bottom-nav item.
fileciteturn5file1L1-L25

Therefore Suraj's content screens should normally be reached through the
existing **More**/admin navigation architecture unless the team
explicitly adds a Content section.

Do not change the global navigation without Mubasshir/Aman's approval.

------------------------------------------------------------------------

# 46. Content Menu Proposal

If the backend confirms these modules, a More-menu grouping can be:

``` text
More
│
├── Donations
├── Receipts
├── Financial Reports
├── Accounting
├── Events
├── News
├── Blogs
├── Know Your Rights
├── Roles & Permissions
└── Settings
```

This is a navigation proposal, not a current BRD requirement.

------------------------------------------------------------------------

# 47. Shared API Boundary

Suraj consumes:

``` text
core/api/client.ts
```

Example:

``` text
events.service.ts
      ↓
apiClient.get(...)
```

The shared client handles:

``` text
Base URL
Authorization
Refresh Token
401 handling
Common errors
Request headers
```

Do not duplicate these concerns.

------------------------------------------------------------------------

# 48. Security

Content forms must not expose:

``` text
Access Token
Refresh Token
Private API Keys
Storage Secrets
Backend credentials
```

Do not log complete content payloads if they contain:

``` text
private drafts
internal notes
user information
private URLs
```

------------------------------------------------------------------------

# 49. Accessibility

Content cards and actions should have:

``` text
accessibilityLabel
accessibilityRole
accessible
```

Examples:

``` text
"Edit event"
"Publish news article"
"Delete blog"
"Open rights article"
```

Touch targets should be large enough for mobile interaction.

------------------------------------------------------------------------

# 50. Android Testing

Test on Android:

``` text
Events
News
Blogs
Rights
Create
Edit
Publish
Unpublish
Delete
Search
Filters
Pagination
Image upload
Keyboard behavior
Back button
Permissions
```

------------------------------------------------------------------------

# 51. iOS Testing

Test on iOS:

``` text
Events
News
Blogs
Rights
Create
Edit
Publish
Unpublish
Delete
Search
Filters
Pagination
Image picker
Safe areas
Keyboard
Navigation gestures
Permissions
```

------------------------------------------------------------------------

# 52. Component Tests

At minimum:

``` text
EventCard
NewsCard
BlogCard
RightArticleCard
StatusBadge
ContentFilters
ContentForm
PublishConfirmation
DeleteConfirmation
```

Test:

``` text
Normal
Loading
Disabled
Empty
Error
Permission restricted
```

------------------------------------------------------------------------

# 53. Integration Tests

For each module:

``` text
[ ] List loads
[ ] Search works
[ ] Filters work
[ ] Pagination works
[ ] Details open
[ ] Create works
[ ] Edit works
[ ] Publish works
[ ] Unpublish works
[ ] Delete/archive works
[ ] Refresh works
```

Only check operations that exist in the backend.

------------------------------------------------------------------------

# 54. Git Branches

Recommended:

``` text
feature/suraj/content
feature/suraj/events
feature/suraj/news
feature/suraj/blogs
feature/suraj/rights
```

Development order:

``` text
events
  ↓
news
  ↓
blogs
  ↓
rights
  ↓
integration
```

------------------------------------------------------------------------

# 55. Commit Convention

``` text
feat(events): implement events list
feat(events): add event form
feat(events): add event publishing
feat(news): implement news management
feat(blogs): implement blog management
feat(rights): implement rights article management
fix(content): fix image upload state
test(events): add event card tests
```

------------------------------------------------------------------------

# 56. Pull Request Requirements

Every PR should contain:

``` text
Summary
Screens
Components
API endpoints
Permissions
Validation
Testing
Android status
iOS status
Screenshots
Known issues
```

------------------------------------------------------------------------

# 57. Definition of Done

For each content module:

``` text
[ ] UI implemented
[ ] Backend contract confirmed
[ ] TypeScript types created
[ ] Service created
[ ] Hooks created
[ ] List screen
[ ] Details screen
[ ] Create form
[ ] Edit form
[ ] Search
[ ] Filters
[ ] Pagination
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Permission checks
[ ] Publish/unpublish where supported
[ ] Delete/archive where supported
[ ] Image upload where supported
[ ] Android tested
[ ] iOS tested
[ ] Unit/component tests
[ ] TypeScript clean
[ ] ESLint clean
[ ] No debug logs
[ ] PR reviewed
```

------------------------------------------------------------------------

# 58. Development Sequence

## Phase 0 --- Backend Contract

Before UI/API implementation:

``` text
[ ] Confirm Events API
[ ] Confirm News API
[ ] Confirm Blogs API
[ ] Confirm Rights API
[ ] Confirm DTOs
[ ] Confirm status enums
[ ] Confirm permissions
[ ] Confirm image upload flow
[ ] Confirm pagination
```

## Phase 1 --- Events

``` text
List
Search
Filters
Details
Create
Edit
Publish
Unpublish
Delete
```

## Phase 2 --- News

``` text
List
Search
Filters
Details
Create
Edit
Publish
Unpublish
Delete
```

## Phase 3 --- Blogs

``` text
List
Search
Filters
Details
Create
Edit
Publish
Unpublish
Delete
```

## Phase 4 --- Know Your Rights

``` text
List
Search
Filters
Details
Create
Edit
Publish
Unpublish
Delete
```

## Phase 5 --- Final Integration

``` text
Navigation
Permissions
API errors
Image uploads
Android
iOS
Testing
PR
```

------------------------------------------------------------------------

# 59. Dependencies

## Mubasshir

Suraj depends on Mubasshir for:

``` text
Shared API client
Authentication
Token refresh
RBAC / permission helper
Navigation architecture
Backend endpoint confirmation
Backend DTO confirmation
Backend permission confirmation
```

## Aman

Suraj depends on Aman for:

``` text
Design system
Shared components
Image picker/uploader UI
Forms
Cards
Buttons
Filters
Header
Dialogs
```

------------------------------------------------------------------------

# 60. Backend Gap Checklist

Because the current Admin BRD does not define these content-management
modules, this must be resolved before final API integration:

``` text
[ ] Events module exists in backend
[ ] News module exists in backend
[ ] Blogs module exists in backend
[ ] Know Your Rights module exists in backend

[ ] CRUD endpoints confirmed
[ ] Publish endpoints confirmed
[ ] Delete/archive endpoints confirmed
[ ] Image upload endpoints confirmed
[ ] Permission catalog confirmed
[ ] Status enums confirmed
[ ] Pagination format confirmed
[ ] Search format confirmed
```

Do not use fake APIs to hide a backend gap.

------------------------------------------------------------------------

# 61. Final Responsibility Matrix

  -----------------------------------------------------------------------------------
  Module         UI      API   Search   Filters     CRUD   Publish    Image   Testing
  -------- -------- -------- -------- --------- -------- --------- -------- ---------
  Events         ✅     ✅\*     ✅\*      ✅\*     ✅\*      ✅\*     ✅\*        ✅

  News           ✅     ✅\*     ✅\*      ✅\*     ✅\*      ✅\*     ✅\*        ✅

  Blogs          ✅     ✅\*     ✅\*      ✅\*     ✅\*      ✅\*     ✅\*        ✅

  Know           ✅     ✅\*     ✅\*      ✅\*     ✅\*      ✅\*     ✅\*        ✅
  Your                                                                      
  Rights                                                                    
  -----------------------------------------------------------------------------------

`*` = must be confirmed against the backend contract before
implementation.

------------------------------------------------------------------------

# 62. What Suraj Does NOT Own

Suraj must not implement:

``` text
Authentication
Token Refresh
Global API Client
Global RBAC
Dashboard
Members
Membership Applications
Membership Categories
Payment Verification
Donations Management
Accounting
Expense Vouchers
Receipt Vouchers
Financial Reports
Assistance Review
Support Tickets
Notifications
Settings
```

Those are assigned to other developers.

------------------------------------------------------------------------

# 63. Final Objective

> **Suraj's objective is to build the HRSJM Admin content-management
> experience for Events, News, Blogs, and Know Your Rights using the
> shared React Native architecture, while keeping the implementation
> strictly aligned with the backend contract once those content APIs and
> permissions are confirmed.**

Core rules:

\`\`\`text Use shared infrastructure. Use shared UI. Do not invent APIs.
Do not invent permissions. Do not duplicate authentication/RBAC. Do not
change global navigation independently. Confirm the content backend
contract first. Build Android + iOS from the same React Native codebase.
