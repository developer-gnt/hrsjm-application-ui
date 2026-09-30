
---

## 6. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 6.1 Donor-Relevant Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/
â”‚   â”œâ”€â”€ app/src/main/
â”‚   â”‚   â”œâ”€â”€ AndroidManifest.xml         # INTERNET, CAMERA, READ/WRITE_EXTERNAL_STORAGE, USE_BIOMETRIC
â”‚   â”‚   â”œâ”€â”€ res/xml/network_security_config.xml  # SSL certificate pinning
â”‚   â”‚   â””â”€â”€ build.gradle                # minSdk 24, targetSdk 34, Hermes enabled
â”‚   â””â”€â”€ gradle.properties               # hermesEnabled=true
â”‚
â”œâ”€â”€ ios/
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ Info.plist                  # NSCamera, NSPhotoLibrary, NSFaceID descriptions
â”‚   â”‚   â””â”€â”€ AppDelegate.swift
â”‚   â””â”€â”€ Podfile                         # platform :ios, '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts                   # Axios base + interceptors
â”‚   â”‚   â”œâ”€â”€ interceptors/auth.interceptor.ts    # 401 â†’ token refresh rotation
â”‚   â”‚   â”œâ”€â”€ auth.api.ts
â”‚   â”‚   â”œâ”€â”€ donation.api.ts             # GET causes, POST donation, POST verify
â”‚   â”‚   â”œâ”€â”€ receipts.api.ts
â”‚   â”‚   â”œâ”€â”€ support.api.ts
â”‚   â”‚   â””â”€â”€ notifications.api.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                      # Inter / Poppins TTF
â”‚   â”‚   â”œâ”€â”€ icons/                      # Heart, Receipt, Certificate SVGs
â”‚   â”‚   â””â”€â”€ images/                     # Cause images, onboarding illustrations (WebP)
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx               # SUCCESS/PENDING/REFUNDED
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx         # Campaign funding bar
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx
â”‚   â”‚   â”‚   â””â”€â”€ AmountSelector.tsx      # â‚¹500/â‚¹1000/â‚¹2500 preset + custom
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx
â”‚   â”‚   â””â”€â”€ donation/
â”‚   â”‚       â”œâ”€â”€ CauseCard.tsx           # Image, title, progress, CTA
â”‚   â”‚       â”œâ”€â”€ DonationReceiptCard.tsx # Receipt number, amount, date, download btn
â”‚   â”‚       â””â”€â”€ ImpactSummaryCard.tsx   # FY total, badge, causes count
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                   # DonorColors (#E53E3E heart red accent)
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts
â”‚   â”‚   â””â”€â”€ enums.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts
â”‚   â”‚   â””â”€â”€ useDebounce.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ DonorTabNavigator.tsx       # Home | Causes | My Giving | More
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx    # Donor-specific slides
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ DonorHomeScreen.tsx     # Impact summary + quick actions
â”‚   â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseListScreen.tsx     # Filterable cause feed (FlashList)
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseDetailScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DonationCheckoutScreen.tsx  # Amount + donor details + PAN
â”‚   â”‚   â”‚   â”œâ”€â”€ PaymentSuccessScreen.tsx    # Confetti + receipt
â”‚   â”‚   â”‚   â””â”€â”€ DonationHistoryScreen.tsx   # FY filter + 80G downloads
â”‚   â”‚   â”œâ”€â”€ receipts/
â”‚   â”‚   â”‚   â””â”€â”€ ReceiptsListScreen.tsx  # Donation receipts only
â”‚   â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”‚   â”œâ”€â”€ TicketsListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateTicketScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TicketChatScreen.tsx
â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚       â”œâ”€â”€ NotificationsScreen.tsx
â”‚   â”‚       â””â”€â”€ ProfileSettingsScreen.tsx   # Includes saved PAN section
â”‚   â”‚
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â””â”€â”€ appStore.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â”œâ”€â”€ donation.types.ts
â”‚   â”‚   â””â”€â”€ support.types.ts
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts
â”‚       â”œâ”€â”€ date.ts
â”‚       â”œâ”€â”€ validators.ts               # PAN format: XXXXX9999X
â”‚       â”œâ”€â”€ storage.ts
â”‚       â””â”€â”€ keychain.ts
â”‚
â”œâ”€â”€ __tests__/donor/
â”œâ”€â”€ e2e/donor/
â”œâ”€â”€ App.tsx
â”œâ”€â”€ index.js
â””â”€â”€ package.json
```

### 6.2 Android Permissions (Donor)

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<!-- For PDF download / receipt -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

### 6.3 iOS Info.plist (Donor)

```xml
<key>NSFaceIDUsageDescription</key>
<string>HRSJM uses Face ID for secure account access.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>HRSJM needs photo library access to attach receipts to support tickets.</string>
```

---

## 7. Donor Role â€” Test Cases

### TC-DON-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-001 | Register | Fill all fields â†’ Create Account | Account created, navigate to Login |
| TC-DON-002 | Login â€” Valid | Correct credentials | Navigate to Donor Home Dashboard |
| TC-DON-003 | Login â€” Invalid Password | Wrong password | Error: "Invalid email or password" |
| TC-DON-004 | Biometric Quick Login | Enable biometrics â†’ use fingerprint | Successfully authenticated |
| TC-DON-005 | Forgot Password | Submit email | Reset token dispatched, success message |
| TC-DON-006 | Reset Password | New password via token | "Password reset" â†’ Login screen |
| TC-DON-007 | Token Auto-Refresh | Access token expires mid-session | Interceptor refreshes silently, request completes |
| TC-DON-008 | Logout | Confirm logout | Token revoked server-side, navigate to Login |

### TC-DON-HOME â€” Donor Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-009 | Impact Summary Card | Open Dashboard | Shows total donated FY, causes count, donor badge |
| TC-DON-010 | Recent Donations | Open Dashboard | Last 3 donations listed with cause and amount |
| TC-DON-011 | Featured Campaigns Carousel | Scroll horizontally | Active campaigns shown with funding progress |

### TC-DON-CAUSES â€” Cause Discovery

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-012 | Browse All Causes | Tap Causes tab | All active causes listed with progress bars |
| TC-DON-013 | Filter by Category | Tap "Medical" tab | Only medical causes displayed |
| TC-DON-014 | Search Cause | Type "Bihar" | Matching causes shown |
| TC-DON-015 | Cause Card Progress | View cause card | Funded percentage bar and donor count shown |
| TC-DON-016 | View Cause Detail | Tap cause card | Full description, impact updates, progress, CTA |
| TC-DON-017 | Pull to Refresh | Swipe down on cause list | Fresh data fetched from API |
| TC-DON-018 | Infinite Scroll | Scroll to bottom of list | Next page of causes loads automatically |

### TC-DON-CHECKOUT â€” Donation Checkout

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-019 | Select Preset Amount | Tap â‚¹2,500 | Amount selected, highlighted in blue |
| TC-DON-020 | Enter Custom Amount | Tap custom field â†’ type 3500 | â‚¹3,500 set as donation amount |
| TC-DON-021 | Zero Amount Validation | Enter 0 â†’ Proceed | Error: "Please enter a valid donation amount" |
| TC-DON-022 | PAN Validation â€” Valid | Enter "ABCDE1234F" | PAN accepted, no error |
| TC-DON-023 | PAN Validation â€” Invalid | Enter "12345" | Error: "Enter valid PAN format (XXXXX9999X)" |
| TC-DON-024 | Anonymous Toggle | Toggle ON anonymous | Donor name hidden on public cause page |
| TC-DON-025 | Pre-filled Donor Details | Open checkout | Name, email, phone pre-filled from profile |
| TC-DON-026 | Saved PAN Auto-fill | PAN previously saved in Settings | PAN field pre-filled automatically |
| TC-DON-027 | Proceed to Payment | All valid â†’ Tap "Proceed" | Gateway order created, checkout sheet opens |

### TC-DON-PAYMENT â€” Payment Gateway Flow

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-028 | Native Checkout Sheet Opens | Tap "Proceed to Pay" | Razorpay/Cashfree native UI opens |
| TC-DON-029 | Successful Payment | Complete gateway payment | Redirected to Payment Success screen |
| TC-DON-030 | Payment Success Animation | Success screen appears | Confetti or heart animation plays |
| TC-DON-031 | Receipt Number Display | View success screen | `RCP-YYYYMMDD-XXXX` shown |
| TC-DON-032 | Download 80G Receipt | Tap "Download 80G Receipt" | PDF opens in native viewer |
| TC-DON-033 | Share Receipt | Tap "Share" | Native share sheet opens with PDF |
| TC-DON-034 | Failed Payment | Cancel gateway / payment fails | Error message, retry button shown |
| TC-DON-035 | Duplicate Verification | Same payment ID sent twice | Server returns idempotent success, no duplicate receipt |

### TC-DON-HISTORY â€” Donation History & 80G

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-036 | View Donation History | Tap "My Giving" tab | All personal donations listed |
| TC-DON-037 | Filter by FY 2026-27 | Select FY from dropdown | Only this year's donations shown |
| TC-DON-038 | Annual Summary Card | View history | Total donated for selected FY displayed |
| TC-DON-039 | Download Annual 80G Certificate | Tap "Download Annual 80G" button | Consolidated PDF for FY downloaded |
| TC-DON-040 | Per-Donation Receipt Download | Tap ðŸ“„ on individual donation | Individual receipt PDF opens |

### TC-DON-RECEIPTS â€” Receipts Center

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-041 | View Receipts | More â†’ Receipts | All donation receipts listed |
| TC-DON-042 | Receipt PDF View | Tap receipt row | Opens in react-native-pdf viewer |
| TC-DON-043 | Share Receipt | Long-press receipt | Native share sheet opens |

### TC-DON-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-044 | Create Support Ticket | More â†’ Support â†’ âž• â†’ fill â†’ Submit | Ticket created with OPEN status |
| TC-DON-045 | Ticket Category â€” Payment Issue | Select "Payment Issue" category | Category saved correctly |
| TC-DON-046 | View Ticket Thread | Tap ticket | Conversation history shown |
| TC-DON-047 | Reply in Thread | Type + Send | Message saved, appears immediately |

### TC-DON-SETTINGS â€” Profile & Settings

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-048 | Save PAN for Future | Settings â†’ enter PAN â†’ Save | PAN stored, auto-fills on next checkout |
| TC-DON-049 | Edit Profile | Change email â†’ Save | Profile updated, success toast |
| TC-DON-050 | Change Password | Enter old + new â†’ Save | Password updated successfully |
| TC-DON-051 | Notification Preferences | Disable "Cause milestones" | That notification type no longer received |

### TC-DON-RBAC â€” Role Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-052 | Donor Cannot Access Membership Screens | Navigate to /membership route | Redirected to Donor Home |
| TC-DON-053 | Donor Cannot Submit Aid Request | Navigate to /assistance route | Access blocked, redirected |
| TC-DON-054 | Donor Cannot Access Admin Panel | Navigate to /admin route | Access denied, redirected |
| TC-DON-055 | API Ownership Scoping | `GET /donations` | Returns only own donations, not all platform data |


---

## 6. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 6.1 Donor-Relevant Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/
â”‚   â”œâ”€â”€ app/src/main/
â”‚   â”‚   â”œâ”€â”€ AndroidManifest.xml         # INTERNET, CAMERA, READ/WRITE_EXTERNAL_STORAGE, USE_BIOMETRIC
â”‚   â”‚   â”œâ”€â”€ res/xml/network_security_config.xml  # SSL certificate pinning
â”‚   â”‚   â””â”€â”€ build.gradle                # minSdk 24, targetSdk 34, Hermes enabled
â”‚   â””â”€â”€ gradle.properties               # hermesEnabled=true
â”‚
â”œâ”€â”€ ios/
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ Info.plist                  # NSCamera, NSPhotoLibrary, NSFaceID descriptions
â”‚   â”‚   â””â”€â”€ AppDelegate.swift
â”‚   â””â”€â”€ Podfile                         # platform :ios, '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts                   # Axios base + interceptors
â”‚   â”‚   â”œâ”€â”€ interceptors/auth.interceptor.ts    # 401 â†’ token refresh rotation
â”‚   â”‚   â”œâ”€â”€ auth.api.ts
â”‚   â”‚   â”œâ”€â”€ donation.api.ts             # GET causes, POST donation, POST verify
â”‚   â”‚   â”œâ”€â”€ receipts.api.ts
â”‚   â”‚   â”œâ”€â”€ support.api.ts
â”‚   â”‚   â””â”€â”€ notifications.api.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                      # Inter / Poppins TTF
â”‚   â”‚   â”œâ”€â”€ icons/                      # Heart, Receipt, Certificate SVGs
â”‚   â”‚   â””â”€â”€ images/                     # Cause images, onboarding illustrations (WebP)
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Badge.tsx               # SUCCESS/PENDING/REFUNDED
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx         # Campaign funding bar
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â”œâ”€â”€ FormInput.tsx
â”‚   â”‚   â”‚   â””â”€â”€ AmountSelector.tsx      # â‚¹500/â‚¹1000/â‚¹2500 preset + custom
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx
â”‚   â”‚   â””â”€â”€ donation/
â”‚   â”‚       â”œâ”€â”€ CauseCard.tsx           # Image, title, progress, CTA
â”‚   â”‚       â”œâ”€â”€ DonationReceiptCard.tsx # Receipt number, amount, date, download btn
â”‚   â”‚       â””â”€â”€ ImpactSummaryCard.tsx   # FY total, badge, causes count
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                   # DonorColors (#E53E3E heart red accent)
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts
â”‚   â”‚   â””â”€â”€ enums.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts
â”‚   â”‚   â”œâ”€â”€ useBiometrics.ts
â”‚   â”‚   â””â”€â”€ useDebounce.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx
â”‚   â”‚   â”œâ”€â”€ DonorTabNavigator.tsx       # Home | Causes | My Giving | More
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx    # Donor-specific slides
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ DonorHomeScreen.tsx     # Impact summary + quick actions
â”‚   â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseListScreen.tsx     # Filterable cause feed (FlashList)
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseDetailScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DonationCheckoutScreen.tsx  # Amount + donor details + PAN
â”‚   â”‚   â”‚   â”œâ”€â”€ PaymentSuccessScreen.tsx    # Confetti + receipt
â”‚   â”‚   â”‚   â””â”€â”€ DonationHistoryScreen.tsx   # FY filter + 80G downloads
â”‚   â”‚   â”œâ”€â”€ receipts/
â”‚   â”‚   â”‚   â””â”€â”€ ReceiptsListScreen.tsx  # Donation receipts only
â”‚   â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”‚   â”œâ”€â”€ TicketsListScreen.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateTicketScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TicketChatScreen.tsx
â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚       â”œâ”€â”€ NotificationsScreen.tsx
â”‚   â”‚       â””â”€â”€ ProfileSettingsScreen.tsx   # Includes saved PAN section
â”‚   â”‚
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â””â”€â”€ appStore.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â”œâ”€â”€ donation.types.ts
â”‚   â”‚   â””â”€â”€ support.types.ts
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts
â”‚       â”œâ”€â”€ date.ts
â”‚       â”œâ”€â”€ validators.ts               # PAN format: XXXXX9999X
â”‚       â”œâ”€â”€ storage.ts
â”‚       â””â”€â”€ keychain.ts
â”‚
â”œâ”€â”€ __tests__/donor/
â”œâ”€â”€ e2e/donor/
â”œâ”€â”€ App.tsx
â”œâ”€â”€ index.js
â””â”€â”€ package.json
```

### 6.2 Android Permissions (Donor)

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<!-- For PDF download / receipt -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

### 6.3 iOS Info.plist (Donor)

```xml
<key>NSFaceIDUsageDescription</key>
<string>HRSJM uses Face ID for secure account access.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>HRSJM needs photo library access to attach receipts to support tickets.</string>
```

---

## 7. Donor Role â€” Test Cases

### TC-DON-AUTH â€” Authentication

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-001 | Register | Fill all fields â†’ Create Account | Account created, navigate to Login |
| TC-DON-002 | Login â€” Valid | Correct credentials | Navigate to Donor Home Dashboard |
| TC-DON-003 | Login â€” Invalid Password | Wrong password | Error: "Invalid email or password" |
| TC-DON-004 | Biometric Quick Login | Enable biometrics â†’ use fingerprint | Successfully authenticated |
| TC-DON-005 | Forgot Password | Submit email | Reset token dispatched, success message |
| TC-DON-006 | Reset Password | New password via token | "Password reset" â†’ Login screen |
| TC-DON-007 | Token Auto-Refresh | Access token expires mid-session | Interceptor refreshes silently, request completes |
| TC-DON-008 | Logout | Confirm logout | Token revoked server-side, navigate to Login |

### TC-DON-HOME â€” Donor Dashboard

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-009 | Impact Summary Card | Open Dashboard | Shows total donated FY, causes count, donor badge |
| TC-DON-010 | Recent Donations | Open Dashboard | Last 3 donations listed with cause and amount |
| TC-DON-011 | Featured Campaigns Carousel | Scroll horizontally | Active campaigns shown with funding progress |

### TC-DON-CAUSES â€” Cause Discovery

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-012 | Browse All Causes | Tap Causes tab | All active causes listed with progress bars |
| TC-DON-013 | Filter by Category | Tap "Medical" tab | Only medical causes displayed |
| TC-DON-014 | Search Cause | Type "Bihar" | Matching causes shown |
| TC-DON-015 | Cause Card Progress | View cause card | Funded percentage bar and donor count shown |
| TC-DON-016 | View Cause Detail | Tap cause card | Full description, impact updates, progress, CTA |
| TC-DON-017 | Pull to Refresh | Swipe down on cause list | Fresh data fetched from API |
| TC-DON-018 | Infinite Scroll | Scroll to bottom of list | Next page of causes loads automatically |

### TC-DON-CHECKOUT â€” Donation Checkout

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-019 | Select Preset Amount | Tap â‚¹2,500 | Amount selected, highlighted in blue |
| TC-DON-020 | Enter Custom Amount | Tap custom field â†’ type 3500 | â‚¹3,500 set as donation amount |
| TC-DON-021 | Zero Amount Validation | Enter 0 â†’ Proceed | Error: "Please enter a valid donation amount" |
| TC-DON-022 | PAN Validation â€” Valid | Enter "ABCDE1234F" | PAN accepted, no error |
| TC-DON-023 | PAN Validation â€” Invalid | Enter "12345" | Error: "Enter valid PAN format (XXXXX9999X)" |
| TC-DON-024 | Anonymous Toggle | Toggle ON anonymous | Donor name hidden on public cause page |
| TC-DON-025 | Pre-filled Donor Details | Open checkout | Name, email, phone pre-filled from profile |
| TC-DON-026 | Saved PAN Auto-fill | PAN previously saved in Settings | PAN field pre-filled automatically |
| TC-DON-027 | Proceed to Payment | All valid â†’ Tap "Proceed" | Gateway order created, checkout sheet opens |

### TC-DON-PAYMENT â€” Payment Gateway Flow

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-028 | Native Checkout Sheet Opens | Tap "Proceed to Pay" | Razorpay/Cashfree native UI opens |
| TC-DON-029 | Successful Payment | Complete gateway payment | Redirected to Payment Success screen |
| TC-DON-030 | Payment Success Animation | Success screen appears | Confetti or heart animation plays |
| TC-DON-031 | Receipt Number Display | View success screen | `RCP-YYYYMMDD-XXXX` shown |
| TC-DON-032 | Download 80G Receipt | Tap "Download 80G Receipt" | PDF opens in native viewer |
| TC-DON-033 | Share Receipt | Tap "Share" | Native share sheet opens with PDF |
| TC-DON-034 | Failed Payment | Cancel gateway / payment fails | Error message, retry button shown |
| TC-DON-035 | Duplicate Verification | Same payment ID sent twice | Server returns idempotent success, no duplicate receipt |

### TC-DON-HISTORY â€” Donation History & 80G

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-036 | View Donation History | Tap "My Giving" tab | All personal donations listed |
| TC-DON-037 | Filter by FY 2026-27 | Select FY from dropdown | Only this year's donations shown |
| TC-DON-038 | Annual Summary Card | View history | Total donated for selected FY displayed |
| TC-DON-039 | Download Annual 80G Certificate | Tap "Download Annual 80G" button | Consolidated PDF for FY downloaded |
| TC-DON-040 | Per-Donation Receipt Download | Tap ðŸ“„ on individual donation | Individual receipt PDF opens |

### TC-DON-RECEIPTS â€” Receipts Center

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-041 | View Receipts | More â†’ Receipts | All donation receipts listed |
| TC-DON-042 | Receipt PDF View | Tap receipt row | Opens in react-native-pdf viewer |
| TC-DON-043 | Share Receipt | Long-press receipt | Native share sheet opens |

### TC-DON-SUPPORT â€” Helpdesk

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-044 | Create Support Ticket | More â†’ Support â†’ âž• â†’ fill â†’ Submit | Ticket created with OPEN status |
| TC-DON-045 | Ticket Category â€” Payment Issue | Select "Payment Issue" category | Category saved correctly |
| TC-DON-046 | View Ticket Thread | Tap ticket | Conversation history shown |
| TC-DON-047 | Reply in Thread | Type + Send | Message saved, appears immediately |

### TC-DON-SETTINGS â€” Profile & Settings

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-048 | Save PAN for Future | Settings â†’ enter PAN â†’ Save | PAN stored, auto-fills on next checkout |
| TC-DON-049 | Edit Profile | Change email â†’ Save | Profile updated, success toast |
| TC-DON-050 | Change Password | Enter old + new â†’ Save | Password updated successfully |
| TC-DON-051 | Notification Preferences | Disable "Cause milestones" | That notification type no longer received |

### TC-DON-RBAC â€” Role Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-DON-052 | Donor Cannot Access Membership Screens | Navigate to /membership route | Redirected to Donor Home |
| TC-DON-053 | Donor Cannot Submit Aid Request | Navigate to /assistance route | Access blocked, redirected |
| TC-DON-054 | Donor Cannot Access Admin Panel | Navigate to /admin route | Access denied, redirected |
| TC-DON-055 | API Ownership Scoping | `GET /donations` | Returns only own donations, not all platform data |
