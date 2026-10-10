# HRSJM About Page — Implementation Notes (Corrected Delivery)

**Spec:** HRSJM About Page — Complete Development Specification + Correction & Completion Instruction
**Branch:** `Aman` · **Completed:** 2026-10-03
**Status:** All phases implemented against the high-resolution approved reference; full-page audit,
responsive sweep (320→1920) and visual evidence recorded (`.about-preview-shots/`).

---

## 1. Route & content source

- Route: `AppRoutes.ABOUT = 'About'` in the **More stack** (`MoreNavigator`), entered from the
  More menu → General Settings → "About HRSJM". `AboutScreen` receives `onBack` and `onNavigate`
  from the navigator (same pattern as `DonationsScreen`) and renders its own header
  (`headerShown: false`).
- **Single content source:** every string on the page lives in
  `src/features/about/content/aboutContent.ts`, transcribed from the high-resolution approved
  reference. No copy is hard-coded in components; nothing is invented.

## 2. Header — page-specific variation (correction §2/§4)

The reference header has **only** a back chevron in a light circle and the centered serif title —
no bell, no avatar. A page-specific `AboutHeader` was created for the About route; the app-wide
`AdminHeader` is untouched and still serves every other screen.

**No content can sit underneath the header, by construction:** `AboutHeader` is an in-flow flex
sibling *above* the page ScrollView (never `position: fixed`), so the scroll area starts strictly
below it. Verified empirically on fresh load at all 11 test widths: header bottom = 81px,
hero top = 81px at every width (see §7). Fresh load, reload, scroll-through and return-to-top
were exercised in the preview.

## 3. Typography (correction §6)

- **No font files exist in the repository** (re-verified during the correction pass: no
  .ttf/.otf/.woff/.woff2, no `fontFamily` anywhere, no Google/CSS imports). No font asset can be
  "used" because none is shipped.
- The reference's serif display headings are therefore reproduced with the platforms' built-in
  serif faces via one token — `AboutFonts.serif` = Georgia (iOS) / `serif` generic = Noto Serif
  (Android) / `Georgia, "Times New Roman", serif` (web). Zero new dependencies, real 400/700 +
  italic weights only.
- Serif applies to: header title, hero display words, all section headings, the pull-quote, and
  the CTA heading (matching the reference). Body, card titles, names, roles and buttons stay on
  the system sans-serif, also per the reference.
- Scale: hero 34/41 · section heading 23/29 · card title 15/20 · value title 14/19 · value body
  12/17 · body 14/22 · quote 16/24 italic serif · leader name 14/18 · role 12/16 · CTA body
  13/19 · button 14/18.

## 4. Sections (top → bottom, all present, all reference-matched)

1. **Header** — chevron circle + serif "About HRSJM".
2. **Hero** — inset rounded navy card (radius 24): serif "People. Rights. Justice." white +
   "Change." gold, gold underline rule, corrected caption. Photograph slot on the right wired in
   `aboutContent.hero.imageSource` (repo has no hero asset — assumption A4).
3. **Who We Are** — corrected copy ("…people-driven organisation dedicated to protecting human
   rights, promoting social justice and supporting marginalised communities across India.").
4. **Our Belief** — corrected copy + soft-gold pull-quote card: *"A fairer society is possible
   when people stand together for human rights and dignity."*
5. **Our Mission & Vision** — two cream cards, glyph beside title (navy target / gold eye),
   corrected copy.
6. **Our Values & Principles** — corrected lead ("Our work is guided by strong values…") and six
   value cards **two-across on phones (2×3, per the reference)**, three-across ≥600px. Cream
   borderless cards, bare navy outline glyphs, centered text.
7. **Leadership** — corrected lead; three white bordered cards with the approved names/roles
   (Dr. A. Rahman — President · Adv. Saira Khan — General Secretary · Imran Shaikh — Program
   Director), portrait field (initials fallback until photos exist), gold arrow chip
   (decorative — no leader-detail destination exists).
8. **CTA** — inset rounded navy card: serif "Together for a More Just Society.", corrected body
   line, gold **"Join the Movement →"** button (reuse of `AppButton`, gold variant). It navigates
   to the **Donations module** (`AppRoutes.DONATIONS`) — a real in-app destination recorded in
   `aboutContent.cta.route`; repointing that field repoints the button. No dead link ships.
9. **Footer** — the approved reference includes none; nothing was invented.

## 5. Files

**Created/changed under `src/features/about/`:** `theme/aboutTokens.ts` (colors, radii 14/16/24,
layout, serif token, 15-step type scale, section/card/quote styles),
`content/aboutContent.ts`, `components/AboutHeader.tsx` (new, page-specific),
`components/AboutHeroSection.tsx`, `WhoWeAreSection.tsx`, `BeliefSection.tsx`,
`MissionVisionSection.tsx`, `ValuesSection.tsx`, `LeadershipSection.tsx`,
`ClosingCtaSection.tsx`, `screens/AboutScreen.tsx`, `index.ts`.

**Modified:** `src/core/constants/routes.ts` (+ABOUT), `src/app/navigation/NavigationTypes.ts`,
`src/app/navigation/MoreNavigator.tsx` (screen + onNavigate wiring),
`src/app/navigation/AdminSettingsScreen.tsx` (menu item), `src/core/components/icons/index.ts`
(+Target, ShieldCheck, Heart, Leaf, UserRound; −unused About glyphs).

**Reused, not duplicated:** `AdminHeader` (untouched, other pages), `AppButton` (gold variant),
`AppAvatar` pattern, `PressableScale`, core `Spacing`, lucide icon barrel, `useSafeAreaInsets`.

**Dev tooling (not app code):** `about-preview.html` / `about-preview.jsx` (web preview harness,
same category as the project's `web-entry.jsx`; includes a shim for `AuthLogo`'s Metro
`require()` that Vite cannot execute — pre-existing web-preview limitation, native unaffected).
`.about-preview-shots/` holds the QA evidence.

## 6. Responsive behaviour (correction §9)

Breakpoints used (viewport-width driven, no new dependencies): values grid 2-across <600px /
3-across ≥600px; leadership cards 2-across <360px / 3-across ≥360px; mission & vision side by
side with `minWidth 150` (single column only below ~320px of available width); content column
capped at 1180px on ≥768px screens.

**Sweep results (fresh load, each width):** at 320/360/375/390/414/768/820/1024/1280/1440/1920 —
`scrollWidth == innerWidth` (zero horizontal overflow) and hero top (81) == header bottom (81)
(no content under header) at every width. Full captures: `A-mobile-full-*.png` (390, top→bottom),
`B-desktop-full-*.png` (1440, top→bottom).

## 7. Evidence index (`.about-preview-shots/`)

| File | Requirement |
| --- | --- |
| `A-mobile-full-0/1/2.png` | (A) full mobile page top→bottom at 390 |
| `B-desktop-full-0/1/2.png` | (B) full desktop page top→bottom at 1440 |
| `C-header-closeup.png` | (C) header close-up |
| `D-values-closeup.png` | (D) Values & Principles close-up |
| `E-leadership-closeup.png` | (E) Leadership close-up |
| `F-cta-closeup.png` | (F) final CTA close-up |

## 8. Verification

- `npx tsc --noEmit` — clean. `npx eslint` on all created/modified files — no issues.
- `npx jest` — 99/100 pass (7 About tests: full-section render with approved copy, hero words +
  6 values + 3 leaders, Read More expand/collapse, View All sheet, per-leader sheet, CTA
  navigation to `AppRoutes.DONATIONS`, header back contract). The single failure
  (`__tests__/App.test.tsx`) reproduces identically on a clean tree and predates this work.
- Every button exercised live in the preview: Read More ⇄ Read Less, View All sheet (open +
  close), leader chip sheet (open + close), Join the Movement → real DonationsScreen → back to
  About, header back.
- Accessibility: header role, in-flow header (no overlap), chevron button with accessible label,
  every control carries an accessible name (`AppButton` now defaults its accessible name to the
  title), `accessibilityRole="header"` on headings in DOM order, decorative glyphs
  `accessible={false}`, no color-only meaning, reduced-motion respected (no added animation),
  contrast: navy-on-cream / white-on-navy body text all ≥ 4.5:1 at their sizes.
- Responsive sweep re-run after the image work: at 320/360/375/390/414/768/820/1024/1280/1440/
  1920 — no horizontal overflow, all 6 images visible; at rest the hero top sits exactly at the
  header bottom (81px) at every width. (Browser scroll-restoration after reload can reopen the
  page mid-scroll — that is scrolling, not overlap.)

## 9. Assumptions & remaining known issues

- **A1 Fonts:** no font assets in repo → built-in serif stack (§3). Supplying an approved serif
  font file changes only `AboutFonts.serif`.
- **A2 Gutter 16px** (spec range 16–24, matches reference margins).
- **A3 Radii:** cards 14–16, hero/CTA 24 (high-res reference).
- **A4 Photography (final):** the exact photos from the user's "Image Usage Guide" are used
  as-is, in the same sections/positions: `hero-bg.png` fills the whole hero card as its
  background (navy blend baked in; serif words render on top under a light text-safety scrim),
  `who-we-are.png` sits right of the copy, `leader-1/2/3.png` fill the leadership card tops,
  and `cta-hands.png` fills the right of the CTA card. Swapping any file in `src/assets/about/`
  upgrades quality with no code change.
- **A5 CTA destination:** Donations module (only defensible in-app target); change
  `aboutContent.cta.route` to repoint (https values open the browser).
- **A6 Every control works** (user requirement): header back → `goBack`; **Read More →** expands
  the approved Who We Are copy inline (4-line truncation → full, toggles to Read Less — no
  invented content); **View All →** opens the leadership sheet (shared `AppModal`) listing all
  approved members; each leader card's gold chip opens that leader's sheet (photo, name, role —
  approved data only); **Join the Movement →** navigates to the Donations module.
- **A7 Web preview limitation (dev harness only):** (a) `AuthLogo.tsx`'s Metro `require()`
  breaks the whole app under Vite — the harness shims asset requires; (b) react-native-web
  holds `<img>` at opacity 0 for browser-cached images — the harness forces images visible via
  CSS; (c) the harness is `.jsx`, so TypeScript generics cannot be used in it. Native rendering
  is unaffected by all three. The harness also wires the CTA to the real `DonationsScreen`
  (About ⇄ Donations with working back) so every button is exercisable in the preview.
- **A8 Pre-existing repo issues (untouched):** `__tests__/App.test.tsx` fails on a clean tree;
  `AdminSettingsScreen.tsx` has a pre-existing unused-import lint error.
- **A9 Implementation note:** photos render via plain `View` + absolutely-filled `Image` with a
  gradient scrim sibling, not `ImageBackground` — RN Web copies the ImageBackground container
  style onto the inner image, compounding percentage widths (native unaffected, but the shared
  code path is the safe one for both).
