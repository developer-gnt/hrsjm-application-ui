# HRSJM Website Design System

> **Purpose:** Single source of truth for the HRSJM public website's
> visual styling, based on the two supplied desktop screenshots. Use
> only the colors, typography, spacing, layout, components, and visual
> treatments defined here. Do not introduce unrelated colors, fonts,
> shadows, or design styles.

## 1. Visual Direction

-   **Style:** Editorial, human-rights nonprofit, trustworthy,
    dignified, warm, and contemporary.
-   **Primary visual contrast:** Deep navy-blue sections paired with
    warm ivory content surfaces.
-   **Accent:** Warm golden yellow for calls to action, emphasis,
    decorative marks, and the secondary navigation bar.
-   **Photography:** Documentary and community-focused imagery, often
    treated with navy overlays, monochrome collage elements, and gold
    paint-like accents.
-   **Overall feel:** Spacious editorial layouts, refined serif
    headlines, compact sans-serif body text, thin borders, and
    restrained rounded corners.

## 2. Color Tokens

Use these as the only design colors. Hex values are calibrated from the
supplied screenshots and are intended as practical design tokens.

  -----------------------------------------------------------------------
  Token                   Hex                     Use
  ----------------------- ----------------------- -----------------------
  `color-navy-950`        `#011F39`               Deepest hero
                                                  backgrounds, dark
                                                  overlays

  `color-navy-900`        `#06294D`               Primary navy background
                                                  and strong dark
                                                  surfaces

  `color-navy-800`        `#123F68`               Secondary navy surfaces
                                                  and supporting graphics

  `color-navy-700`        `#174A78`               Links or navy accents
                                                  where the darkest navy
                                                  is too strong

  `color-blue-100`        `#EDF2F7`               Pale blue panels and
                                                  subtle section
                                                  backgrounds

  `color-blue-200`        `#DBE5EE`               Light borders and
                                                  dividers

  `color-gold-500`        `#FAD465`               Main gold accent,
                                                  navigation strip,
                                                  prominent buttons

  `color-gold-600`        `#E9B82E`               Gold emphasis on dark
                                                  backgrounds and
                                                  highlighted headline
                                                  text

  `color-gold-700`        `#C9971A`               Gold icons, fine rules,
                                                  and decorative details

  `color-ivory-50`        `#FAF7F0`               Main warm page
                                                  background and
                                                  editorial content
                                                  sections

  `color-white`           `#FFFFFF`               Cards, navigation
                                                  header, button text
                                                  where applicable

  `color-text-primary`    `#0B2F52`               Main headings and
                                                  primary text on light
                                                  surfaces

  `color-text-body`       `#34516D`               Paragraphs and
                                                  descriptive text

  `color-text-muted`      `#718096`               Secondary descriptions,
                                                  breadcrumbs, helper
                                                  text

  `color-border`          `#DCE4EC`               Card outlines,
                                                  separators, input
                                                  borders

  `color-overlay`         `#031B31`               Image overlays; use
                                                  with transparency over
                                                  photography
  -----------------------------------------------------------------------

### Color rules

-   Use navy for the brand's primary identity and dark hero sections.
-   Use gold for primary calls to action, active navigation details, and
    selective words in headings.
-   Use ivory instead of pure white for large editorial content
    sections.
-   Use white for the main top navigation, cards, and contained UI
    surfaces.
-   Use muted blue-gray for supporting copy, not for important headings.
-   Avoid introducing purple, bright red, neon colors, gradients
    unrelated to navy/gold, or additional accent palettes.
-   Do not place gold body text on ivory if contrast is insufficient.
    Use navy text on gold buttons.

## 3. Typography

Use **Playfair Display** for editorial display headings and **Inter**
for all interface and body text. Load both fonts consistently across the
site.

  -----------------------------------------------------------------------------------
  Token                Font                     Weight Size / line     Use
                                                       height          
  -------------------- ------------- ----------------- --------------- --------------
  `font-display`       Playfair               600--700 Responsive,     Desktop hero
                       Display                         approximately   headline
                                                       48--56px /      
                                                       0.98--1.12      

  `font-heading-xl`    Playfair               600--700 40--46px /      Major section
                       Display                         1.08--1.15      heading

  `font-heading-lg`    Playfair               600--700 32--38px /      Section and
                       Display                         1.1--1.2        page headings

  `font-heading-md`    Playfair                    600 24--28px /      Card or
                       Display                         1.15--1.25      subsection
                                                                       headings

  `font-body`          Inter                       400 14--16px /      Paragraphs and
                                                       1.5--1.7        descriptions

  `font-body-medium`   Inter                       500 14--16px /      Navigation and
                                                       1.4--1.6        emphasized
                                                                       body copy

  `font-label`         Inter                  600--700 11--13px / 1.4; Eyebrows and
                                                       letter spacing  section labels
                                                       0.12--0.18em    

  `font-button`        Inter                  600--700 13--15px / 1.2  Buttons and
                                                                       calls to
                                                                       action

  `font-small`         Inter                  400--500 12--13px /      Breadcrumbs
                                                       1.4--1.5        and secondary
                                                                       details

  `font-quote`         Caveat                 500--600 30--42px /      Handwritten
                                                       1.05--1.2       decorative
                                                                       quotes only
  -----------------------------------------------------------------------------------

### Typography rules

-   Use Playfair Display for the large editorial headlines visible in
    the hero and section introductions.
-   Use Inter for navigation, buttons, body copy, breadcrumbs, labels,
    and all functional interface text.
-   Use Caveat only for large decorative quotations. It must not be used
    for ordinary content or controls.
-   Hero headings should use tight line spacing and selective gold
    emphasis.
-   Eyebrow labels are uppercase, bold, and letter-spaced.
-   Avoid using more than these three font families.

### Font loading

Preferred font families: - `Playfair Display` - `Inter` - `Caveat`

Provide sensible fallbacks: `Georgia, serif` for Playfair Display;
`Arial, sans-serif` for Inter; and a cursive fallback for Caveat.

## 4. Layout and Spacing

Use an 8px spacing system.

  Token          Value Typical use
  ------------ ------- -------------------------------
  `space-1`        4px Tiny icon/text gap
  `space-2`        8px Tight control spacing
  `space-3`       12px Compact component gap
  `space-4`       16px Standard spacing
  `space-5`       24px Card and content spacing
  `space-6`       32px Section element spacing
  `space-7`       48px Large content gaps
  `space-8`       64px Section padding
  `space-9`       80px Large desktop section spacing
  `space-10`      96px Hero or major section spacing

### Containers

-   Center desktop content in a max-width container of approximately
    `1200px`.
-   Use a fluid width with `24px` minimum side padding on desktop and
    `16–20px` on smaller screens.
-   Keep text columns readable; avoid stretching paragraphs across the
    full viewport.
-   Use two-column editorial layouts for major content sections: text on
    one side and a collage or illustration on the other.
-   Use a responsive grid and stack columns vertically on mobile.
-   Keep consistent alignment between the logo, navigation, hero
    content, and page sections.

## 5. Navigation

### Primary header

-   Background: `color-white`.
-   Brand logo and bilingual wordmark aligned on the left.
-   Primary navigation centered or right-aligned.
-   Main call-to-action at the right.
-   Header content uses a centered max-width container.
-   Use Inter, 12--14px, medium or semibold.
-   Avoid heavy shadows; use a subtle lower border if needed.

### Secondary navigation strip

-   Background: `color-gold-500`.
-   Text: `color-navy-950`.
-   Compact height, approximately `38–40px` on desktop.
-   Links evenly spaced with clear hover and keyboard focus states.
-   Maintain readable contrast and avoid decorative gradients.

## 6. Hero Sections

-   Use a deep navy background or full-bleed documentary photograph with
    a navy overlay.
-   Desktop hero height should be content-driven, typically around
    `340–430px` depending on the page.
-   Keep the main headline large and editorial, with gold applied to a
    phrase or a few selected words.
-   Body copy is white or near-white, approximately 14--16px.
-   Use a small uppercase eyebrow above the headline.
-   Calls to action sit below the body copy and use gold-filled or
    navy/transparent outlined styles.
-   Position imagery toward the right or across the background while
    protecting text readability.
-   Add collage imagery, gold paint-like forms, or a decorative quote
    only when it supports the human-rights visual theme.
-   Use a dark overlay on photography rather than reducing text
    contrast.

## 7. Buttons and Links

### Primary button

-   Background: `color-gold-500`.
-   Text: `color-navy-950`.
-   Font: Inter, 600--700, 13--15px.
-   Padding: approximately `12px 20px`.
-   Border radius: `10–14px`.
-   Optional right-arrow icon with an 8px gap.
-   Hover: slightly darker gold (`color-gold-600`).
-   Focus: visible outline using navy with sufficient contrast.

### Secondary button

-   Transparent or navy background depending on the section.
-   On dark backgrounds, use a subtle white border and white text.
-   On light backgrounds, use navy text and a navy border.
-   Match the primary button's height and radius.

### Text links

-   Use navy as the default.
-   Use gold for active or emphasized links when the background supports
    adequate contrast.
-   Provide visible hover and focus states. Do not rely on color alone
    to indicate focus.

## 8. Cards, Borders, and Surfaces

-   Main editorial surface: `color-ivory-50`.
-   Cards: `color-white`.
-   Border: `1px solid color-border` where a boundary is needed.
-   Radius: `10–14px` for cards and `10–14px` for buttons.
-   Shadows: very subtle and only where needed to separate a card from
    its background.
-   Avoid thick borders, strong drop shadows, glassmorphism, and
    excessive nested cards.
-   Use generous internal padding, usually `20–24px` on desktop.
-   Use fine separators in grouped information rather than heavy
    dividers.

## 9. Images and Decorative Graphics

-   Use authentic, respectful documentary/community photography relevant
    to human rights, justice, equality, and social development.
-   Favor navy-tinted monochrome imagery combined with selective
    warm-gold graphic accents.
-   Collages may combine grayscale photographs, torn/paint-like gold
    shapes, and navy textures.
-   Keep image treatments consistent across pages.
-   Use `object-fit: cover` for full-bleed hero imagery and preserve
    focal points on responsive layouts.
-   Avoid generic glossy corporate stock-photo styling, cartoon
    illustrations, neon effects, or unrelated decorative motifs.
-   Do not use decorative imagery in a way that makes text hard to read.

## 10. Content Sections

-   Use the warm ivory background for major editorial content sections.
-   Section introductions use a small uppercase eyebrow, a Playfair
    Display heading, and a concise Inter paragraph.
-   Use alternating two-column layouts, image collages, value lists, and
    pull quotes.
-   Value/impact lists may use thin gold circular icon outlines and navy
    labels.
-   Pull quotes use Caveat in navy, with a small gold quotation mark or
    rule.
-   Keep visual hierarchy clear and avoid adding extra decorative
    elements not present in the reference style.

## 11. Responsive Rules

-   Desktop: full two-tier navigation, wide editorial hero, multi-column
    content.
-   Tablet: reduce headline size and horizontal gaps; allow navigation
    to wrap or collapse cleanly.
-   Mobile: use a compact header and mobile navigation pattern; stack
    content columns; keep buttons comfortably tappable.
-   Suggested minimum tap target: `44px`.
-   Hero text must remain readable over photography at all sizes.
-   Reduce decorative collage complexity on small screens rather than
    shrinking text excessively.
-   Maintain the same navy, gold, ivory, white, and typography tokens
    across breakpoints.

## 12. Accessibility and Consistency

-   Maintain WCAG-conscious text contrast, especially for small text and
    gold-on-light combinations.
-   Use semantic heading order and clear focus states.
-   Do not use color as the only indicator of active, selected, success,
    or error states.
-   Respect reduced-motion preferences if animations are used.
-   Reuse design tokens; do not hardcode alternate colors or font
    families in individual components.
-   Keep button, card, navigation, heading, and section styles
    consistent across all public pages.

## 13. CSS Variable Reference

``` css
:root {
  --color-navy-950: #011F39;
  --color-navy-900: #06294D;
  --color-navy-800: #123F68;
  --color-navy-700: #174A78;

  --color-blue-100: #EDF2F7;
  --color-blue-200: #DBE5EE;

  --color-gold-500: #FAD465;
  --color-gold-600: #E9B82E;
  --color-gold-700: #C9971A;

  --color-ivory-50: #FAF7F0;
  --color-white: #FFFFFF;

  --color-text-primary: #0B2F52;
  --color-text-body: #34516D;
  --color-text-muted: #718096;
  --color-border: #DCE4EC;
  --color-overlay: #031B31;

  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "Inter", Arial, sans-serif;
  --font-quote: "Caveat", cursive;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 80px;
  --space-10: 96px;

  --radius-card: 12px;
  --radius-button: 12px;
  --container-width: 1200px;
}
```

## 14. Non-Negotiable Design Constraints

1.  Use only the color tokens in this document.
2.  Use only Playfair Display, Inter, and Caveat as defined above.
3.  Keep navy as the core brand color, gold as the accent, and ivory as
    the main editorial background.
4.  Keep the visual direction editorial and human-rights focused.
5.  Do not introduce new gradients, accent colors, font families, or
    unrelated component styles.
6.  If a new component is required, construct it using the existing
    tokens and visual rules.
