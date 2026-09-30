
---

## 8. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 8.1 Guest-Relevant Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/
â”‚   â”œâ”€â”€ app/src/main/
â”‚   â”‚   â”œâ”€â”€ AndroidManifest.xml
â”‚   â”‚   â”‚   # <uses-permission android:name="android.permission.INTERNET"/>
â”‚   â”‚   â”‚   # (No camera/biometrics needed for guest â€” public browsing only)
â”‚   â”‚   â”œâ”€â”€ res/
â”‚   â”‚   â”‚   â”œâ”€â”€ drawable/               # Splash, onboarding illustrations
â”‚   â”‚   â”‚   â”œâ”€â”€ mipmap-*/               # Launcher icons
â”‚   â”‚   â”‚   â””â”€â”€ xml/network_security_config.xml   # SSL pinning
â”‚   â”‚   â””â”€â”€ build.gradle                # minSdk 24, targetSdk 34
â”‚   â””â”€â”€ gradle.properties               # hermesEnabled=true
â”‚
â”œâ”€â”€ ios/
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ Info.plist
â”‚   â”‚   â”‚   # NSFaceIDUsageDescription is OPTIONAL for guests (not required until login)
â”‚   â”‚   â””â”€â”€ AppDelegate.swift
â”‚   â””â”€â”€ Podfile                         # platform :ios, '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts                   # Axios instance, no auth header for guest
â”‚   â”‚   â”œâ”€â”€ interceptors/
â”‚   â”‚   â”‚   â””â”€â”€ error.interceptor.ts    # Handle public endpoint errors
â”‚   â”‚   â”œâ”€â”€ auth.api.ts                 # POST /register, /login, /forgot-password
â”‚   â”‚   â””â”€â”€ donation.api.ts             # GET /causes (public â€” no auth needed)
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                      # Inter / Poppins TTF
â”‚   â”‚   â”œâ”€â”€ icons/                      # Heart, People, Aid category icons
â”‚   â”‚   â””â”€â”€ images/
â”‚   â”‚       â”œâ”€â”€ onboarding_1.webp       # Community gathering
â”‚   â”‚       â”œâ”€â”€ onboarding_2.webp       # Donation hands
â”‚   â”‚       â”œâ”€â”€ onboarding_3.webp       # Digital ID card
â”‚   â”‚       â”œâ”€â”€ logo_hrsjm.png
â”‚   â”‚       â”œâ”€â”€ hero_banner.webp
â”‚   â”‚       â””â”€â”€ empty_state_causes.webp
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx              # Primary (Navy #1B3F8F), Secondary (Gold #C9A227)
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx         # Campaign funding bar (public view)
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â””â”€â”€ FormInput.tsx
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx               # "Login Required" modal
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx
â”‚   â”‚   â””â”€â”€ guest/
â”‚   â”‚       â”œâ”€â”€ CauseCard.tsx           # Public cause card (no donate button, login modal)
â”‚   â”‚       â”œâ”€â”€ HeroBanner.tsx          # Full-width landing hero with CTA
â”‚   â”‚       â”œâ”€â”€ ImpactCounter.tsx       # Animated number counters (2,486 Members, etc.)
â”‚   â”‚       â”œâ”€â”€ LoginRequiredModal.tsx  # Shown on any restricted action
â”‚   â”‚       â””â”€â”€ RoleSelectionCard.tsx   # Member/Donor/Seeker join option cards
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                   # GuestColors (#F97316 coral CTA, #1B3F8F primary)
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts               # Only public routes defined for guest
â”‚   â”‚   â””â”€â”€ enums.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts               # Offline banner for guest too
â”‚   â”‚   â””â”€â”€ useDebounce.ts              # Search in cause list
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx           # Detects no token â†’ GuestTabNavigator
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx           # Splash â†’ Onboarding â†’ Login/Register
â”‚   â”‚   â”œâ”€â”€ GuestTabNavigator.tsx       # Explore | Causes | Join (3 tabs only)
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx        # Token check â†’ guest or authenticated flow
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx    # 3-slide public walkthrough
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx         # Email/password, role-based routing on success
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx      # Public registration form
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx # Deep-link enabled: hrsjm://reset-password?token=
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ GuestExploreScreen.tsx  # Hero + counters + campaigns + CTAs
â”‚   â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseListScreen.tsx     # Public cause feed (read-only)
â”‚   â”‚   â”‚   â””â”€â”€ CauseDetailScreen.tsx   # Public cause detail (login CTA to donate)
â”‚   â”‚   â””â”€â”€ guest/
â”‚   â”‚       â””â”€â”€ GuestJoinScreen.tsx     # Role selection: Member / Donor / Seeker
â”‚   â”‚
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â””â”€â”€ appStore.ts                 # Network status, onboarding flag
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â””â”€â”€ donation.types.ts           # Public cause shape
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts
â”‚       â”œâ”€â”€ date.ts
â”‚       â”œâ”€â”€ storage.ts                  # MMKV: onboarding_complete flag
â”‚       â””â”€â”€ validators.ts               # Email, phone format for register form
â”‚
â”œâ”€â”€ __tests__/guest/
â”œâ”€â”€ e2e/guest/
â”œâ”€â”€ App.tsx
â””â”€â”€ package.json
```

### 8.2 Android Manifest (Guest â€” Minimal Permissions)

```xml
<!-- Guest only needs internet for public API calls -->
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<!-- Deep link for password reset -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="hrsjm" android:host="reset-password"/>
</intent-filter>
```

### 8.3 iOS Deep Link Configuration

```xml
<!-- ios/HRSJM/Info.plist â€” URL scheme for reset-password deep link -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.hrsjm.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>hrsjm</string>
    </array>
  </dict>
</array>
```

---

## 9. Guest Role â€” Test Cases

### TC-GUEST-SPLASH â€” Splash & App Load

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-001 | First Install â€” No Token | Open app fresh | Splash â†’ Onboarding walkthrough |
| TC-GUEST-002 | Returning Guest â€” No Token | Open app without login | Splash â†’ Guest Explore screen (skip onboarding) |
| TC-GUEST-003 | Valid Token Exists â€” MEMBER | Open app with valid Member token | Splash â†’ Member Home Dashboard (skip guest) |
| TC-GUEST-004 | Valid Token Exists â€” ADMIN | Open app with valid Admin token | Splash â†’ Admin Dashboard |
| TC-GUEST-005 | Expired Token | Open app with expired refresh token | Splash â†’ Login screen, Keychain cleared |
| TC-GUEST-006 | Offline on Splash | No internet connection | Splash shows "No Internet Connection" banner |

### TC-GUEST-ONBOARD â€” Onboarding Walkthrough

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-007 | View All 3 Slides | Swipe through carousel | Slide 1 (Who We Are), 2 (Donate), 3 (Membership) shown |
| TC-GUEST-008 | Skip Onboarding | Tap "Skip" on slide 1 or 2 | Jump to Guest Explore screen |
| TC-GUEST-009 | "Get Started" CTA | Tap "Get Started" on slide 3 | Navigate to Register screen |
| TC-GUEST-010 | "Already a member?" CTA | Tap on slide 3 | Navigate to Login screen |
| TC-GUEST-011 | Onboarding shown only once | Close + re-open app | Onboarding skipped, goes to Explore (MMKV flag) |

### TC-GUEST-EXPLORE â€” Home / Explore Screen

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-012 | Hero Banner Loads | Open Explore tab | HRSJM logo, tagline, and "Join as Member" + "Donate Now" CTAs visible |
| TC-GUEST-013 | Impact Counters Animate | Open Explore | Numbers animate up: 2,486 Members, â‚¹42L+, 150+ Causes |
| TC-GUEST-014 | Featured Campaigns Load | Scroll explore screen | Horizontal campaign cards with progress bars shown |
| TC-GUEST-015 | "Join as Member" CTA | Tap hero banner CTA | Navigate to Register screen |
| TC-GUEST-016 | "Donate Now" CTA | Tap hero banner CTA | Navigate to Login Required modal |
| TC-GUEST-017 | Who We Help Section | Scroll to section | Aid categories shown (Medical, Education, Disaster, Welfare) |
| TC-GUEST-018 | Offline State | Disable network â†’ open Explore | "No Internet Connection" banner + cached cause data if available |

### TC-GUEST-CAUSES â€” Public Cause Discovery

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-019 | Browse Causes | Tap Causes tab | All active causes listed with funding progress |
| TC-GUEST-020 | Category Filter | Tap "Medical" filter | Only medical causes shown |
| TC-GUEST-021 | Search Cause | Type "Bihar" in search | Matching causes filtered |
| TC-GUEST-022 | Cause Progress Bar | View cause card | Correct percentage and amount display |
| TC-GUEST-023 | Cause Card â€” Donate Button | Tap "Donate Now" on cause card | "Login Required" modal appears |
| TC-GUEST-024 | Login Required Modal â€” Login | Tap "Login" in modal | Navigate to Login screen |
| TC-GUEST-025 | Login Required Modal â€” Register | Tap "Register" in modal | Navigate to Register screen |
| TC-GUEST-026 | Login Required Modal â€” Cancel | Tap "Cancel" | Modal closes, remain on Causes screen |
| TC-GUEST-027 | Pull to Refresh | Swipe down on cause list | Fresh causes fetched from public API |
| TC-GUEST-028 | Infinite Scroll | Scroll to bottom | Next page of causes loads |

### TC-GUEST-DETAIL â€” Cause Detail (Public View)

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-029 | View Cause Detail | Tap cause card | Full description, progress, donor count shown |
| TC-GUEST-030 | Hero Image | View detail screen | Full-width cause image loads correctly |
| TC-GUEST-031 | Progress Detail | View funding progress | Exact funded amount and percentage shown |
| TC-GUEST-032 | Donate CTA in Detail | Tap "Login to Support This Cause" | Login Required modal opens |
| TC-GUEST-033 | Back Navigation | Tap back arrow | Returns to Cause list screen |

### TC-GUEST-AUTH â€” Registration & Login

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-034 | Register â€” Valid | Fill all fields + terms â†’ Create Account | Account created, navigate to Login |
| TC-GUEST-035 | Register â€” Missing Name | Submit without name | Error: "Full name is required" |
| TC-GUEST-036 | Register â€” Invalid Email | Enter "notanemail" | Error: "Enter a valid email address" |
| TC-GUEST-037 | Register â€” Invalid Phone | Enter 9-digit number | Error: "Enter valid 10-digit mobile number" |
| TC-GUEST-038 | Register â€” Weak Password | Enter "12345" | Error: "Password must be at least 8 characters" |
| TC-GUEST-039 | Register â€” Password Mismatch | Confirm â‰  password | Error: "Passwords do not match" |
| TC-GUEST-040 | Register â€” Terms Not Accepted | Don't tick checkbox â†’ Submit | Error: "Please accept the terms and conditions" |
| TC-GUEST-041 | Register â€” Duplicate Email | Existing email | Error: "Email is already registered" |
| TC-GUEST-042 | Login â€” Valid | Correct credentials | Routed by role to appropriate Tab Navigator |
| TC-GUEST-043 | Login â€” Wrong Password | Incorrect password | Error: "Invalid email or password" |
| TC-GUEST-044 | Forgot Password â€” Valid Email | Enter registered email â†’ Submit | Success message shown |
| TC-GUEST-045 | Forgot Password â€” Unregistered | Enter unknown email | Error: "No account found with this email" |
| TC-GUEST-046 | Reset Password Deep Link | Open hrsjm://reset-password?token=xxx | Opens Reset Password screen with token pre-set |
| TC-GUEST-047 | Reset Password â€” Valid | New password + confirm â†’ Submit | "Password reset" â†’ Login |
| TC-GUEST-048 | Reset Password â€” Token Expired | Use expired/used token | Error: "Reset link has expired" |

### TC-GUEST-JOIN â€” Join/Role Selection Screen

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-049 | View Join Options | Tap Join tab (Tab 3) | 3 role cards shown: Member, Donor, Seeker |
| TC-GUEST-050 | Register as Member | Tap "Register as Member" | Navigate to RegisterScreen |
| TC-GUEST-051 | Register as Donor | Tap "Register as Donor" | Navigate to RegisterScreen |
| TC-GUEST-052 | Register as Seeker | Tap "Apply for Help" | Navigate to RegisterScreen |
| TC-GUEST-053 | Already Have Account | Tap "Login" at bottom | Navigate to LoginScreen |

### TC-GUEST-RBAC â€” Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-054 | Cannot Access Member Home | Navigate to /member route | Redirected to Guest Explore screen |
| TC-GUEST-055 | Cannot Access Admin Panel | Navigate to /admin route | Redirected to Login screen |
| TC-GUEST-056 | Cannot Access Donation Checkout | Navigate to /checkout route | "Login Required" modal |
| TC-GUEST-057 | Cannot Access Aid Apply | Navigate to /assistance/apply | Redirected to Login screen |
| TC-GUEST-058 | API Protected Route Returns 401 | Any API call without token to protected endpoint | 401 Unauthorized â€” interceptor routes to Login |
| TC-GUEST-059 | Public API No Auth Required | GET /donations/causes without token | 200 OK â€” causes returned |


---

## 8. Standard Project Folder Structure (Android & iOS â€” React Native CLI)

### 8.1 Guest-Relevant Project Structure

```text
HRSJM_APPLICATION_UI/
â”‚
â”œâ”€â”€ android/
â”‚   â”œâ”€â”€ app/src/main/
â”‚   â”‚   â”œâ”€â”€ AndroidManifest.xml
â”‚   â”‚   â”‚   # <uses-permission android:name="android.permission.INTERNET"/>
â”‚   â”‚   â”‚   # (No camera/biometrics needed for guest â€” public browsing only)
â”‚   â”‚   â”œâ”€â”€ res/
â”‚   â”‚   â”‚   â”œâ”€â”€ drawable/               # Splash, onboarding illustrations
â”‚   â”‚   â”‚   â”œâ”€â”€ mipmap-*/               # Launcher icons
â”‚   â”‚   â”‚   â””â”€â”€ xml/network_security_config.xml   # SSL pinning
â”‚   â”‚   â””â”€â”€ build.gradle                # minSdk 24, targetSdk 34
â”‚   â””â”€â”€ gradle.properties               # hermesEnabled=true
â”‚
â”œâ”€â”€ ios/
â”‚   â”œâ”€â”€ HRSJM/
â”‚   â”‚   â”œâ”€â”€ Info.plist
â”‚   â”‚   â”‚   # NSFaceIDUsageDescription is OPTIONAL for guests (not required until login)
â”‚   â”‚   â””â”€â”€ AppDelegate.swift
â”‚   â””â”€â”€ Podfile                         # platform :ios, '15.0'
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts                   # Axios instance, no auth header for guest
â”‚   â”‚   â”œâ”€â”€ interceptors/
â”‚   â”‚   â”‚   â””â”€â”€ error.interceptor.ts    # Handle public endpoint errors
â”‚   â”‚   â”œâ”€â”€ auth.api.ts                 # POST /register, /login, /forgot-password
â”‚   â”‚   â””â”€â”€ donation.api.ts             # GET /causes (public â€” no auth needed)
â”‚   â”‚
â”‚   â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ fonts/                      # Inter / Poppins TTF
â”‚   â”‚   â”œâ”€â”€ icons/                      # Heart, People, Aid category icons
â”‚   â”‚   â””â”€â”€ images/
â”‚   â”‚       â”œâ”€â”€ onboarding_1.webp       # Community gathering
â”‚   â”‚       â”œâ”€â”€ onboarding_2.webp       # Donation hands
â”‚   â”‚       â”œâ”€â”€ onboarding_3.webp       # Digital ID card
â”‚   â”‚       â”œâ”€â”€ logo_hrsjm.png
â”‚   â”‚       â”œâ”€â”€ hero_banner.webp
â”‚   â”‚       â””â”€â”€ empty_state_causes.webp
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx              # Primary (Navy #1B3F8F), Secondary (Gold #C9A227)
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx         # Campaign funding bar (public view)
â”‚   â”‚   â”‚   â”œâ”€â”€ Loader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EmptyState.tsx
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”‚   â””â”€â”€ FormInput.tsx
â”‚   â”‚   â”œâ”€â”€ feedback/
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Modal.tsx               # "Login Required" modal
â”‚   â”‚   â”‚   â”œâ”€â”€ SkeletonCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ NetworkBanner.tsx
â”‚   â”‚   â””â”€â”€ guest/
â”‚   â”‚       â”œâ”€â”€ CauseCard.tsx           # Public cause card (no donate button, login modal)
â”‚   â”‚       â”œâ”€â”€ HeroBanner.tsx          # Full-width landing hero with CTA
â”‚   â”‚       â”œâ”€â”€ ImpactCounter.tsx       # Animated number counters (2,486 Members, etc.)
â”‚   â”‚       â”œâ”€â”€ LoginRequiredModal.tsx  # Shown on any restricted action
â”‚   â”‚       â””â”€â”€ RoleSelectionCard.tsx   # Member/Donor/Seeker join option cards
â”‚   â”‚
â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”œâ”€â”€ colors.ts                   # GuestColors (#F97316 coral CTA, #1B3F8F primary)
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ api-routes.ts               # Only public routes defined for guest
â”‚   â”‚   â””â”€â”€ enums.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useNetwork.ts               # Offline banner for guest too
â”‚   â”‚   â””â”€â”€ useDebounce.ts              # Search in cause list
â”‚   â”‚
â”‚   â”œâ”€â”€ navigation/
â”‚   â”‚   â”œâ”€â”€ RootNavigator.tsx           # Detects no token â†’ GuestTabNavigator
â”‚   â”‚   â”œâ”€â”€ AuthNavigator.tsx           # Splash â†’ Onboarding â†’ Login/Register
â”‚   â”‚   â”œâ”€â”€ GuestTabNavigator.tsx       # Explore | Causes | Join (3 tabs only)
â”‚   â”‚   â””â”€â”€ NavigationTypes.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ SplashScreen.tsx        # Token check â†’ guest or authenticated flow
â”‚   â”‚   â”‚   â”œâ”€â”€ OnboardingScreen.tsx    # 3-slide public walkthrough
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx         # Email/password, role-based routing on success
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterScreen.tsx      # Public registration form
â”‚   â”‚   â”‚   â”œâ”€â”€ ForgotPasswordScreen.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ResetPasswordScreen.tsx # Deep-link enabled: hrsjm://reset-password?token=
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â””â”€â”€ GuestExploreScreen.tsx  # Hero + counters + campaigns + CTAs
â”‚   â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”‚   â”œâ”€â”€ CauseListScreen.tsx     # Public cause feed (read-only)
â”‚   â”‚   â”‚   â””â”€â”€ CauseDetailScreen.tsx   # Public cause detail (login CTA to donate)
â”‚   â”‚   â””â”€â”€ guest/
â”‚   â”‚       â””â”€â”€ GuestJoinScreen.tsx     # Role selection: Member / Donor / Seeker
â”‚   â”‚
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â””â”€â”€ appStore.ts                 # Network status, onboarding flag
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”œâ”€â”€ api.types.ts
â”‚   â”‚   â””â”€â”€ donation.types.ts           # Public cause shape
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ currency.ts
â”‚       â”œâ”€â”€ date.ts
â”‚       â”œâ”€â”€ storage.ts                  # MMKV: onboarding_complete flag
â”‚       â””â”€â”€ validators.ts               # Email, phone format for register form
â”‚
â”œâ”€â”€ __tests__/guest/
â”œâ”€â”€ e2e/guest/
â”œâ”€â”€ App.tsx
â””â”€â”€ package.json
```

### 8.2 Android Manifest (Guest â€” Minimal Permissions)

```xml
<!-- Guest only needs internet for public API calls -->
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<!-- Deep link for password reset -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="hrsjm" android:host="reset-password"/>
</intent-filter>
```

### 8.3 iOS Deep Link Configuration

```xml
<!-- ios/HRSJM/Info.plist â€” URL scheme for reset-password deep link -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.hrsjm.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>hrsjm</string>
    </array>
  </dict>
</array>
```

---

## 9. Guest Role â€” Test Cases

### TC-GUEST-SPLASH â€” Splash & App Load

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-001 | First Install â€” No Token | Open app fresh | Splash â†’ Onboarding walkthrough |
| TC-GUEST-002 | Returning Guest â€” No Token | Open app without login | Splash â†’ Guest Explore screen (skip onboarding) |
| TC-GUEST-003 | Valid Token Exists â€” MEMBER | Open app with valid Member token | Splash â†’ Member Home Dashboard (skip guest) |
| TC-GUEST-004 | Valid Token Exists â€” ADMIN | Open app with valid Admin token | Splash â†’ Admin Dashboard |
| TC-GUEST-005 | Expired Token | Open app with expired refresh token | Splash â†’ Login screen, Keychain cleared |
| TC-GUEST-006 | Offline on Splash | No internet connection | Splash shows "No Internet Connection" banner |

### TC-GUEST-ONBOARD â€” Onboarding Walkthrough

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-007 | View All 3 Slides | Swipe through carousel | Slide 1 (Who We Are), 2 (Donate), 3 (Membership) shown |
| TC-GUEST-008 | Skip Onboarding | Tap "Skip" on slide 1 or 2 | Jump to Guest Explore screen |
| TC-GUEST-009 | "Get Started" CTA | Tap "Get Started" on slide 3 | Navigate to Register screen |
| TC-GUEST-010 | "Already a member?" CTA | Tap on slide 3 | Navigate to Login screen |
| TC-GUEST-011 | Onboarding shown only once | Close + re-open app | Onboarding skipped, goes to Explore (MMKV flag) |

### TC-GUEST-EXPLORE â€” Home / Explore Screen

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-012 | Hero Banner Loads | Open Explore tab | HRSJM logo, tagline, and "Join as Member" + "Donate Now" CTAs visible |
| TC-GUEST-013 | Impact Counters Animate | Open Explore | Numbers animate up: 2,486 Members, â‚¹42L+, 150+ Causes |
| TC-GUEST-014 | Featured Campaigns Load | Scroll explore screen | Horizontal campaign cards with progress bars shown |
| TC-GUEST-015 | "Join as Member" CTA | Tap hero banner CTA | Navigate to Register screen |
| TC-GUEST-016 | "Donate Now" CTA | Tap hero banner CTA | Navigate to Login Required modal |
| TC-GUEST-017 | Who We Help Section | Scroll to section | Aid categories shown (Medical, Education, Disaster, Welfare) |
| TC-GUEST-018 | Offline State | Disable network â†’ open Explore | "No Internet Connection" banner + cached cause data if available |

### TC-GUEST-CAUSES â€” Public Cause Discovery

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-019 | Browse Causes | Tap Causes tab | All active causes listed with funding progress |
| TC-GUEST-020 | Category Filter | Tap "Medical" filter | Only medical causes shown |
| TC-GUEST-021 | Search Cause | Type "Bihar" in search | Matching causes filtered |
| TC-GUEST-022 | Cause Progress Bar | View cause card | Correct percentage and amount display |
| TC-GUEST-023 | Cause Card â€” Donate Button | Tap "Donate Now" on cause card | "Login Required" modal appears |
| TC-GUEST-024 | Login Required Modal â€” Login | Tap "Login" in modal | Navigate to Login screen |
| TC-GUEST-025 | Login Required Modal â€” Register | Tap "Register" in modal | Navigate to Register screen |
| TC-GUEST-026 | Login Required Modal â€” Cancel | Tap "Cancel" | Modal closes, remain on Causes screen |
| TC-GUEST-027 | Pull to Refresh | Swipe down on cause list | Fresh causes fetched from public API |
| TC-GUEST-028 | Infinite Scroll | Scroll to bottom | Next page of causes loads |

### TC-GUEST-DETAIL â€” Cause Detail (Public View)

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-029 | View Cause Detail | Tap cause card | Full description, progress, donor count shown |
| TC-GUEST-030 | Hero Image | View detail screen | Full-width cause image loads correctly |
| TC-GUEST-031 | Progress Detail | View funding progress | Exact funded amount and percentage shown |
| TC-GUEST-032 | Donate CTA in Detail | Tap "Login to Support This Cause" | Login Required modal opens |
| TC-GUEST-033 | Back Navigation | Tap back arrow | Returns to Cause list screen |

### TC-GUEST-AUTH â€” Registration & Login

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-034 | Register â€” Valid | Fill all fields + terms â†’ Create Account | Account created, navigate to Login |
| TC-GUEST-035 | Register â€” Missing Name | Submit without name | Error: "Full name is required" |
| TC-GUEST-036 | Register â€” Invalid Email | Enter "notanemail" | Error: "Enter a valid email address" |
| TC-GUEST-037 | Register â€” Invalid Phone | Enter 9-digit number | Error: "Enter valid 10-digit mobile number" |
| TC-GUEST-038 | Register â€” Weak Password | Enter "12345" | Error: "Password must be at least 8 characters" |
| TC-GUEST-039 | Register â€” Password Mismatch | Confirm â‰  password | Error: "Passwords do not match" |
| TC-GUEST-040 | Register â€” Terms Not Accepted | Don't tick checkbox â†’ Submit | Error: "Please accept the terms and conditions" |
| TC-GUEST-041 | Register â€” Duplicate Email | Existing email | Error: "Email is already registered" |
| TC-GUEST-042 | Login â€” Valid | Correct credentials | Routed by role to appropriate Tab Navigator |
| TC-GUEST-043 | Login â€” Wrong Password | Incorrect password | Error: "Invalid email or password" |
| TC-GUEST-044 | Forgot Password â€” Valid Email | Enter registered email â†’ Submit | Success message shown |
| TC-GUEST-045 | Forgot Password â€” Unregistered | Enter unknown email | Error: "No account found with this email" |
| TC-GUEST-046 | Reset Password Deep Link | Open hrsjm://reset-password?token=xxx | Opens Reset Password screen with token pre-set |
| TC-GUEST-047 | Reset Password â€” Valid | New password + confirm â†’ Submit | "Password reset" â†’ Login |
| TC-GUEST-048 | Reset Password â€” Token Expired | Use expired/used token | Error: "Reset link has expired" |

### TC-GUEST-JOIN â€” Join/Role Selection Screen

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-049 | View Join Options | Tap Join tab (Tab 3) | 3 role cards shown: Member, Donor, Seeker |
| TC-GUEST-050 | Register as Member | Tap "Register as Member" | Navigate to RegisterScreen |
| TC-GUEST-051 | Register as Donor | Tap "Register as Donor" | Navigate to RegisterScreen |
| TC-GUEST-052 | Register as Seeker | Tap "Apply for Help" | Navigate to RegisterScreen |
| TC-GUEST-053 | Already Have Account | Tap "Login" at bottom | Navigate to LoginScreen |

### TC-GUEST-RBAC â€” Access Control

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC-GUEST-054 | Cannot Access Member Home | Navigate to /member route | Redirected to Guest Explore screen |
| TC-GUEST-055 | Cannot Access Admin Panel | Navigate to /admin route | Redirected to Login screen |
| TC-GUEST-056 | Cannot Access Donation Checkout | Navigate to /checkout route | "Login Required" modal |
| TC-GUEST-057 | Cannot Access Aid Apply | Navigate to /assistance/apply | Redirected to Login screen |
| TC-GUEST-058 | API Protected Route Returns 401 | Any API call without token to protected endpoint | 401 Unauthorized â€” interceptor routes to Login |
| TC-GUEST-059 | Public API No Auth Required | GET /donations/causes without token | 200 OK â€” causes returned |
