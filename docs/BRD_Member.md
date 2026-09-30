
---

## 6. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 6.1 Full Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/                              # Native Android Project
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ src/main/
â”‚   â”‚   â”‚   â”œâ”€â”€ java/com/hrsjm/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ MainActivity.kt
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ MainApplication.kt
â”‚   â”‚   â”‚   â”œâ”€â”€ res/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ drawable/            # Splash, icons, backgrounds
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ mipmap-*/            # Launcher icons (hdpi/xhdpi/xxhdpi/xxxhdpi)
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ values/              # strings.xml, colors.xml, styles.xml
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ xml/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ network_security_config.xml   # SSL certificate pinning
â”‚   â”‚   â”‚   â””â”€â”€ AndroidManifest.xml
â”‚   â”‚   â””â”€â”€ build.gradle                 # minSdk 24 / targetSdk 34
â”‚   â””â”€â”€ gradle.properties                # Hermes engine: hermesEnabled=true
â”‚
â”œâ”€â”€ ios/                                  # Native iOS Project
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ AppDelegate.swift
â”‚   â”‚   â”œâ”€â”€ Info.plist                   # NSCamera, NSFaceID, NSPhotoLibrary permissions
â”‚   â”‚   â”œâ”€â”€ LaunchScreen.storyboard      # Splash
â”‚   â”‚   â””â”€â”€ Images.xcassets/             # App icon sets (1x/2x/3x)
â”‚   â”œâ”€â”€ HRSJM.xcworkspace                # Always open this file
â”‚   â””â”€â”€ Podfile                          # CocoaPods: ios '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts                    # Axios base URL + timeout
â”‚   â”‚   â”œâ”€â”€ interceptors/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.interceptor.ts      # JWT refresh rotation on 401
â”‚   â”‚   â”‚   â””â”€â”€ error.interceptor.ts
â”‚   â”‚   â”œâ”€â”€ auth.api.ts
â”‚   â”‚   â”œâ”€â”€ membership.api.ts
â”‚   â”‚   â”œâ”€â”€ donation.api.ts
â”‚   â”‚   â”œâ”€â”€ receipts.api.ts
â”‚   â”‚   â”œâ”€â”€ support.api.ts
â”‚   â”‚   â””â”€â”€ notifications.api.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                       # Inter, Poppins TTF files
â”‚   â”‚   â”œâ”€â”€ icons/                       # SVG icon set
â”‚   â”‚   â””â”€â”€ images/                      # WebP illustrations (onboarding, empty states)
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx               # Primary, Secondary, Outline
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx                # With error state + label
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx                # Active/Expiring/Inactive/Pending
â”‚   â”‚   â”‚   â”œâ”€â”€ Avatar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx            # react-hook-form controlled
â”‚   â”‚   â”‚   â”œâ”€â”€ FormSelect.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FormDatePicker.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DocumentUpload.tsx       # Camera + gallery + file picker
â”‚   â”‚   â”‚   â””â”€â”€ StepProgress.tsx         # Multi-step form indicator â—â—â—‹â—‹
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ConfirmDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx         # Shimmer loading
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx        # Offline banner
â”‚   â”‚   â””â”€â”€ membership/
â”‚   â”‚       â”œâ”€â”€ MembershipCard.tsx       # Flip card with QR code
â”‚   â”‚       â”œâ”€â”€ CategoryCard.tsx
â”‚   â”‚       â””â”€â”€ StatusTimeline.tsx       # â—â—â—â—‹ stepper
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                    # MemberColors, brand tokens
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ spacing.ts
â”‚   â”‚   â”œâ”€â”€ storage-keys.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts
â”‚   â”‚   â””â”€â”€ enums.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts
â”‚   â”‚   â”œâ”€â”€ usePermissions.ts
â”‚   â”‚   â””â”€â”€ useDebounce.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ MemberTabNavigator.tsx
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ MemberHomeScreen.tsx
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
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â””â”€â”€ appStore.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â”œâ”€â”€ user.types.ts
â”‚   â”‚   â”œâ”€â”€ membership.types.ts
â”‚   â”‚   â”œâ”€â”€ donation.types.ts
â”‚   â”‚   â””â”€â”€ support.types.ts
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts                  # formatINR(1200) â†’ "â‚¹ 1,200.00"
â”‚       â”œâ”€â”€ date.ts                      # isExpired, daysDifference, formatDate
â”‚       â”œâ”€â”€ validators.ts               # PAN, phone, email validators
â”‚       â”œâ”€â”€ storage.ts                   # MMKV wrappers
â”‚       â””â”€â”€ keychain.ts                  # Token read/write
â”‚
â”œâ”€â”€ __tests__/                           # Jest unit tests
â”œâ”€â”€ e2e/member/                          # Detox e2e tests
â”œâ”€â”€ App.tsx
â”œâ”€â”€ index.js
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ .env                                 # API_BASE_URL
â””â”€â”€ .env.production
```

### 6.2 Android Manifest Permissions (Member)

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

### 6.3 iOS Info.plist Permissions (Member)

```xml
<key>NSCameraUsageDescription</key>
<string>HRSJM needs camera access to upload your KYC documents and passport photo.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>HRSJM needs photo library access to select your identity documents.</string>
<key>NSFaceIDUsageDescription</key>
<string>HRSJM uses Face ID to quickly and securely unlock your account.</string>
```

---

## 7. Member Role â€” Test Cases

### TC-MEM-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-001 | Register New Member | Fill all fields â†’ Create Account | Account created, auto-navigate to Login |
| TC-MEM-002 | Register â€” Duplicate Email | Use existing email | Error: "Email is already registered" |
| TC-MEM-003 | Register â€” Password Mismatch | Enter different confirm password | Inline error: "Passwords do not match" |
| TC-MEM-004 | Login â€” Valid Credentials | Correct email + password | Navigate to Member Home Dashboard |
| TC-MEM-005 | Login â€” Wrong Password | Wrong password | Error: "Invalid email or password" |
| TC-MEM-006 | Biometric Setup | First login â†’ enable biometrics | Biometric toggle active, Touch ID / Face ID works next open |
| TC-MEM-007 | Forgot Password | Enter email â†’ Submit | Success message, reset token/link dispatched |
| TC-MEM-008 | Reset Password | Enter new password via token | "Password reset successfully" â†’ Login |
| TC-MEM-009 | Token Auto-refresh | Wait for access token expiry â†’ navigate | Silent refresh, no re-login required |
| TC-MEM-010 | Logout | Tap Logout â†’ Confirm | Token revoked, Keychain cleared, back to Login |

### TC-MEM-HOME â€” Home Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-011 | Dashboard â€” Active Membership | Login with active member | Membership banner shows ID, expiry date, "Active âœ…" |
| TC-MEM-012 | Dashboard â€” No Membership | Login with member who hasn't applied | "Apply Now" CTA banner shown |
| TC-MEM-013 | Dashboard â€” Expiring Banner | 15 days to expiry | Orange expiry warning with "Renew Now" in banner |
| TC-MEM-014 | Quick Action Navigation | Tap "My Card" | Navigate to Digital Membership Card screen |

### TC-MEM-APPLY â€” Membership Application

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-015 | View Categories | Tap "Apply for Membership" | Category list with fees and benefits shown |
| TC-MEM-016 | Select Category | Tap "Apply Now" on Annual Regular | Navigate to Step 1 form |
| TC-MEM-017 | Step 1 â€” Validation | Submit empty form | All required field errors highlighted |
| TC-MEM-018 | Step 1 â€” Valid Submission | Fill all fields â†’ Next | Navigate to Step 2 |
| TC-MEM-019 | Step 2 â€” Valid Submission | Fill address fields â†’ Next | Navigate to Step 3 |
| TC-MEM-020 | Step 3 â€” Upload Identity Proof | Tap "Upload" â†’ select from gallery | Document preview shown with file name |
| TC-MEM-021 | Step 3 â€” Upload via Camera | Tap "Camera" â†’ capture | Photo captured, preview shown |
| TC-MEM-022 | Step 3 â€” Submit Application | All 3 docs uploaded â†’ Submit | API success, success message, navigate to Home |
| TC-MEM-023 | Duplicate Application | Apply when already has PENDING application | Error or redirect to existing application status |

### TC-MEM-CARD â€” Digital Membership Card

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-024 | View Active Card | Tap "My Card" tab | Gold/Navy gradient card shows name, ID, validity |
| TC-MEM-025 | Card Flip Animation | Tap on card front | Card flips to show QR code and contact details |
| TC-MEM-026 | QR Code Verification | Admin scans QR | QR resolves to `/memberships/verify/:id` with member details |
| TC-MEM-027 | Download Card PDF | Tap "Download PDF" | PDF generated with membership details, opens in native viewer |
| TC-MEM-028 | Card â€” Expired State | Login with expired member | Card shows "EXPIRED âŒ" badge, "Renew Now" CTA |

### TC-MEM-RENEW â€” Renewal

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-029 | Renewal Screen â€” Expiry Warning | Open More â†’ Renewal | Shows days remaining, new expiry date, fee |
| TC-MEM-030 | Initiate Renewal Payment | Tap "Renew & Pay Now" | Creates renewal order, opens gateway checkout |
| TC-MEM-031 | Renewal Payment Success | Complete gateway payment | Membership expiry extended, receipt issued, card updated |

### TC-MEM-DONATE â€” Donations

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-032 | Browse Causes | Tap Donate tab | Active cause list with progress bars shown |
| TC-MEM-033 | Filter Causes | Tap "Medical" filter | Only medical causes listed |
| TC-MEM-034 | Cause Detail | Tap cause card | Full cause detail with impact updates |
| TC-MEM-035 | Donation Checkout â€” Preset | Tap â‚¹1,000 amount â†’ Proceed | Order created, gateway opens |
| TC-MEM-036 | Donation Checkout â€” Custom | Enter â‚¹3,500 manually â†’ Proceed | Custom amount sent correctly |
| TC-MEM-037 | PAN Validation | Enter invalid PAN format | Inline error: "Enter valid PAN (e.g. ABCDE1234F)" |
| TC-MEM-038 | Payment Success | Complete gateway payment | Success animation, receipt number shown |
| TC-MEM-039 | Download 80G Receipt | Tap "Download Receipt" on success | PDF opens in native viewer |
| TC-MEM-040 | Donation History | More â†’ Donation History | All personal donations listed with receipts |

### TC-MEM-RECEIPTS â€” Receipts

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-041 | View Receipts | More â†’ My Receipts | All personal receipts (membership + donation) listed |
| TC-MEM-042 | Filter by Membership | Tap "Membership" tab | Only membership payment receipts |
| TC-MEM-043 | View Receipt PDF | Tap receipt row | PDF opens in `react-native-pdf` viewer |
| TC-MEM-044 | Share Receipt | Long-press receipt â†’ Share | Native iOS/Android share sheet opens |

### TC-MEM-KYC â€” Document Vault

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-045 | View KYC Status | More â†’ My Documents | All docs with VERIFIED/PENDING/REJECTED status |
| TC-MEM-046 | Replace Rejected Doc | Tap "Re-upload" on REJECTED doc | File picker opens, new doc uploaded |

### TC-MEM-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-047 | Create Ticket | More â†’ Support â†’ âž• â†’ fill form â†’ Submit | Ticket created with OPEN status |
| TC-MEM-048 | View Ticket Thread | Tap ticket â†’ Chat screen | All messages shown in thread |
| TC-MEM-049 | Send Message in Ticket | Type + Send | Message appears on right side in real-time |
| TC-MEM-050 | Attach Image to Message | Tap ðŸ“· â†’ select image â†’ send | Image uploaded, preview shown in chat |

### TC-MEM-SETTINGS â€” Profile & Security

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-051 | Edit Profile | Change phone number â†’ Save | Profile updated, success toast |
| TC-MEM-052 | Change Password | Old + New + Confirm â†’ Save | Password changed, session remains active |
| TC-MEM-053 | Toggle Biometrics | Toggle ON biometrics | System prompt for biometric enrollment |
| TC-MEM-054 | Push Notification Preference | Disable payment notifications | Preference saved, payment pushes not received |

### TC-MEM-RBAC â€” Role-Based Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-055 | Member Cannot Access Admin Screen | Navigate directly to `/admin` route | Redirected to Member Home |
| TC-MEM-056 | Member Cannot See Other Members | `/api/v1/memberships` | Returns own membership only |
| TC-MEM-057 | Expired Member â€” Feature Lock | Log in with expired membership | Card shows expired, pay fee prompts to renew before accessing benefits |


---

## 6. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 6.1 Full Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/                              # Native Android Project
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ src/main/
â”‚   â”‚   â”‚   â”œâ”€â”€ java/com/hrsjm/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ MainActivity.kt
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ MainApplication.kt
â”‚   â”‚   â”‚   â”œâ”€â”€ res/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ drawable/            # Splash, icons, backgrounds
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ mipmap-*/            # Launcher icons (hdpi/xhdpi/xxhdpi/xxxhdpi)
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ values/              # strings.xml, colors.xml, styles.xml
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ xml/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ network_security_config.xml   # SSL certificate pinning
â”‚   â”‚   â”‚   â””â”€â”€ AndroidManifest.xml
â”‚   â”‚   â””â”€â”€ build.gradle                 # minSdk 24 / targetSdk 34
â”‚   â””â”€â”€ gradle.properties                # Hermes engine: hermesEnabled=true
â”‚
â”œâ”€â”€ ios/                                  # Native iOS Project
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ AppDelegate.swift
â”‚   â”‚   â”œâ”€â”€ Info.plist                   # NSCamera, NSFaceID, NSPhotoLibrary permissions
â”‚   â”‚   â”œâ”€â”€ LaunchScreen.storyboard      # Splash
â”‚   â”‚   â””â”€â”€ Images.xcassets/             # App icon sets (1x/2x/3x)
â”‚   â”œâ”€â”€ HRSJM.xcworkspace                # Always open this file
â”‚   â””â”€â”€ Podfile                          # CocoaPods: ios '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts                    # Axios base URL + timeout
â”‚   â”‚   â”œâ”€â”€ interceptors/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.interceptor.ts      # JWT refresh rotation on 401
â”‚   â”‚   â”‚   â””â”€â”€ error.interceptor.ts
â”‚   â”‚   â”œâ”€â”€ auth.api.ts
â”‚   â”‚   â”œâ”€â”€ membership.api.ts
â”‚   â”‚   â”œâ”€â”€ donation.api.ts
â”‚   â”‚   â”œâ”€â”€ receipts.api.ts
â”‚   â”‚   â”œâ”€â”€ support.api.ts
â”‚   â”‚   â””â”€â”€ notifications.api.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                       # Inter, Poppins TTF files
â”‚   â”‚   â”œâ”€â”€ icons/                       # SVG icon set
â”‚   â”‚   â””â”€â”€ images/                      # WebP illustrations (onboarding, empty states)
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx               # Primary, Secondary, Outline
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx                # With error state + label
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx                # Active/Expiring/Inactive/Pending
â”‚   â”‚   â”‚   â”œâ”€â”€ Avatar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx            # react-hook-form controlled
â”‚   â”‚   â”‚   â”œâ”€â”€ FormSelect.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FormDatePicker.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DocumentUpload.tsx       # Camera + gallery + file picker
â”‚   â”‚   â”‚   â””â”€â”€ StepProgress.tsx         # Multi-step form indicator â—â—â—‹â—‹
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ConfirmDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx         # Shimmer loading
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx        # Offline banner
â”‚   â”‚   â””â”€â”€ membership/
â”‚   â”‚       â”œâ”€â”€ MembershipCard.tsx       # Flip card with QR code
â”‚   â”‚       â”œâ”€â”€ CategoryCard.tsx
â”‚   â”‚       â””â”€â”€ StatusTimeline.tsx       # â—â—â—â—‹ stepper
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                    # MemberColors, brand tokens
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ spacing.ts
â”‚   â”‚   â”œâ”€â”€ storage-keys.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts
â”‚   â”‚   â””â”€â”€ enums.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts
â”‚   â”‚   â”œâ”€â”€ usePermissions.ts
â”‚   â”‚   â””â”€â”€ useDebounce.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ MemberTabNavigator.tsx
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ MemberHomeScreen.tsx
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
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â””â”€â”€ appStore.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â”œâ”€â”€ user.types.ts
â”‚   â”‚   â”œâ”€â”€ membership.types.ts
â”‚   â”‚   â”œâ”€â”€ donation.types.ts
â”‚   â”‚   â””â”€â”€ support.types.ts
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts                  # formatINR(1200) â†’ "â‚¹ 1,200.00"
â”‚       â”œâ”€â”€ date.ts                      # isExpired, daysDifference, formatDate
â”‚       â”œâ”€â”€ validators.ts               # PAN, phone, email validators
â”‚       â”œâ”€â”€ storage.ts                   # MMKV wrappers
â”‚       â””â”€â”€ keychain.ts                  # Token read/write
â”‚
â”œâ”€â”€ __tests__/                           # Jest unit tests
â”œâ”€â”€ e2e/member/                          # Detox e2e tests
â”œâ”€â”€ App.tsx
â”œâ”€â”€ index.js
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ .env                                 # API_BASE_URL
â””â”€â”€ .env.production
```

### 6.2 Android Manifest Permissions (Member)

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

### 6.3 iOS Info.plist Permissions (Member)

```xml
<key>NSCameraUsageDescription</key>
<string>HRSJM needs camera access to upload your KYC documents and passport photo.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>HRSJM needs photo library access to select your identity documents.</string>
<key>NSFaceIDUsageDescription</key>
<string>HRSJM uses Face ID to quickly and securely unlock your account.</string>
```

---

## 7. Member Role â€” Test Cases

### TC-MEM-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-001 | Register New Member | Fill all fields â†’ Create Account | Account created, auto-navigate to Login |
| TC-MEM-002 | Register â€” Duplicate Email | Use existing email | Error: "Email is already registered" |
| TC-MEM-003 | Register â€” Password Mismatch | Enter different confirm password | Inline error: "Passwords do not match" |
| TC-MEM-004 | Login â€” Valid Credentials | Correct email + password | Navigate to Member Home Dashboard |
| TC-MEM-005 | Login â€” Wrong Password | Wrong password | Error: "Invalid email or password" |
| TC-MEM-006 | Biometric Setup | First login â†’ enable biometrics | Biometric toggle active, Touch ID / Face ID works next open |
| TC-MEM-007 | Forgot Password | Enter email â†’ Submit | Success message, reset token/link dispatched |
| TC-MEM-008 | Reset Password | Enter new password via token | "Password reset successfully" â†’ Login |
| TC-MEM-009 | Token Auto-refresh | Wait for access token expiry â†’ navigate | Silent refresh, no re-login required |
| TC-MEM-010 | Logout | Tap Logout â†’ Confirm | Token revoked, Keychain cleared, back to Login |

### TC-MEM-HOME â€” Home Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-011 | Dashboard â€” Active Membership | Login with active member | Membership banner shows ID, expiry date, "Active âœ…" |
| TC-MEM-012 | Dashboard â€” No Membership | Login with member who hasn't applied | "Apply Now" CTA banner shown |
| TC-MEM-013 | Dashboard â€” Expiring Banner | 15 days to expiry | Orange expiry warning with "Renew Now" in banner |
| TC-MEM-014 | Quick Action Navigation | Tap "My Card" | Navigate to Digital Membership Card screen |

### TC-MEM-APPLY â€” Membership Application

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-015 | View Categories | Tap "Apply for Membership" | Category list with fees and benefits shown |
| TC-MEM-016 | Select Category | Tap "Apply Now" on Annual Regular | Navigate to Step 1 form |
| TC-MEM-017 | Step 1 â€” Validation | Submit empty form | All required field errors highlighted |
| TC-MEM-018 | Step 1 â€” Valid Submission | Fill all fields â†’ Next | Navigate to Step 2 |
| TC-MEM-019 | Step 2 â€” Valid Submission | Fill address fields â†’ Next | Navigate to Step 3 |
| TC-MEM-020 | Step 3 â€” Upload Identity Proof | Tap "Upload" â†’ select from gallery | Document preview shown with file name |
| TC-MEM-021 | Step 3 â€” Upload via Camera | Tap "Camera" â†’ capture | Photo captured, preview shown |
| TC-MEM-022 | Step 3 â€” Submit Application | All 3 docs uploaded â†’ Submit | API success, success message, navigate to Home |
| TC-MEM-023 | Duplicate Application | Apply when already has PENDING application | Error or redirect to existing application status |

### TC-MEM-CARD â€” Digital Membership Card

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-024 | View Active Card | Tap "My Card" tab | Gold/Navy gradient card shows name, ID, validity |
| TC-MEM-025 | Card Flip Animation | Tap on card front | Card flips to show QR code and contact details |
| TC-MEM-026 | QR Code Verification | Admin scans QR | QR resolves to `/memberships/verify/:id` with member details |
| TC-MEM-027 | Download Card PDF | Tap "Download PDF" | PDF generated with membership details, opens in native viewer |
| TC-MEM-028 | Card â€” Expired State | Login with expired member | Card shows "EXPIRED âŒ" badge, "Renew Now" CTA |

### TC-MEM-RENEW â€” Renewal

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-029 | Renewal Screen â€” Expiry Warning | Open More â†’ Renewal | Shows days remaining, new expiry date, fee |
| TC-MEM-030 | Initiate Renewal Payment | Tap "Renew & Pay Now" | Creates renewal order, opens gateway checkout |
| TC-MEM-031 | Renewal Payment Success | Complete gateway payment | Membership expiry extended, receipt issued, card updated |

### TC-MEM-DONATE â€” Donations

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-032 | Browse Causes | Tap Donate tab | Active cause list with progress bars shown |
| TC-MEM-033 | Filter Causes | Tap "Medical" filter | Only medical causes listed |
| TC-MEM-034 | Cause Detail | Tap cause card | Full cause detail with impact updates |
| TC-MEM-035 | Donation Checkout â€” Preset | Tap â‚¹1,000 amount â†’ Proceed | Order created, gateway opens |
| TC-MEM-036 | Donation Checkout â€” Custom | Enter â‚¹3,500 manually â†’ Proceed | Custom amount sent correctly |
| TC-MEM-037 | PAN Validation | Enter invalid PAN format | Inline error: "Enter valid PAN (e.g. ABCDE1234F)" |
| TC-MEM-038 | Payment Success | Complete gateway payment | Success animation, receipt number shown |
| TC-MEM-039 | Download 80G Receipt | Tap "Download Receipt" on success | PDF opens in native viewer |
| TC-MEM-040 | Donation History | More â†’ Donation History | All personal donations listed with receipts |

### TC-MEM-RECEIPTS â€” Receipts

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-041 | View Receipts | More â†’ My Receipts | All personal receipts (membership + donation) listed |
| TC-MEM-042 | Filter by Membership | Tap "Membership" tab | Only membership payment receipts |
| TC-MEM-043 | View Receipt PDF | Tap receipt row | PDF opens in `react-native-pdf` viewer |
| TC-MEM-044 | Share Receipt | Long-press receipt â†’ Share | Native iOS/Android share sheet opens |

### TC-MEM-KYC â€” Document Vault

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-045 | View KYC Status | More â†’ My Documents | All docs with VERIFIED/PENDING/REJECTED status |
| TC-MEM-046 | Replace Rejected Doc | Tap "Re-upload" on REJECTED doc | File picker opens, new doc uploaded |

### TC-MEM-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-047 | Create Ticket | More â†’ Support â†’ âž• â†’ fill form â†’ Submit | Ticket created with OPEN status |
| TC-MEM-048 | View Ticket Thread | Tap ticket â†’ Chat screen | All messages shown in thread |
| TC-MEM-049 | Send Message in Ticket | Type + Send | Message appears on right side in real-time |
| TC-MEM-050 | Attach Image to Message | Tap ðŸ“· â†’ select image â†’ send | Image uploaded, preview shown in chat |

### TC-MEM-SETTINGS â€” Profile & Security

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-051 | Edit Profile | Change phone number â†’ Save | Profile updated, success toast |
| TC-MEM-052 | Change Password | Old + New + Confirm â†’ Save | Password changed, session remains active |
| TC-MEM-053 | Toggle Biometrics | Toggle ON biometrics | System prompt for biometric enrollment |
| TC-MEM-054 | Push Notification Preference | Disable payment notifications | Preference saved, payment pushes not received |

### TC-MEM-RBAC â€” Role-Based Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-MEM-055 | Member Cannot Access Admin Screen | Navigate directly to `/admin` route | Redirected to Member Home |
| TC-MEM-056 | Member Cannot See Other Members | `/api/v1/memberships` | Returns own membership only |
| TC-MEM-057 | Expired Member â€” Feature Lock | Log in with expired membership | Card shows expired, pay fee prompts to renew before accessing benefits |
