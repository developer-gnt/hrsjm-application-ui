# HRSJM Development & Architecture Rules (`rule.md`)

**Platform:** React Native CLI (TypeScript)  
**Applicability:** All engineers working on the HRSJM codebase  
**Version:** 1.0.0 — September 2026  

---

## 1. Architectural Principles

1. **Shared Code First**: All business logic, UI components, hooks, stores, and API clients MUST reside in `src/` and be 100% shared between Android and iOS.
2. **Never Create Platform Clones**: Do not duplicate feature screens (e.g. `LoginScreen.android.tsx` vs `LoginScreen.ios.tsx`) unless genuine platform-specific native UI differences require it.
3. **Layer Separation**:
   - **`src/app/`**: Application-level setup (navigation, root providers, top-level configurations).
   - **`src/core/`**: Shared infrastructure (API client, theme tokens, common components, permissions, storage, global utilities).
   - **`src/features/`**: Domain modules organized by feature (`auth/`, `admin/`, `member/`, etc.). Each feature should contain its own `screens/`, `components/`, `services/`, `hooks/`, and `types/`.
   - **`src/assets/`**: Images, fonts, and SVG icons.

---

## 2. API Communication & Networking Rules

1. **No Direct Axios / Fetch Calls in Screens**: Screens and UI components MUST NOT call Axios or `fetch` directly. Always consume typed feature hooks or feature services.
2. **Single Central API Client**: All HTTP calls must use the shared client in `src/core/api/client.ts`.
3. **Never Hardcode Base URL or Auth Headers**: The API client handles `/api/v1` base URLs and JWT Authorization headers via interceptors.
4. **Token Refresh via Interceptors**: Token refresh logic on HTTP 401 must only exist in `src/core/api/interceptors/refresh.interceptor.ts`. Never implement custom refresh logic in features.
5. **Side-by-Side API Integration**: UI screens and components MUST be developed with real backend API integrations simultaneously. Never build static or mock-only screens in isolation without wiring up the corresponding API service calls, DTO types, loading states, and error handling in the same development cycle.
6. **Typed API Envelopes**: Every API response must conform to standard backend envelopes:
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     message: string;
     data: T;
     meta?: {
       page: number;
       limit: number;
       total: number;
       totalPages: number;
     };
   }
   ```
7. **Error Normalization**: All errors must be handled through standard `ApiError` structures.

---

## 3. Dynamic RBAC & Authorization Rules

1. **Dynamic Permission Checks**: Never assume `role === 'ADMIN'` unlocks all features. Always evaluate granular permissions dynamically:
   ```typescript
   // Correct:
   const canVerify = can('payment.verify');
   
   // Incorrect:
   const canVerify = user.role === 'ADMIN';
   ```
2. **Action-Level Protection**: Every sensitive UI button, modal, or action must be conditionally rendered or guarded with `can('<permission>')`.
3. **Backend is Authority**: UI guards provide user experience feedback only; the backend remains the ultimate authority for authorization.

---

## 4. UI / UX & Design System Rules

1. **Use Approved Design Tokens**: Always import colors, spacing, and typography from `src/core/theme/` (`AdminColors`, `Spacing`, `Typography`). Never use arbitrary hex codes or magic numbers:
   ```typescript
   // Correct:
   backgroundColor: AdminColors.cardSurface,
   padding: Spacing.md,
   
   // Incorrect:
   backgroundColor: '#FFFFFF',
   padding: 16,
   ```
2. **Common Component Reuse**: Use common core components (`AppHeader`, `AppButton`, `AppInput`, `AppCard`, `AppBadge`, `AppEmptyState`, `AppErrorState`, `SkeletonCard`) instead of writing ad-hoc styles.
3. **Four Required UI States for Every List/Data Screen**:
   - **Initial Loading State**: Skeleton shimmer (not a blank screen).
   - **Empty State**: `AppEmptyState` with a helpful message and action button.
   - **Error State**: `AppErrorState` with a clear retry trigger.
   - **Data State**: Smooth FlatList rendering with pull-to-refresh and pagination support.
4. **Debounced Search**: All search inputs triggering API calls must be debounced by at least 400ms.

---

## 5. State Management Rules

1. **Server State vs Client State**:
   - **Server State** (Members, Payments, Ledger, Reports, Dashboard metrics): Manage using TanStack Query / service hooks with caching.
   - **Client State** (Auth session, active filters, UI modal toggles, app theme): Manage using Zustand stores (`authStore.ts`, `appStore.ts`).
2. **Do Not Store Large Lists in Global Stores**: Keep paginated API records out of global client stores to prevent memory bloat and stale data.

---

## 6. Formatting & Utility Standards

1. **Currency Formatting**: Always format financial amounts using `src/core/utils/currency.ts` (`formatINR(12500)` -> `₹ 12,500.00`). Never manually concatenate `₹` strings.
2. **Date Formatting**: Always format dates using `src/core/utils/date.ts` (`formatDate(date)` -> `28 Sep 2026`).
3. **Form Validation**: Validate all forms client-side using `zod` schemas matching backend DTOs before dispatching API calls. Disable submit buttons while requests are in flight.

---

## 7. Responsive Mobile & Safe Area Standards

1. **No Fixed Device Widths**: Never hardcode screen widths (e.g. `width: 390`). Use `flex`, percentages, `useWindowDimensions`, or responsive layout helpers.
2. **Safe Area Insets**: Wrap screens with `SafeAreaView` / `useSafeAreaInsets` to respect notches, camera cutouts, Dynamic Island, and home indicator bars.
3. **Keyboard Handling**: Use `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view` on all forms to prevent keyboards from obscuring inputs.

---

## 8. Definition of Done (DoD)

A feature is completed only when all of the following criteria are satisfied:
- [ ] UI accurately matches the design tokens and layout specifications.
- [ ] Responsive layout tested on both small and large screen dimensions.
- [ ] Central API client integrated with typed responses.
- [ ] Loading, Empty, Error, and Success states implemented.
- [ ] Client-side validation applied with helpful inline error messages.
- [ ] Dynamic RBAC `can()` checks added to sensitive actions.
- [ ] Search (debounced), filters, and pagination working where applicable.
- [ ] Tested on Android (emulator / device) and iOS.
- [ ] Zero TypeScript errors and clean ESLint checks.
- [ ] No `console.log` statements left in production code.

---

## 9. Git & Commit Guidelines

1. **Branch Naming**:
   - Features: `feature/<module>/<short-desc>` (e.g. `feature/mubasshir/auth`, `feature/mubasshir/payments`)
   - Bugfixes: `fix/<module>/<short-desc>`
2. **Conventional Commits**:
   - `feat(module): description`
   - `fix(module): description`
   - `refactor(module): description`
   - `test(module): description`
   - `chore(module): description`
