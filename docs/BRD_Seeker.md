
---

## 8. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 8.1 Seeker-Relevant Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/
â”‚   â”œâ”€â”€ app/src/main/
â”‚   â”‚   â”œâ”€â”€ AndroidManifest.xml         # INTERNET, CAMERA, READ/WRITE_EXTERNAL_STORAGE, USE_BIOMETRIC
â”‚   â”‚   â”œâ”€â”€ res/xml/network_security_config.xml  # SSL pinning for api.hrsjm.org
â”‚   â”‚   â””â”€â”€ build.gradle                # minSdk 24, targetSdk 34
â”‚   â””â”€â”€ gradle.properties               # hermesEnabled=true
â”‚
â”œâ”€â”€ ios/
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ Info.plist
â”‚   â”‚   â”‚   # NSCameraUsageDescription â†’ "Scan and upload your supporting documents"
â”‚   â”‚   â”‚   # NSPhotoLibraryUsageDescription â†’ "Upload hospital bills and income certificates"
â”‚   â”‚   â”‚   # NSFaceIDUsageDescription â†’ "Secure your account with Face ID"
â”‚   â”‚   â””â”€â”€ AppDelegate.swift
â”‚   â””â”€â”€ Podfile                         # platform :ios, '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts
â”‚   â”‚   â”œâ”€â”€ interceptors/auth.interceptor.ts
â”‚   â”‚   â”œâ”€â”€ auth.api.ts
â”‚   â”‚   â”œâ”€â”€ assistance.api.ts           # POST /assistance-requests, GET /my, POST /:id/documents
â”‚   â”‚   â”œâ”€â”€ support.api.ts
â”‚   â”‚   â””â”€â”€ notifications.api.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                      # Inter / Poppins TTF
â”‚   â”‚   â”œâ”€â”€ icons/                      # Aid category icons (medical, education, disaster, welfare)
â”‚   â”‚   â””â”€â”€ images/                     # Seeker onboarding, empty state (WebP)
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx               # SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FormSelect.tsx          # Aid category picker
â”‚   â”‚   â”‚   â”œâ”€â”€ FormDatePicker.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DocumentUpload.tsx      # Camera + gallery + file picker
â”‚   â”‚   â”‚   â””â”€â”€ StepProgress.tsx        # â—â—â—‹â—‹ multi-step indicator
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx
â”‚   â”‚   â””â”€â”€ assistance/
â”‚   â”‚       â”œâ”€â”€ AidCategoryCard.tsx     # Category selection card (Medical/Education/etc.)
â”‚   â”‚       â”œâ”€â”€ TimelineStepper.tsx     # Visual aid application progress tracker
â”‚   â”‚       â”œâ”€â”€ AidRequestCard.tsx      # Request summary card with status
â”‚   â”‚       â””â”€â”€ DocumentStatusRow.tsx   # Doc name + VERIFIED/PENDING/REJECTED badge
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                   # SeekerColors (#0D9488 teal accent)
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts
â”‚   â”‚   â””â”€â”€ enums.ts                    # AidCategory, AidStatus, DocumentStatus
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts
â”‚   â”‚   â””â”€â”€ usePermissions.ts           # Camera, storage permissions
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ SeekerTabNavigator.tsx      # Home | My Requests | Support | More
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx    # Seeker-specific: compassion slides
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ SeekerHomeScreen.tsx    # Active request banner + quick actions
â”‚   â”‚   â”œâ”€â”€ assistance/
â”‚   â”‚   â”‚   â”œâ”€â”€ AidApplyScreen.tsx      # 4-step form (category â†’ details â†’ description â†’ docs)
â”‚   â”‚   â”‚   â””â”€â”€ AidTrackerScreen.tsx    # Request list + timeline detail view
â”‚   â”‚   â”œâ”€â”€ receipts/
â”‚   â”‚   â”‚   â””â”€â”€ DocumentVaultScreen.tsx # Aid application documents vault
â”‚   â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”‚   â”œâ”€â”€ TicketsListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateTicketScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TicketChatScreen.tsx
â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚       â”œâ”€â”€ NotificationsScreen.tsx
â”‚   â”‚       â””â”€â”€ ProfileSettingsScreen.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â””â”€â”€ appStore.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â”œâ”€â”€ assistance.types.ts         # AssistanceRequest, AidDocument, AidStatus
â”‚   â”‚   â””â”€â”€ support.types.ts
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts
â”‚       â”œâ”€â”€ date.ts
â”‚       â”œâ”€â”€ validators.ts               # Aadhaar: 12-digit numeric, amount > 0
â”‚       â”œâ”€â”€ storage.ts
â”‚       â””â”€â”€ keychain.ts
â”‚
â”œâ”€â”€ __tests__/seeker/
â”œâ”€â”€ e2e/seeker/
â”œâ”€â”€ App.tsx
â””â”€â”€ package.json
```

---

## 9. Seeker Role â€” Test Cases

### TC-SEEK-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-001 | Register | Fill all fields â†’ Create Account | Account created â†’ navigate to Login |
| TC-SEEK-002 | Login â€” Valid | Correct email + password | Navigate to Seeker Home Dashboard |
| TC-SEEK-003 | Login â€” Invalid | Wrong password | Error toast: "Invalid email or password" |
| TC-SEEK-004 | Biometric Login | Enable + use fingerprint/Face ID | Authenticated successfully |
| TC-SEEK-005 | Forgot Password | Enter email â†’ submit | Reset token dispatched |
| TC-SEEK-006 | Reset Password | New password via token | "Password reset" â†’ Login |
| TC-SEEK-007 | Token Auto-Refresh | Token expires mid-use | Silent refresh, no interruption |
| TC-SEEK-008 | Logout | Confirm logout | Token revoked, Keychain cleared, Login screen |

### TC-SEEK-HOME â€” Home Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-009 | Home â€” Active Request | Login with in-review request | Active request banner with timeline progress shown |
| TC-SEEK-010 | Home â€” No Request | Login without any request | "Apply for Aid" CTA banner shown |
| TC-SEEK-011 | Home â€” Navigate to Tracker | Tap "Track My Application" | Navigate to AidTrackerScreen |
| TC-SEEK-012 | Home â€” Navigate to Apply | Tap "Apply for Aid" | Navigate to AidApplyScreen (Step 1) |

### TC-SEEK-APPLY â€” Aid Application (4-Step Form)

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-013 | Step 1 â€” Select Medical | Tap "Medical Treatment" | Navigate to Step 2, category saved |
| TC-SEEK-014 | Step 1 â€” Select Education | Tap "Education Fee" | Navigate to Step 2, category = EDUCATION |
| TC-SEEK-015 | Step 1 â€” Select Disaster | Tap "Disaster Relief" | Category = DISASTER_RELIEF |
| TC-SEEK-016 | Step 1 â€” Select Welfare | Tap "Widow/Orphan Pension" | Category = WIDOW_ORPHAN |
| TC-SEEK-017 | Step 2 â€” All Fields Required | Submit Step 2 empty | All required field errors shown |
| TC-SEEK-018 | Step 2 â€” Valid Aadhaar | Enter 12-digit number | Accepted, no error |
| TC-SEEK-019 | Step 2 â€” Invalid Aadhaar | Enter 8-digit number | Error: "Aadhaar must be 12 digits" |
| TC-SEEK-020 | Step 2 â€” Valid Income | Fill all fields â†’ Next | Navigate to Step 3 |
| TC-SEEK-021 | Step 3 â€” Description Too Short | Enter < 100 characters â†’ Next | Error: "Please describe your situation in more detail" |
| TC-SEEK-022 | Step 3 â€” Zero Amount | Enter â‚¹0 â†’ Next | Error: "Please enter the amount you need" |
| TC-SEEK-023 | Step 3 â€” Valid Description | 100+ char description + amount â†’ Next | Navigate to Step 4 |
| TC-SEEK-024 | Step 4 â€” Upload Hospital Bill | Tap Upload â†’ select PDF | Preview shown, file name displayed |
| TC-SEEK-025 | Step 4 â€” Upload via Camera | Tap Camera â†’ capture | Photo captured, shown as uploaded |
| TC-SEEK-026 | Step 4 â€” File Size Exceeded | Upload file > 5MB | Error: "File must be less than 5MB" |
| TC-SEEK-027 | Step 4 â€” Submit Incomplete | Submit with missing required docs | Error: "Please upload all required documents" |
| TC-SEEK-028 | Step 4 â€” Submit Complete | All docs uploaded â†’ Submit | API success, reference number shown (ASST-YYYYMMDD-####) |
| TC-SEEK-029 | Submit Success Screen | After submit | Navigate to tracker with SUBMITTED status |
| TC-SEEK-030 | Duplicate Application | Apply same category when active request exists | Error or redirect to existing tracker |

### TC-SEEK-TRACK â€” Application Status Tracker

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-031 | View All Requests | Tap "My Requests" tab | All personal aid requests listed |
| TC-SEEK-032 | View SUBMITTED Status | Tap active request | Step 1 (Submitted) shows green âœ…, Step 2+ pending |
| TC-SEEK-033 | View UNDER_REVIEW Status | Request in review | Step 2 highlighted as active â³ |
| TC-SEEK-034 | View FIELD_VISIT Status | Admin schedules visit | Step 3 shown as active with date/note |
| TC-SEEK-035 | View APPROVED Status | Admin approves | Step 4 shows âœ… Approved with amount and date |
| TC-SEEK-036 | View REJECTED Status | Admin rejects | Step 4 shows âŒ Rejected with rejection reason text |
| TC-SEEK-037 | View Past Approved Request | Tap old request | Full timeline shown with disbursement date |
| TC-SEEK-038 | Pull to Refresh | Swipe down on tracker | Latest status fetched from API |

### TC-SEEK-DOCS â€” Document Vault

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-039 | View Document Statuses | More â†’ My Documents | All docs listed with VERIFIED/PENDING/REJECTED badges |
| TC-SEEK-040 | View VERIFIED Doc | Tap VERIFIED doc | Opens doc preview |
| TC-SEEK-041 | Re-upload REJECTED Doc | Tap "Re-upload" on REJECTED | File picker opens, new file uploaded |
| TC-SEEK-042 | Re-upload Pending Doc | Attempt re-upload on PENDING doc | Not allowed â€” "Document is under review" message |

### TC-SEEK-NOTIF â€” Notifications

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-043 | Receive Application Submitted Notification | After submitting | Push notification: "Application received" |
| TC-SEEK-044 | Receive Under Review Notification | Admin moves to review | Push: "Your application is under review" |
| TC-SEEK-045 | Receive Approval Notification | Admin approves | Push: "Your aid of â‚¹X has been approved!" |
| TC-SEEK-046 | Receive Disbursement Notification | Amount disbursed | Push: "â‚¹X has been transferred to you" |
| TC-SEEK-047 | Receive Rejection Notification | Admin rejects | Push: "Application update - please check details" |
| TC-SEEK-048 | Document Action Required | Doc rejected | Push: "Please re-upload your income certificate" |
| TC-SEEK-049 | Notification â€” Tap to Open | Tap push notification | Deep-navigate to relevant AidTrackerScreen |

### TC-SEEK-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-050 | Create Ticket â€” Application Query | Category: Application Status â†’ Submit | Ticket created OPEN |
| TC-SEEK-051 | Create Ticket â€” Document Issue | Category: Document Issue â†’ Submit | Ticket created with correct category |
| TC-SEEK-052 | View Ticket Thread | Tap ticket | Messages shown in chronological chat bubbles |
| TC-SEEK-053 | Send Message | Type + Send | Message saved, appears on right side |
| TC-SEEK-054 | Receive Admin Reply | Admin replies via Admin panel | Message appears on left side of chat |

### TC-SEEK-SETTINGS â€” Profile & Security

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-055 | Edit Address | Settings â†’ Edit Profile â†’ Update address | Profile updated with new address |
| TC-SEEK-056 | Change Password | Old + new â†’ Save | Password changed, session maintained |
| TC-SEEK-057 | Toggle Biometrics | Enable biometric in settings | Next app open shows biometric prompt |

### TC-SEEK-RBAC â€” Role Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-058 | Cannot Access Membership Screens | Navigate to /membership | Blocked, redirected to Seeker Home |
| TC-SEEK-059 | Cannot Access Donation Checkout | Navigate to /donate | Blocked, redirected |
| TC-SEEK-060 | Cannot Access Admin Panel | Navigate to /admin | 401 â€” Unauthorized |
| TC-SEEK-061 | Owns Only Own Requests | GET /assistance-requests | Returns only current user's requests |
| TC-SEEK-062 | Cannot View Others' Documents | GET /assistance-requests/:otherId | 403 â€” Forbidden (ownership check) |


---

## 8. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 8.1 Seeker-Relevant Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/
â”‚   â”œâ”€â”€ app/src/main/
â”‚   â”‚   â”œâ”€â”€ AndroidManifest.xml         # INTERNET, CAMERA, READ/WRITE_EXTERNAL_STORAGE, USE_BIOMETRIC
â”‚   â”‚   â”œâ”€â”€ res/xml/network_security_config.xml  # SSL pinning for api.hrsjm.org
â”‚   â”‚   â””â”€â”€ build.gradle                # minSdk 24, targetSdk 34
â”‚   â””â”€â”€ gradle.properties               # hermesEnabled=true
â”‚
â”œâ”€â”€ ios/
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ Info.plist
â”‚   â”‚   â”‚   # NSCameraUsageDescription â†’ "Scan and upload your supporting documents"
â”‚   â”‚   â”‚   # NSPhotoLibraryUsageDescription â†’ "Upload hospital bills and income certificates"
â”‚   â”‚   â”‚   # NSFaceIDUsageDescription â†’ "Secure your account with Face ID"
â”‚   â”‚   â””â”€â”€ AppDelegate.swift
â”‚   â””â”€â”€ Podfile                         # platform :ios, '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts
â”‚   â”‚   â”œâ”€â”€ interceptors/auth.interceptor.ts
â”‚   â”‚   â”œâ”€â”€ auth.api.ts
â”‚   â”‚   â”œâ”€â”€ assistance.api.ts           # POST /assistance-requests, GET /my, POST /:id/documents
â”‚   â”‚   â”œâ”€â”€ support.api.ts
â”‚   â”‚   â””â”€â”€ notifications.api.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                      # Inter / Poppins TTF
â”‚   â”‚   â”œâ”€â”€ icons/                      # Aid category icons (medical, education, disaster, welfare)
â”‚   â”‚   â””â”€â”€ images/                     # Seeker onboarding, empty state (WebP)
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx               # SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FormSelect.tsx          # Aid category picker
â”‚   â”‚   â”‚   â”œâ”€â”€ FormDatePicker.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DocumentUpload.tsx      # Camera + gallery + file picker
â”‚   â”‚   â”‚   â””â”€â”€ StepProgress.tsx        # â—â—â—‹â—‹ multi-step indicator
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx
â”‚   â”‚   â””â”€â”€ assistance/
â”‚   â”‚       â”œâ”€â”€ AidCategoryCard.tsx     # Category selection card (Medical/Education/etc.)
â”‚   â”‚       â”œâ”€â”€ TimelineStepper.tsx     # Visual aid application progress tracker
â”‚   â”‚       â”œâ”€â”€ AidRequestCard.tsx      # Request summary card with status
â”‚   â”‚       â””â”€â”€ DocumentStatusRow.tsx   # Doc name + VERIFIED/PENDING/REJECTED badge
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                   # SeekerColors (#0D9488 teal accent)
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts
â”‚   â”‚   â””â”€â”€ enums.ts                    # AidCategory, AidStatus, DocumentStatus
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts
â”‚   â”‚   â””â”€â”€ usePermissions.ts           # Camera, storage permissions
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ SeekerTabNavigator.tsx      # Home | My Requests | Support | More
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx    # Seeker-specific: compassion slides
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ SeekerHomeScreen.tsx    # Active request banner + quick actions
â”‚   â”‚   â”œâ”€â”€ assistance/
â”‚   â”‚   â”‚   â”œâ”€â”€ AidApplyScreen.tsx      # 4-step form (category â†’ details â†’ description â†’ docs)
â”‚   â”‚   â”‚   â””â”€â”€ AidTrackerScreen.tsx    # Request list + timeline detail view
â”‚   â”‚   â”œâ”€â”€ receipts/
â”‚   â”‚   â”‚   â””â”€â”€ DocumentVaultScreen.tsx # Aid application documents vault
â”‚   â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”‚   â”œâ”€â”€ TicketsListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateTicketScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TicketChatScreen.tsx
â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚       â”œâ”€â”€ NotificationsScreen.tsx
â”‚   â”‚       â””â”€â”€ ProfileSettingsScreen.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â””â”€â”€ appStore.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â”œâ”€â”€ assistance.types.ts         # AssistanceRequest, AidDocument, AidStatus
â”‚   â”‚   â””â”€â”€ support.types.ts
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts
â”‚       â”œâ”€â”€ date.ts
â”‚       â”œâ”€â”€ validators.ts               # Aadhaar: 12-digit numeric, amount > 0
â”‚       â”œâ”€â”€ storage.ts
â”‚       â””â”€â”€ keychain.ts
â”‚
â”œâ”€â”€ __tests__/seeker/
â”œâ”€â”€ e2e/seeker/
â”œâ”€â”€ App.tsx
â””â”€â”€ package.json
```

---

## 9. Seeker Role â€” Test Cases

### TC-SEEK-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-001 | Register | Fill all fields â†’ Create Account | Account created â†’ navigate to Login |
| TC-SEEK-002 | Login â€” Valid | Correct email + password | Navigate to Seeker Home Dashboard |
| TC-SEEK-003 | Login â€” Invalid | Wrong password | Error toast: "Invalid email or password" |
| TC-SEEK-004 | Biometric Login | Enable + use fingerprint/Face ID | Authenticated successfully |
| TC-SEEK-005 | Forgot Password | Enter email â†’ submit | Reset token dispatched |
| TC-SEEK-006 | Reset Password | New password via token | "Password reset" â†’ Login |
| TC-SEEK-007 | Token Auto-Refresh | Token expires mid-use | Silent refresh, no interruption |
| TC-SEEK-008 | Logout | Confirm logout | Token revoked, Keychain cleared, Login screen |

### TC-SEEK-HOME â€” Home Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-009 | Home â€” Active Request | Login with in-review request | Active request banner with timeline progress shown |
| TC-SEEK-010 | Home â€” No Request | Login without any request | "Apply for Aid" CTA banner shown |
| TC-SEEK-011 | Home â€” Navigate to Tracker | Tap "Track My Application" | Navigate to AidTrackerScreen |
| TC-SEEK-012 | Home â€” Navigate to Apply | Tap "Apply for Aid" | Navigate to AidApplyScreen (Step 1) |

### TC-SEEK-APPLY â€” Aid Application (4-Step Form)

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-013 | Step 1 â€” Select Medical | Tap "Medical Treatment" | Navigate to Step 2, category saved |
| TC-SEEK-014 | Step 1 â€” Select Education | Tap "Education Fee" | Navigate to Step 2, category = EDUCATION |
| TC-SEEK-015 | Step 1 â€” Select Disaster | Tap "Disaster Relief" | Category = DISASTER_RELIEF |
| TC-SEEK-016 | Step 1 â€” Select Welfare | Tap "Widow/Orphan Pension" | Category = WIDOW_ORPHAN |
| TC-SEEK-017 | Step 2 â€” All Fields Required | Submit Step 2 empty | All required field errors shown |
| TC-SEEK-018 | Step 2 â€” Valid Aadhaar | Enter 12-digit number | Accepted, no error |
| TC-SEEK-019 | Step 2 â€” Invalid Aadhaar | Enter 8-digit number | Error: "Aadhaar must be 12 digits" |
| TC-SEEK-020 | Step 2 â€” Valid Income | Fill all fields â†’ Next | Navigate to Step 3 |
| TC-SEEK-021 | Step 3 â€” Description Too Short | Enter < 100 characters â†’ Next | Error: "Please describe your situation in more detail" |
| TC-SEEK-022 | Step 3 â€” Zero Amount | Enter â‚¹0 â†’ Next | Error: "Please enter the amount you need" |
| TC-SEEK-023 | Step 3 â€” Valid Description | 100+ char description + amount â†’ Next | Navigate to Step 4 |
| TC-SEEK-024 | Step 4 â€” Upload Hospital Bill | Tap Upload â†’ select PDF | Preview shown, file name displayed |
| TC-SEEK-025 | Step 4 â€” Upload via Camera | Tap Camera â†’ capture | Photo captured, shown as uploaded |
| TC-SEEK-026 | Step 4 â€” File Size Exceeded | Upload file > 5MB | Error: "File must be less than 5MB" |
| TC-SEEK-027 | Step 4 â€” Submit Incomplete | Submit with missing required docs | Error: "Please upload all required documents" |
| TC-SEEK-028 | Step 4 â€” Submit Complete | All docs uploaded â†’ Submit | API success, reference number shown (ASST-YYYYMMDD-####) |
| TC-SEEK-029 | Submit Success Screen | After submit | Navigate to tracker with SUBMITTED status |
| TC-SEEK-030 | Duplicate Application | Apply same category when active request exists | Error or redirect to existing tracker |

### TC-SEEK-TRACK â€” Application Status Tracker

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-031 | View All Requests | Tap "My Requests" tab | All personal aid requests listed |
| TC-SEEK-032 | View SUBMITTED Status | Tap active request | Step 1 (Submitted) shows green âœ…, Step 2+ pending |
| TC-SEEK-033 | View UNDER_REVIEW Status | Request in review | Step 2 highlighted as active â³ |
| TC-SEEK-034 | View FIELD_VISIT Status | Admin schedules visit | Step 3 shown as active with date/note |
| TC-SEEK-035 | View APPROVED Status | Admin approves | Step 4 shows âœ… Approved with amount and date |
| TC-SEEK-036 | View REJECTED Status | Admin rejects | Step 4 shows âŒ Rejected with rejection reason text |
| TC-SEEK-037 | View Past Approved Request | Tap old request | Full timeline shown with disbursement date |
| TC-SEEK-038 | Pull to Refresh | Swipe down on tracker | Latest status fetched from API |

### TC-SEEK-DOCS â€” Document Vault

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-039 | View Document Statuses | More â†’ My Documents | All docs listed with VERIFIED/PENDING/REJECTED badges |
| TC-SEEK-040 | View VERIFIED Doc | Tap VERIFIED doc | Opens doc preview |
| TC-SEEK-041 | Re-upload REJECTED Doc | Tap "Re-upload" on REJECTED | File picker opens, new file uploaded |
| TC-SEEK-042 | Re-upload Pending Doc | Attempt re-upload on PENDING doc | Not allowed â€” "Document is under review" message |

### TC-SEEK-NOTIF â€” Notifications

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-043 | Receive Application Submitted Notification | After submitting | Push notification: "Application received" |
| TC-SEEK-044 | Receive Under Review Notification | Admin moves to review | Push: "Your application is under review" |
| TC-SEEK-045 | Receive Approval Notification | Admin approves | Push: "Your aid of â‚¹X has been approved!" |
| TC-SEEK-046 | Receive Disbursement Notification | Amount disbursed | Push: "â‚¹X has been transferred to you" |
| TC-SEEK-047 | Receive Rejection Notification | Admin rejects | Push: "Application update - please check details" |
| TC-SEEK-048 | Document Action Required | Doc rejected | Push: "Please re-upload your income certificate" |
| TC-SEEK-049 | Notification â€” Tap to Open | Tap push notification | Deep-navigate to relevant AidTrackerScreen |

### TC-SEEK-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-050 | Create Ticket â€” Application Query | Category: Application Status â†’ Submit | Ticket created OPEN |
| TC-SEEK-051 | Create Ticket â€” Document Issue | Category: Document Issue â†’ Submit | Ticket created with correct category |
| TC-SEEK-052 | View Ticket Thread | Tap ticket | Messages shown in chronological chat bubbles |
| TC-SEEK-053 | Send Message | Type + Send | Message saved, appears on right side |
| TC-SEEK-054 | Receive Admin Reply | Admin replies via Admin panel | Message appears on left side of chat |

### TC-SEEK-SETTINGS â€” Profile & Security

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-055 | Edit Address | Settings â†’ Edit Profile â†’ Update address | Profile updated with new address |
| TC-SEEK-056 | Change Password | Old + new â†’ Save | Password changed, session maintained |
| TC-SEEK-057 | Toggle Biometrics | Enable biometric in settings | Next app open shows biometric prompt |

### TC-SEEK-RBAC â€” Role Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-SEEK-058 | Cannot Access Membership Screens | Navigate to /membership | Blocked, redirected to Seeker Home |
| TC-SEEK-059 | Cannot Access Donation Checkout | Navigate to /donate | Blocked, redirected |
| TC-SEEK-060 | Cannot Access Admin Panel | Navigate to /admin | 401 â€” Unauthorized |
| TC-SEEK-061 | Owns Only Own Requests | GET /assistance-requests | Returns only current user's requests |
| TC-SEEK-062 | Cannot View Others' Documents | GET /assistance-requests/:otherId | 403 â€” Forbidden (ownership check) |
