
---

## 9. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 9.1 Full Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/                              # Native Android Project
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â””â”€â”€ main/
â”‚   â”‚   â”‚       â”œâ”€â”€ java/com/hrsjm/      # Native Java/Kotlin modules
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ MainActivity.kt
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ MainApplication.kt
â”‚   â”‚   â”‚       â”œâ”€â”€ res/                 # Android resources
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ drawable/        # Icons, splash assets
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ mipmap-*/        # Launcher icons (hdpi/xhdpi/xxhdpi)
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ values/          # strings.xml, colors.xml, styles.xml
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ xml/             # network_security_config.xml (SSL pinning)
â”‚   â”‚   â”‚       â””â”€â”€ AndroidManifest.xml  # Permissions: CAMERA, INTERNET, BIOMETRIC
â”‚   â”‚   â”œâ”€â”€ build.gradle                 # App-level Gradle: minSdk 24, targetSdk 34
â”‚   â”‚   â””â”€â”€ proguard-rules.pro           # ProGuard rules for release build obfuscation
â”‚   â”œâ”€â”€ build.gradle                     # Project-level Gradle
â”‚   â”œâ”€â”€ gradle.properties                # MMKV, Hermes engine flags
â”‚   â””â”€â”€ settings.gradle
â”‚
â”œâ”€â”€ ios/                                  # Native iOS Project
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ AppDelegate.swift             # App entry point
â”‚   â”‚   â”œâ”€â”€ Info.plist                    # Permissions: NSCamera, NSFaceID, NSPhotoLibrary
â”‚   â”‚   â”œâ”€â”€ LaunchScreen.storyboard      # Splash screen storyboard
â”‚   â”‚   â””â”€â”€ Images.xcassets/             # App icons (1x, 2x, 3x), launch images
â”‚   â”œâ”€â”€ HRSJM.xcworkspace                # Open this (not .xcodeproj)
â”‚   â”œâ”€â”€ Podfile                          # CocoaPods dependencies
â”‚   â””â”€â”€ Podfile.lock                     # Locked pod versions
â”‚
â”œâ”€â”€ src/                                  # Shared TypeScript Source (iOS + Android)
â”‚   â”‚
â”‚   â”œâ”€â”€ api/                             # HTTP layer â€” Axios + interceptors
â”‚   â”‚   â”œâ”€â”€ client.ts                    # Axios instance, base URL, timeout
â”‚   â”‚   â”œâ”€â”€ interceptors/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.interceptor.ts      # JWT attach + 401 refresh rotation
â”‚   â”‚   â”‚   â””â”€â”€ error.interceptor.ts     # Global error envelope normalization
â”‚   â”‚   â”œâ”€â”€ auth.api.ts                  # POST /auth/login, /register, /refresh
â”‚   â”‚   â”œâ”€â”€ membership.api.ts            # GET/POST /memberships, /membership-categories
â”‚   â”‚   â”œâ”€â”€ donation.api.ts              # GET/POST /donations, /donation-payments
â”‚   â”‚   â”œâ”€â”€ assistance.api.ts            # GET/POST /assistance-requests
â”‚   â”‚   â”œâ”€â”€ receipts.api.ts              # GET /receipts
â”‚   â”‚   â”œâ”€â”€ support.api.ts               # GET/POST /support/tickets
â”‚   â”‚   â”œâ”€â”€ notifications.api.ts         # GET /notifications
â”‚   â”‚   â”œâ”€â”€ admin.api.ts                 # Admin-only endpoints
â”‚   â”‚   â””â”€â”€ users.api.ts                 # GET/PATCH /users
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/                          # Static assets bundled with app
â”‚   â”‚   â”œâ”€â”€ fonts/
â”‚   â”‚   â”‚   â”œâ”€â”€ Inter-Regular.ttf
â”‚   â”‚   â”‚   â”œâ”€â”€ Inter-SemiBold.ttf
â”‚   â”‚   â”‚   â”œâ”€â”€ Inter-Bold.ttf
â”‚   â”‚   â”‚   â”œâ”€â”€ Poppins-Regular.ttf
â”‚   â”‚   â”‚   â””â”€â”€ Poppins-Bold.ttf
â”‚   â”‚   â”œâ”€â”€ icons/                       # SVG icons (react-native-svg)
â”‚   â”‚   â”‚   â”œâ”€â”€ home.svg
â”‚   â”‚   â”‚   â”œâ”€â”€ members.svg
â”‚   â”‚   â”‚   â”œâ”€â”€ donate.svg
â”‚   â”‚   â”‚   â””â”€â”€ ...
â”‚   â”‚   â””â”€â”€ images/                      # PNG/WebP illustration assets
â”‚   â”‚       â”œâ”€â”€ onboarding_1.webp
â”‚   â”‚       â”œâ”€â”€ onboarding_2.webp
â”‚   â”‚       â”œâ”€â”€ onboarding_3.webp
â”‚   â”‚       â”œâ”€â”€ logo_hrsjm.png
â”‚   â”‚       â””â”€â”€ empty_state_*.webp
â”‚   â”‚
â”‚   â”œâ”€â”€ components/                      # Reusable UI component library
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx               # Primary, Secondary, Outline variants
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx                # Controlled input with error state
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx                 # Elevated card container
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx                # Status badge (Active/Expiring/Inactive)
â”‚   â”‚   â”‚   â”œâ”€â”€ Avatar.tsx               # User avatar with initials fallback
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx               # Spinner + full-screen overlay
â”‚   â”‚   â”‚   â”œâ”€â”€ EmptyState.tsx           # Illustration + message for empty lists
â”‚   â”‚   â”‚   â”œâ”€â”€ Divider.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ProgressBar.tsx          # Campaign funding progress
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx            # React Hook Form controlled input
â”‚   â”‚   â”‚   â”œâ”€â”€ FormSelect.tsx           # Dropdown picker
â”‚   â”‚   â”‚   â”œâ”€â”€ FormDatePicker.tsx       # Date picker (Android + iOS native)
â”‚   â”‚   â”‚   â”œâ”€â”€ DocumentUpload.tsx       # Camera + gallery + file picker
â”‚   â”‚   â”‚   â””â”€â”€ StepProgress.tsx         # Multi-step form progress indicator
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx                # In-app toast notifications
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx                # Generic bottom sheet modal
â”‚   â”‚   â”‚   â”œâ”€â”€ ConfirmDialog.tsx        # Confirm/cancel dialog
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx         # Shimmer skeleton for list items
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx        # Offline/reconnected top banner
â”‚   â”‚   â”œâ”€â”€ membership/
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipCard.tsx       # Digital ID card with flip animation
â”‚   â”‚   â”‚   â”œâ”€â”€ CategoryCard.tsx         # Tier selection card
â”‚   â”‚   â”‚   â””â”€â”€ StatusTimeline.tsx       # Application/Aid status stepper
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚       â”œâ”€â”€ StatCard.tsx             # Dashboard metric card (blue/green/amber/red)
â”‚   â”‚       â”œâ”€â”€ DataTable.tsx            # Sortable table with checkboxes
â”‚   â”‚       â””â”€â”€ FilterModal.tsx          # Advanced filter bottom sheet
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                    # AdminColors, MemberColors, DonorColors, etc.
â”‚   â”‚   â”œâ”€â”€ typography.ts                # Font sizes, weights, line heights
â”‚   â”‚   â”œâ”€â”€ spacing.ts                   # Padding/margin scale (4, 8, 12, 16, 24, 32)
â”‚   â”‚   â”œâ”€â”€ storage-keys.ts              # MMKV key constants
â”‚   â”‚   â”œâ”€â”€ api-routes.ts                # All API endpoint strings
â”‚   â”‚   â””â”€â”€ enums.ts                     # MembershipStatus, PaymentStatus, AidCategory
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/                           # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ useAuth.ts                   # Auth state, login, logout actions
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts                # NetInfo connectivity watcher
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts             # Biometric availability + authentication
â”‚   â”‚   â”œâ”€â”€ usePermissions.ts            # Camera/gallery permission handlers
â”‚   â”‚   â””â”€â”€ useDebounce.ts               # Debounced search input hook
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/                      # React Navigation setup
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx            # Top-level: Auth vs App routing
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx            # Stack: Splash â†’ Onboarding â†’ Login â†’ Register
â”‚   â”‚   â”œâ”€â”€ AdminTabNavigator.tsx        # Admin bottom tabs (5 tabs)
â”‚   â”‚   â”œâ”€â”€ MemberTabNavigator.tsx       # Member bottom tabs (4 tabs)
â”‚   â”‚   â”œâ”€â”€ DonorTabNavigator.tsx        # Donor bottom tabs (4 tabs)
â”‚   â”‚   â”œâ”€â”€ SeekerTabNavigator.tsx       # Seeker bottom tabs (4 tabs)
â”‚   â”‚   â”œâ”€â”€ GuestTabNavigator.tsx        # Guest bottom tabs (3 tabs)
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts           # TypeScript route param types
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/                         # Screen containers (role-grouped)
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminDashboardScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminUsersScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminMembershipApprovalsScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminMembershipCategoriesScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminPaymentVerificationScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminExpenseVouchersScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminReceiptVouchersScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminDonationsScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminAccountingLedgerScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminReportsScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminAssistanceReviewScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminSupportScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ AdminRolesPermissionsScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”œâ”€â”€ MemberHomeScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DonorHomeScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SeekerHomeScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ GuestExploreScreen.tsx
â”‚   â”‚   â”œâ”€â”€ membership/
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipCategoriesScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipApplyStep1Screen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipApplyStep2Screen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipApplyStep3Screen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipCardScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ RenewalScreen.tsx
â”‚   â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseDetailScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DonationCheckoutScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PaymentSuccessScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ DonationHistoryScreen.tsx
â”‚   â”‚   â”œâ”€â”€ assistance/
â”‚   â”‚   â”‚   â”œâ”€â”€ AidApplyScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ AidTrackerScreen.tsx
â”‚   â”‚   â”œâ”€â”€ receipts/
â”‚   â”‚   â”‚   â”œâ”€â”€ ReceiptsListScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ DocumentVaultScreen.tsx
â”‚   â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”‚   â”œâ”€â”€ TicketsListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateTicketScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TicketChatScreen.tsx
â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚       â”œâ”€â”€ NotificationsScreen.tsx
â”‚   â”‚       â””â”€â”€ ProfileSettingsScreen.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ store/                           # State management (Zustand)
â”‚   â”‚   â”œâ”€â”€ authStore.ts                 # User, tokens, isAuthenticated, role
â”‚   â”‚   â”œâ”€â”€ appStore.ts                  # Network status, app theme, loading flags
â”‚   â”‚   â””â”€â”€ notificationStore.ts        # Unread count, notification list
â”‚   â”‚
â”‚   â”œâ”€â”€ types/                           # Global TypeScript interfaces
â”‚   â”‚   â”œâ”€â”€ api.types.ts                 # ApiResponse<T>, ApiError, PaginatedData<T>
â”‚   â”‚   â”œâ”€â”€ user.types.ts                # User, Role, Permission
â”‚   â”‚   â”œâ”€â”€ membership.types.ts          # Membership, MembershipCategory
â”‚   â”‚   â”œâ”€â”€ donation.types.ts            # Donation, DonationPayment, Receipt
â”‚   â”‚   â”œâ”€â”€ assistance.types.ts          # AssistanceRequest, AidDocument
â”‚   â”‚   â””â”€â”€ support.types.ts             # SupportTicket, TicketMessage
â”‚   â”‚
â”‚   â””â”€â”€ utils/                           # Pure utility functions
â”‚       â”œâ”€â”€ currency.ts                  # formatINR(12500) â†’ "â‚¹ 12,500.00"
â”‚       â”œâ”€â”€ date.ts                      # formatDate, daysDifference, isExpired
â”‚       â”œâ”€â”€ validators.ts                # PAN, Aadhaar, phone, email validators
â”‚       â”œâ”€â”€ storage.ts                   # MMKV read/write wrappers
â”‚       â”œâ”€â”€ keychain.ts                  # Keychain read/write for tokens
â”‚       â””â”€â”€ permissions.ts              # Camera, gallery, file permission checkers
â”‚
â”œâ”€â”€ __tests__/                           # Jest unit + integration tests
â”‚   â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ utils/
â”‚   â””â”€â”€ api/
â”‚
â”œâ”€â”€ e2e/                                 # Detox end-to-end tests
â”‚   â”œâ”€â”€ admin/
â”‚   â”œâ”€â”€ member/
â”‚   â”œâ”€â”€ donor/
â”‚   â”œâ”€â”€ seeker/
â”‚   â””â”€â”€ guest/
â”‚
â”œâ”€â”€ App.tsx                              # Root: Providers + NavigationContainer
â”œâ”€â”€ index.js                             # Entry point â€” AppRegistry
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ babel.config.js
â”œâ”€â”€ metro.config.js
â”œâ”€â”€ react-native.config.js              # Font & asset linking
â”œâ”€â”€ .env                                 # API_BASE_URL, PAYMENT_GATEWAY_KEY
â”œâ”€â”€ .env.production                     # Production env vars
â””â”€â”€ .env.staging                        # Staging env vars
```

### 9.2 Android-Specific Configuration Files

```text
android/app/src/main/
â”œâ”€â”€ AndroidManifest.xml         # Required permissions:
â”‚                               #   <uses-permission android:name="android.permission.INTERNET"/>
â”‚                               #   <uses-permission android:name="android.permission.CAMERA"/>
â”‚                               #   <uses-permission android:name="android.permission.USE_BIOMETRIC"/>
â”‚                               #   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
â”‚                               #   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
â”‚
â”œâ”€â”€ res/xml/network_security_config.xml   # SSL pinning config:
â”‚                               # <network-security-config>
â”‚                               #   <domain-config cleartextTrafficPermitted="false">
â”‚                               #     <domain includeSubdomains="true">api.hrsjm.org</domain>
â”‚                               #     <pin-set><pin digest="SHA-256">BASE64==</pin></pin-set>
â”‚                               #   </domain-config>
â”‚                               # </network-security-config>
â”‚
â””â”€â”€ build.gradle (app-level):
    android {
      compileSdkVersion 34
      defaultConfig {
        applicationId "com.hrsjm.app"
        minSdkVersion 24          // Android 7.0+
        targetSdkVersion 34       // Android 14
        versionCode 1
        versionName "1.0.0"
      }
      buildTypes {
        release {
          minifyEnabled true       // ProGuard obfuscation
          shrinkResources true
          proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
      }
    }
```

### 9.3 iOS-Specific Configuration Files

```text
ios/HRSJM/Info.plist             # Required permission descriptions:
  NSCameraUsageDescription       â†’ "HRSJM needs camera to scan/upload KYC documents"
  NSPhotoLibraryUsageDescription â†’ "HRSJM needs photo library for document uploads"
  NSFaceIDUsageDescription       â†’ "HRSJM uses Face ID for secure app access"
  NSContactsUsageDescription     â†’ (if contact autofill used)

ios/Podfile:
  platform :ios, '15.0'
  use_frameworks! :linkage => :static   # Required for Firebase + react-native-keychain

  pods include:
  - RNKeychain              # Secure token storage
  - RNMMKV                  # Fast cache storage
  - ReactNativeBiometrics   # Face ID / Touch ID
  - RNDocumentPicker
  - RNImagePickerManager
  - ReactNativeHapticFeedback
  - RNFirebaseMessaging     # FCM push notifications
  - Pods for payment gateway SDK
```

---

## 10. Admin Role â€” Test Cases

### TC-ADMIN-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-001 | Admin Login â€” Valid Credentials | Enter valid admin email + password â†’ tap Login | Navigate to Admin Dashboard, JWT stored in Keychain |
| TC-ADMIN-002 | Admin Login â€” Invalid Credentials | Enter wrong password | Error toast: "Invalid email or password" |
| TC-ADMIN-003 | Admin Login â€” Account Suspended | Login with suspended admin account | Error: "Your account has been deactivated" |
| TC-ADMIN-004 | Biometric Login | Enable biometrics after first login â†’ tap fingerprint/Face ID | Authenticate and navigate to Dashboard |
| TC-ADMIN-005 | Token Refresh | Let access token expire â†’ perform any API action | Interceptor silently refreshes token, request completes |
| TC-ADMIN-006 | Logout | Tap Logout â†’ confirm | Token revoked server-side, navigate to Login screen, Keychain cleared |

### TC-ADMIN-DASH â€” Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-007 | Dashboard Metrics Load | Open Dashboard tab | All 4 stat cards show correct counts (Total/Active/Expiring/Inactive) |
| TC-ADMIN-008 | Pending Actions â€” Navigate | Tap "X Membership Approvals Pending" | Navigate to Membership Approvals Queue |
| TC-ADMIN-009 | Revenue Summary | View Dashboard | Current month membership + donation income displayed |

### TC-ADMIN-USERS â€” User Management

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-010 | View All Members | Open Members tab | List shows all members with ID, validity, status |
| TC-ADMIN-011 | Search Member by Name | Type "Aman" in search bar | Filtered to matching members only |
| TC-ADMIN-012 | Filter by Status Active | Tap "Active" tab filter | Only ACTIVE members shown (count matches badge) |
| TC-ADMIN-013 | Filter by Expiring Soon | Tap "Expiring Soon" tab | Members with â‰¤ 30 days remaining shown |
| TC-ADMIN-014 | Deactivate a User | â‹® menu â†’ "Deactivate" â†’ confirm | User status changed to INACTIVE, row badge updates |
| TC-ADMIN-015 | Activate a User | â‹® menu â†’ "Activate" â†’ confirm | User status changed to ACTIVE |
| TC-ADMIN-016 | Bulk Select and Deactivate | Select 3 checkboxes â†’ "Deactivate Selected" | All 3 users deactivated in batch |

### TC-ADMIN-MEMBERSHIP â€” Membership Approvals

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-017 | View Pending Applications | Open Applications tab | Pending memberships listed with applicant details |
| TC-ADMIN-018 | View KYC Documents | Tap "View Documents" on application | KYC docs displayed inline (Identity, Address, Photo) |
| TC-ADMIN-019 | Approve Membership | Tap Approve â†’ confirm | Status â†’ APPROVED, membership number generated, applicant notified |
| TC-ADMIN-020 | Reject Membership | Tap Reject â†’ enter reason â†’ confirm | Status â†’ REJECTED, rejection reason saved, applicant notified |
| TC-ADMIN-021 | Create Membership Category | More â†’ Categories â†’ Create new | Category saved with name, code, fee, validity days |
| TC-ADMIN-022 | Deactivate Category | Toggle category status â†’ confirm | Category inactive, cannot be selected in new applications |

### TC-ADMIN-PAYMENTS â€” Payment Verification

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-023 | View Pending Payments | More â†’ Payments â†’ filter PENDING | All unverified payments listed |
| TC-ADMIN-024 | Verify Offline Payment | Tap "Verify" on cash payment â†’ confirm | Payment marked VERIFIED, receipt generated (RCP-#####), accounting journal posted |
| TC-ADMIN-025 | Idempotent Verification | Re-verify an already-verified payment | API returns 409 or graceful "already verified" message, no duplicate entry |

### TC-ADMIN-ACCOUNTING â€” Financial Engine

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-026 | View Chart of Accounts | More â†’ Accounting â†’ COA tab | All accounts listed in tree hierarchy |
| TC-ADMIN-027 | View Account Ledger | Tap account â†’ Ledger tab | Running debit/credit/balance per transaction |
| TC-ADMIN-028 | View Journal Entries | More â†’ Accounting â†’ Journal Entries tab | All entries listed with status (POSTED/REVERSED) |
| TC-ADMIN-029 | Reverse Journal Entry | Tap entry â†’ "Reverse Entry" â†’ confirm | Mirror reversal entry created, original marked REVERSED |
| TC-ADMIN-030 | Double Reversal Rejected | Attempt to reverse an already-reversed entry | Error: "Entry is already reversed" |

### TC-ADMIN-REPORTS â€” Financial Reports

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-031 | Trial Balance | More â†’ Reports â†’ Trial Balance | All accounts with debit/credit columns, totals balance |
| TC-ADMIN-032 | Trial Balance Date Filter | Set as-of date to past date | Only entries on/before selected date included |
| TC-ADMIN-033 | Profit & Loss | Reports â†’ P&L tab | Income/Expense sections with Net Surplus/Deficit |
| TC-ADMIN-034 | Balance Sheet | Reports â†’ Balance Sheet | Assets = Liabilities + Equity equation holds |
| TC-ADMIN-035 | Download Report PDF | Tap download on any report | PDF generated, native share sheet opens |

### TC-ADMIN-AID â€” Assistance Review

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-036 | View Aid Applications | Applications â†’ Assistance tab | All submitted aid requests listed |
| TC-ADMIN-037 | Review and Approve Aid | Tap "Approve" on application | Status â†’ APPROVED, applicant receives push notification |
| TC-ADMIN-038 | Reject with Reason | Tap "Reject" â†’ enter reason | Status â†’ REJECTED with reason, seeker can resubmit |

### TC-ADMIN-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-039 | View All Tickets | Complaints tab | All tickets from all users listed |
| TC-ADMIN-040 | Reply to Ticket | Open ticket â†’ type message â†’ Send | Message appears in thread, user notified |
| TC-ADMIN-041 | Resolve Ticket | Tap "Mark Resolved" | Status â†’ RESOLVED, user notified |

### TC-ADMIN-RBAC â€” Roles & Permissions

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-042 | View All Roles | More â†’ Roles â†’ Roles tab | All 5 baseline roles listed |
| TC-ADMIN-043 | Create Custom Role | Tap + â†’ enter name â†’ assign permissions â†’ save | New role created, visible in list |
| TC-ADMIN-044 | Delete System Role | Attempt to delete ADMIN/MEMBER/DONOR/SEEKER | Error: "System roles cannot be deleted" |
| TC-ADMIN-045 | Assign Role to User | Search user â†’ select role â†’ Save | User's role updated, takes effect on next API call |


---

## 9. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 9.1 Full Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/                              # Native Android Project
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â””â”€â”€ main/
â”‚   â”‚   â”‚       â”œâ”€â”€ java/com/hrsjm/      # Native Java/Kotlin modules
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ MainActivity.kt
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ MainApplication.kt
â”‚   â”‚   â”‚       â”œâ”€â”€ res/                 # Android resources
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ drawable/        # Icons, splash assets
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ mipmap-*/        # Launcher icons (hdpi/xhdpi/xxhdpi)
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ values/          # strings.xml, colors.xml, styles.xml
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ xml/             # network_security_config.xml (SSL pinning)
â”‚   â”‚   â”‚       â””â”€â”€ AndroidManifest.xml  # Permissions: CAMERA, INTERNET, BIOMETRIC
â”‚   â”‚   â”œâ”€â”€ build.gradle                 # App-level Gradle: minSdk 24, targetSdk 34
â”‚   â”‚   â””â”€â”€ proguard-rules.pro           # ProGuard rules for release build obfuscation
â”‚   â”œâ”€â”€ build.gradle                     # Project-level Gradle
â”‚   â”œâ”€â”€ gradle.properties                # MMKV, Hermes engine flags
â”‚   â””â”€â”€ settings.gradle
â”‚
â”œâ”€â”€ ios/                                  # Native iOS Project
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ AppDelegate.swift             # App entry point
â”‚   â”‚   â”œâ”€â”€ Info.plist                    # Permissions: NSCamera, NSFaceID, NSPhotoLibrary
â”‚   â”‚   â”œâ”€â”€ LaunchScreen.storyboard      # Splash screen storyboard
â”‚   â”‚   â””â”€â”€ Images.xcassets/             # App icons (1x, 2x, 3x), launch images
â”‚   â”œâ”€â”€ HRSJM.xcworkspace                # Open this (not .xcodeproj)
â”‚   â”œâ”€â”€ Podfile                          # CocoaPods dependencies
â”‚   â””â”€â”€ Podfile.lock                     # Locked pod versions
â”‚
â”œâ”€â”€ src/                                  # Shared TypeScript Source (iOS + Android)
â”‚   â”‚
â”‚   â”œâ”€â”€ api/                             # HTTP layer â€” Axios + interceptors
â”‚   â”‚   â”œâ”€â”€ client.ts                    # Axios instance, base URL, timeout
â”‚   â”‚   â”œâ”€â”€ interceptors/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.interceptor.ts      # JWT attach + 401 refresh rotation
â”‚   â”‚   â”‚   â””â”€â”€ error.interceptor.ts     # Global error envelope normalization
â”‚   â”‚   â”œâ”€â”€ auth.api.ts                  # POST /auth/login, /register, /refresh
â”‚   â”‚   â”œâ”€â”€ membership.api.ts            # GET/POST /memberships, /membership-categories
â”‚   â”‚   â”œâ”€â”€ donation.api.ts              # GET/POST /donations, /donation-payments
â”‚   â”‚   â”œâ”€â”€ assistance.api.ts            # GET/POST /assistance-requests
â”‚   â”‚   â”œâ”€â”€ receipts.api.ts              # GET /receipts
â”‚   â”‚   â”œâ”€â”€ support.api.ts               # GET/POST /support/tickets
â”‚   â”‚   â”œâ”€â”€ notifications.api.ts         # GET /notifications
â”‚   â”‚   â”œâ”€â”€ admin.api.ts                 # Admin-only endpoints
â”‚   â”‚   â””â”€â”€ users.api.ts                 # GET/PATCH /users
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/                          # Static assets bundled with app
â”‚   â”‚   â”œâ”€â”€ fonts/
â”‚   â”‚   â”‚   â”œâ”€â”€ Inter-Regular.ttf
â”‚   â”‚   â”‚   â”œâ”€â”€ Inter-SemiBold.ttf
â”‚   â”‚   â”‚   â”œâ”€â”€ Inter-Bold.ttf
â”‚   â”‚   â”‚   â”œâ”€â”€ Poppins-Regular.ttf
â”‚   â”‚   â”‚   â””â”€â”€ Poppins-Bold.ttf
â”‚   â”‚   â”œâ”€â”€ icons/                       # SVG icons (react-native-svg)
â”‚   â”‚   â”‚   â”œâ”€â”€ home.svg
â”‚   â”‚   â”‚   â”œâ”€â”€ members.svg
â”‚   â”‚   â”‚   â”œâ”€â”€ donate.svg
â”‚   â”‚   â”‚   â””â”€â”€ ...
â”‚   â”‚   â””â”€â”€ images/                      # PNG/WebP illustration assets
â”‚   â”‚       â”œâ”€â”€ onboarding_1.webp
â”‚   â”‚       â”œâ”€â”€ onboarding_2.webp
â”‚   â”‚       â”œâ”€â”€ onboarding_3.webp
â”‚   â”‚       â”œâ”€â”€ logo_hrsjm.png
â”‚   â”‚       â””â”€â”€ empty_state_*.webp
â”‚   â”‚
â”‚   â”œâ”€â”€ components/                      # Reusable UI component library
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx               # Primary, Secondary, Outline variants
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx                # Controlled input with error state
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx                 # Elevated card container
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx                # Status badge (Active/Expiring/Inactive)
â”‚   â”‚   â”‚   â”œâ”€â”€ Avatar.tsx               # User avatar with initials fallback
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx               # Spinner + full-screen overlay
â”‚   â”‚   â”‚   â”œâ”€â”€ EmptyState.tsx           # Illustration + message for empty lists
â”‚   â”‚   â”‚   â”œâ”€â”€ Divider.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ProgressBar.tsx          # Campaign funding progress
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx            # React Hook Form controlled input
â”‚   â”‚   â”‚   â”œâ”€â”€ FormSelect.tsx           # Dropdown picker
â”‚   â”‚   â”‚   â”œâ”€â”€ FormDatePicker.tsx       # Date picker (Android + iOS native)
â”‚   â”‚   â”‚   â”œâ”€â”€ DocumentUpload.tsx       # Camera + gallery + file picker
â”‚   â”‚   â”‚   â””â”€â”€ StepProgress.tsx         # Multi-step form progress indicator
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx                # In-app toast notifications
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx                # Generic bottom sheet modal
â”‚   â”‚   â”‚   â”œâ”€â”€ ConfirmDialog.tsx        # Confirm/cancel dialog
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx         # Shimmer skeleton for list items
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx        # Offline/reconnected top banner
â”‚   â”‚   â”œâ”€â”€ membership/
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipCard.tsx       # Digital ID card with flip animation
â”‚   â”‚   â”‚   â”œâ”€â”€ CategoryCard.tsx         # Tier selection card
â”‚   â”‚   â”‚   â””â”€â”€ StatusTimeline.tsx       # Application/Aid status stepper
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚       â”œâ”€â”€ StatCard.tsx             # Dashboard metric card (blue/green/amber/red)
â”‚   â”‚       â”œâ”€â”€ DataTable.tsx            # Sortable table with checkboxes
â”‚   â”‚       â””â”€â”€ FilterModal.tsx          # Advanced filter bottom sheet
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                    # AdminColors, MemberColors, DonorColors, etc.
â”‚   â”‚   â”œâ”€â”€ typography.ts                # Font sizes, weights, line heights
â”‚   â”‚   â”œâ”€â”€ spacing.ts                   # Padding/margin scale (4, 8, 12, 16, 24, 32)
â”‚   â”‚   â”œâ”€â”€ storage-keys.ts              # MMKV key constants
â”‚   â”‚   â”œâ”€â”€ api-routes.ts                # All API endpoint strings
â”‚   â”‚   â””â”€â”€ enums.ts                     # MembershipStatus, PaymentStatus, AidCategory
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/                           # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ useAuth.ts                   # Auth state, login, logout actions
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts                # NetInfo connectivity watcher
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts             # Biometric availability + authentication
â”‚   â”‚   â”œâ”€â”€ usePermissions.ts            # Camera/gallery permission handlers
â”‚   â”‚   â””â”€â”€ useDebounce.ts               # Debounced search input hook
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/                      # React Navigation setup
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx            # Top-level: Auth vs App routing
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx            # Stack: Splash â†’ Onboarding â†’ Login â†’ Register
â”‚   â”‚   â”œâ”€â”€ AdminTabNavigator.tsx        # Admin bottom tabs (5 tabs)
â”‚   â”‚   â”œâ”€â”€ MemberTabNavigator.tsx       # Member bottom tabs (4 tabs)
â”‚   â”‚   â”œâ”€â”€ DonorTabNavigator.tsx        # Donor bottom tabs (4 tabs)
â”‚   â”‚   â”œâ”€â”€ SeekerTabNavigator.tsx       # Seeker bottom tabs (4 tabs)
â”‚   â”‚   â”œâ”€â”€ GuestTabNavigator.tsx        # Guest bottom tabs (3 tabs)
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts           # TypeScript route param types
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/                         # Screen containers (role-grouped)
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminDashboardScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminUsersScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminMembershipApprovalsScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminMembershipCategoriesScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminPaymentVerificationScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminExpenseVouchersScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminReceiptVouchersScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminDonationsScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminAccountingLedgerScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminReportsScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminAssistanceReviewScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminSupportScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ AdminRolesPermissionsScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”œâ”€â”€ MemberHomeScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DonorHomeScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SeekerHomeScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ GuestExploreScreen.tsx
â”‚   â”‚   â”œâ”€â”€ membership/
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipCategoriesScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipApplyStep1Screen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipApplyStep2Screen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipApplyStep3Screen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MembershipCardScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ RenewalScreen.tsx
â”‚   â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseDetailScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DonationCheckoutScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PaymentSuccessScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ DonationHistoryScreen.tsx
â”‚   â”‚   â”œâ”€â”€ assistance/
â”‚   â”‚   â”‚   â”œâ”€â”€ AidApplyScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ AidTrackerScreen.tsx
â”‚   â”‚   â”œâ”€â”€ receipts/
â”‚   â”‚   â”‚   â”œâ”€â”€ ReceiptsListScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ DocumentVaultScreen.tsx
â”‚   â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”‚   â”œâ”€â”€ TicketsListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateTicketScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TicketChatScreen.tsx
â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚       â”œâ”€â”€ NotificationsScreen.tsx
â”‚   â”‚       â””â”€â”€ ProfileSettingsScreen.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ store/                           # State management (Zustand)
â”‚   â”‚   â”œâ”€â”€ authStore.ts                 # User, tokens, isAuthenticated, role
â”‚   â”‚   â”œâ”€â”€ appStore.ts                  # Network status, app theme, loading flags
â”‚   â”‚   â””â”€â”€ notificationStore.ts        # Unread count, notification list
â”‚   â”‚
â”‚   â”œâ”€â”€ types/                           # Global TypeScript interfaces
â”‚   â”‚   â”œâ”€â”€ api.types.ts                 # ApiResponse<T>, ApiError, PaginatedData<T>
â”‚   â”‚   â”œâ”€â”€ user.types.ts                # User, Role, Permission
â”‚   â”‚   â”œâ”€â”€ membership.types.ts          # Membership, MembershipCategory
â”‚   â”‚   â”œâ”€â”€ donation.types.ts            # Donation, DonationPayment, Receipt
â”‚   â”‚   â”œâ”€â”€ assistance.types.ts          # AssistanceRequest, AidDocument
â”‚   â”‚   â””â”€â”€ support.types.ts             # SupportTicket, TicketMessage
â”‚   â”‚
â”‚   â””â”€â”€ utils/                           # Pure utility functions
â”‚       â”œâ”€â”€ currency.ts                  # formatINR(12500) â†’ "â‚¹ 12,500.00"
â”‚       â”œâ”€â”€ date.ts                      # formatDate, daysDifference, isExpired
â”‚       â”œâ”€â”€ validators.ts                # PAN, Aadhaar, phone, email validators
â”‚       â”œâ”€â”€ storage.ts                   # MMKV read/write wrappers
â”‚       â”œâ”€â”€ keychain.ts                  # Keychain read/write for tokens
â”‚       â””â”€â”€ permissions.ts              # Camera, gallery, file permission checkers
â”‚
â”œâ”€â”€ __tests__/                           # Jest unit + integration tests
â”‚   â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ utils/
â”‚   â””â”€â”€ api/
â”‚
â”œâ”€â”€ e2e/                                 # Detox end-to-end tests
â”‚   â”œâ”€â”€ admin/
â”‚   â”œâ”€â”€ member/
â”‚   â”œâ”€â”€ donor/
â”‚   â”œâ”€â”€ seeker/
â”‚   â””â”€â”€ guest/
â”‚
â”œâ”€â”€ App.tsx                              # Root: Providers + NavigationContainer
â”œâ”€â”€ index.js                             # Entry point â€” AppRegistry
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ babel.config.js
â”œâ”€â”€ metro.config.js
â”œâ”€â”€ react-native.config.js              # Font & asset linking
â”œâ”€â”€ .env                                 # API_BASE_URL, PAYMENT_GATEWAY_KEY
â”œâ”€â”€ .env.production                     # Production env vars
â””â”€â”€ .env.staging                        # Staging env vars
```

### 9.2 Android-Specific Configuration Files

```text
android/app/src/main/
â”œâ”€â”€ AndroidManifest.xml         # Required permissions:
â”‚                               #   <uses-permission android:name="android.permission.INTERNET"/>
â”‚                               #   <uses-permission android:name="android.permission.CAMERA"/>
â”‚                               #   <uses-permission android:name="android.permission.USE_BIOMETRIC"/>
â”‚                               #   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
â”‚                               #   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
â”‚
â”œâ”€â”€ res/xml/network_security_config.xml   # SSL pinning config:
â”‚                               # <network-security-config>
â”‚                               #   <domain-config cleartextTrafficPermitted="false">
â”‚                               #     <domain includeSubdomains="true">api.hrsjm.org</domain>
â”‚                               #     <pin-set><pin digest="SHA-256">BASE64==</pin></pin-set>
â”‚                               #   </domain-config>
â”‚                               # </network-security-config>
â”‚
â””â”€â”€ build.gradle (app-level):
    android {
      compileSdkVersion 34
      defaultConfig {
        applicationId "com.hrsjm.app"
        minSdkVersion 24          // Android 7.0+
        targetSdkVersion 34       // Android 14
        versionCode 1
        versionName "1.0.0"
      }
      buildTypes {
        release {
          minifyEnabled true       // ProGuard obfuscation
          shrinkResources true
          proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
      }
    }
```

### 9.3 iOS-Specific Configuration Files

```text
ios/HRSJM/Info.plist             # Required permission descriptions:
  NSCameraUsageDescription       â†’ "HRSJM needs camera to scan/upload KYC documents"
  NSPhotoLibraryUsageDescription â†’ "HRSJM needs photo library for document uploads"
  NSFaceIDUsageDescription       â†’ "HRSJM uses Face ID for secure app access"
  NSContactsUsageDescription     â†’ (if contact autofill used)

ios/Podfile:
  platform :ios, '15.0'
  use_frameworks! :linkage => :static   # Required for Firebase + react-native-keychain

  pods include:
  - RNKeychain              # Secure token storage
  - RNMMKV                  # Fast cache storage
  - ReactNativeBiometrics   # Face ID / Touch ID
  - RNDocumentPicker
  - RNImagePickerManager
  - ReactNativeHapticFeedback
  - RNFirebaseMessaging     # FCM push notifications
  - Pods for payment gateway SDK
```

---

## 10. Admin Role â€” Test Cases

### TC-ADMIN-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-001 | Admin Login â€” Valid Credentials | Enter valid admin email + password â†’ tap Login | Navigate to Admin Dashboard, JWT stored in Keychain |
| TC-ADMIN-002 | Admin Login â€” Invalid Credentials | Enter wrong password | Error toast: "Invalid email or password" |
| TC-ADMIN-003 | Admin Login â€” Account Suspended | Login with suspended admin account | Error: "Your account has been deactivated" |
| TC-ADMIN-004 | Biometric Login | Enable biometrics after first login â†’ tap fingerprint/Face ID | Authenticate and navigate to Dashboard |
| TC-ADMIN-005 | Token Refresh | Let access token expire â†’ perform any API action | Interceptor silently refreshes token, request completes |
| TC-ADMIN-006 | Logout | Tap Logout â†’ confirm | Token revoked server-side, navigate to Login screen, Keychain cleared |

### TC-ADMIN-DASH â€” Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-007 | Dashboard Metrics Load | Open Dashboard tab | All 4 stat cards show correct counts (Total/Active/Expiring/Inactive) |
| TC-ADMIN-008 | Pending Actions â€” Navigate | Tap "X Membership Approvals Pending" | Navigate to Membership Approvals Queue |
| TC-ADMIN-009 | Revenue Summary | View Dashboard | Current month membership + donation income displayed |

### TC-ADMIN-USERS â€” User Management

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-010 | View All Members | Open Members tab | List shows all members with ID, validity, status |
| TC-ADMIN-011 | Search Member by Name | Type "Aman" in search bar | Filtered to matching members only |
| TC-ADMIN-012 | Filter by Status Active | Tap "Active" tab filter | Only ACTIVE members shown (count matches badge) |
| TC-ADMIN-013 | Filter by Expiring Soon | Tap "Expiring Soon" tab | Members with â‰¤ 30 days remaining shown |
| TC-ADMIN-014 | Deactivate a User | â‹® menu â†’ "Deactivate" â†’ confirm | User status changed to INACTIVE, row badge updates |
| TC-ADMIN-015 | Activate a User | â‹® menu â†’ "Activate" â†’ confirm | User status changed to ACTIVE |
| TC-ADMIN-016 | Bulk Select and Deactivate | Select 3 checkboxes â†’ "Deactivate Selected" | All 3 users deactivated in batch |

### TC-ADMIN-MEMBERSHIP â€” Membership Approvals

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-017 | View Pending Applications | Open Applications tab | Pending memberships listed with applicant details |
| TC-ADMIN-018 | View KYC Documents | Tap "View Documents" on application | KYC docs displayed inline (Identity, Address, Photo) |
| TC-ADMIN-019 | Approve Membership | Tap Approve â†’ confirm | Status â†’ APPROVED, membership number generated, applicant notified |
| TC-ADMIN-020 | Reject Membership | Tap Reject â†’ enter reason â†’ confirm | Status â†’ REJECTED, rejection reason saved, applicant notified |
| TC-ADMIN-021 | Create Membership Category | More â†’ Categories â†’ Create new | Category saved with name, code, fee, validity days |
| TC-ADMIN-022 | Deactivate Category | Toggle category status â†’ confirm | Category inactive, cannot be selected in new applications |

### TC-ADMIN-PAYMENTS â€” Payment Verification

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-023 | View Pending Payments | More â†’ Payments â†’ filter PENDING | All unverified payments listed |
| TC-ADMIN-024 | Verify Offline Payment | Tap "Verify" on cash payment â†’ confirm | Payment marked VERIFIED, receipt generated (RCP-#####), accounting journal posted |
| TC-ADMIN-025 | Idempotent Verification | Re-verify an already-verified payment | API returns 409 or graceful "already verified" message, no duplicate entry |

### TC-ADMIN-ACCOUNTING â€” Financial Engine

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-026 | View Chart of Accounts | More â†’ Accounting â†’ COA tab | All accounts listed in tree hierarchy |
| TC-ADMIN-027 | View Account Ledger | Tap account â†’ Ledger tab | Running debit/credit/balance per transaction |
| TC-ADMIN-028 | View Journal Entries | More â†’ Accounting â†’ Journal Entries tab | All entries listed with status (POSTED/REVERSED) |
| TC-ADMIN-029 | Reverse Journal Entry | Tap entry â†’ "Reverse Entry" â†’ confirm | Mirror reversal entry created, original marked REVERSED |
| TC-ADMIN-030 | Double Reversal Rejected | Attempt to reverse an already-reversed entry | Error: "Entry is already reversed" |

### TC-ADMIN-REPORTS â€” Financial Reports

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-031 | Trial Balance | More â†’ Reports â†’ Trial Balance | All accounts with debit/credit columns, totals balance |
| TC-ADMIN-032 | Trial Balance Date Filter | Set as-of date to past date | Only entries on/before selected date included |
| TC-ADMIN-033 | Profit & Loss | Reports â†’ P&L tab | Income/Expense sections with Net Surplus/Deficit |
| TC-ADMIN-034 | Balance Sheet | Reports â†’ Balance Sheet | Assets = Liabilities + Equity equation holds |
| TC-ADMIN-035 | Download Report PDF | Tap download on any report | PDF generated, native share sheet opens |

### TC-ADMIN-AID â€” Assistance Review

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-036 | View Aid Applications | Applications â†’ Assistance tab | All submitted aid requests listed |
| TC-ADMIN-037 | Review and Approve Aid | Tap "Approve" on application | Status â†’ APPROVED, applicant receives push notification |
| TC-ADMIN-038 | Reject with Reason | Tap "Reject" â†’ enter reason | Status â†’ REJECTED with reason, seeker can resubmit |

### TC-ADMIN-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-039 | View All Tickets | Complaints tab | All tickets from all users listed |
| TC-ADMIN-040 | Reply to Ticket | Open ticket â†’ type message â†’ Send | Message appears in thread, user notified |
| TC-ADMIN-041 | Resolve Ticket | Tap "Mark Resolved" | Status â†’ RESOLVED, user notified |

### TC-ADMIN-RBAC â€” Roles & Permissions

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-ADMIN-042 | View All Roles | More â†’ Roles â†’ Roles tab | All 5 baseline roles listed |
| TC-ADMIN-043 | Create Custom Role | Tap + â†’ enter name â†’ assign permissions â†’ save | New role created, visible in list |
| TC-ADMIN-044 | Delete System Role | Attempt to delete ADMIN/MEMBER/DONOR/SEEKER | Error: "System roles cannot be deleted" |
| TC-ADMIN-045 | Assign Role to User | Search user â†’ select role â†’ Save | User's role updated, takes effect on next API call |
