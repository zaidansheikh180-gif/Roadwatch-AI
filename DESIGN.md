# RoadWatch AI — Design System

**Status:** Approved design specification  
**Version:** 0.1  
**Last updated:** 2026-10-21

## 1. Purpose

Define consistent visual and interaction rules for road-issue reporting, the public map, report details, and administrative review. The working MVP takes priority over decorative complexity. The document is a specification, not proof that any UI has been implemented or tested.

## 2. Design principles

- Clarity, readability, and trust before decoration.
- Distinctive brand identity, applied consistently.
- Mobile-first reporting and responsive desktop layouts.
- Glass effects are restrained and never compromise readability.
- AI screening is clearly distinct from official human review.
- Essential workflows must continue to make sense when a visual effect or external service fails.

## 3. Official brand palette

| Colour | HEX | RGB | CMYK | Role |
|---|---|---|---|---|
| Mulberry | `#32292F` | `50, 41, 47` | `0, 18, 6, 80` | Core dark foundation |
| Turquoise | `#99E1D9` | `153, 225, 217` | `32, 0, 4, 12` | Accent and interaction |

Mulberry is used for navigation, headings, dark surfaces, and strong visual anchors. Turquoise is used for key actions, selected states, interactive highlights, and restrained accents.

The following are proposed supporting neutrals, not additional official brand colours:

| Token | Value | Purpose |
|---|---|---|
| `surface-page` | `#F7F5F6` | Main page background |
| `surface-card` | `#FFFFFF` | Cards and forms |
| `surface-subtle` | `#EEE9EC` | Secondary surfaces |
| `text-primary` | `#32292F` | Main text |
| `text-secondary` | `#62575F` | Supporting text |
| `text-on-dark` | `#FFFFFF` | Text on Mulberry |
| `text-on-turquoise` | `#32292F` | Text on Turquoise |
| `border-default` | `#D8D0D5` | Standard borders |
| `border-strong` | `#A99DA5` | Emphasized borders |
| `focus-ring` | `#99E1D9` | Focus accent on dark surfaces |

Proposed status colours: pending `#8A5A00`, under review `#2457A7`, verified/resolved `#237447`, rejected `#B42318`, needs attention `#B54708`. Test these against their actual backgrounds. Always pair status colour with a readable label and, where useful, an icon.

**Colour rules:** Use Mulberry text on Turquoise and white text on Mulberry. Do not use Turquoise body text on white unless that exact combination passes contrast testing. Never rely on colour alone for status or errors. Glass effects must not obscure text.

## 4. Typography

**Winked** is the selected typeface. Verify the actual font asset, family name, available weights, and licence for web use before integration. If it cannot load, use a suitable system sans-serif fallback. Do not assume an asset or URL exists.

| Role | Desktop | Mobile | Weight |
|---|---:|---:|---|
| Display heading | 40–48 px | 32–36 px | Bold |
| Page heading | 32 px | 28 px | Bold |
| Section heading | 24 px | 22 px | Semibold |
| Card heading | 18–20 px | 18 px | Semibold |
| Body | 16 px | 16 px | Regular |
| Supporting text | 14 px | 14 px | Regular |
| Labels | 14–16 px | 16 px preferred | Medium |
| Small metadata | 12–13 px | 12–13 px | Regular |

Use a consistent heading hierarchy, readable line lengths, persistent field labels, and sentence case for most controls. Do not use typography alone to imply official verification.

## 5. Layout and spacing

Use a four-pixel spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, and 64 px. Proposed maximum widths: reading content 720 px, forms/details 960 px, standard content 1200 px. Map and admin layouts may use more available width.

Initial responsive breakpoints:
- Small: below 640 px.
- Medium: 640–1023 px.
- Large: 1024–1279 px.
- Extra large: 1280 px and above.

Treat breakpoints as starting points and refine them based on content. Use single-column forms on small screens, responsive navigation, viewport-fitting dialogs, reachable primary actions, and no hover-only functionality. Respect mobile safe areas for fixed elements.

## 6. Buttons — Light Glass reference

The supplied **Originkit Light Glass Button** is the visual reference. Its style includes a translucent surface, backdrop blur and saturation where supported, subtle shadow, highlighted edge, rounded corners, optional icons, and pointer-following light on compatible devices.

The supplied React component is a reference, not automatically production-ready code. Adapt it to the app's component structure and test browser support, keyboard behavior, and fallback rendering.

### Variants

- **Primary:** Turquoise surface, Mulberry text, subtle glass edge. Use for the main action, such as report submission.
- **Secondary:** Translucent light surface, Mulberry text, visible neutral or brand-tinted border.
- **Dark-surface:** Mulberry surface, white text, Turquoise edge or focus accent.
- **Icon button:** Consistent with its related variant; must have an accessible name.
- **Destructive:** Clearly distinguishable treatment and descriptive label.

Do not copy white text on white fill when contrast is insufficient.

### States and motion

Define default, hover, focus, active, disabled, loading, and error states. Use semantic buttons for actions and links for navigation. Prevent duplicate submissions, preserve visible keyboard focus, and never show success before backend confirmation.

Pointer lighting and animated edges are optional. Respect `prefers-reduced-motion`, avoid unnecessary idle animation, do not depend on pointer effects on touch screens, and provide fallbacks if `backdrop-filter`, CSS masking, or `ResizeObserver` behavior is unsupported.

## 7. Forms and report submission

The reporting form should present a clear sequence: photo, issue type or description, location, other approved required details, privacy guidance, submit action, and confirmation/error. Exact fields must follow the approved PRD and backend schema.

- Keep visible labels; placeholders are supplementary.
- Identify required fields and show actionable validation messages.
- Preserve input after recoverable failures.
- Explain photo requirements and visibility before submission.
- Provide location permission and manual alternatives where supported.
- Communicate upload errors and file limits clearly.

Submission states: idle, validating, submitting, success, recoverable failure, and uncertain outcome. Success requires backend confirmation. If a network failure makes the result uncertain, do not falsely claim success or failure; offer a safe way to check or retry. AI screening unavailability must not prevent an otherwise valid report from being submitted.

## 8. Report cards and details

Cards prioritize a photo or fallback, short description, location, official status, relevant date/metadata, and an action to open details. Keep spacing, borders, image aspect ratios, and typography consistent. Make interactive areas clear.

Report details must distinguish user-submitted information, AI screening, official review, resolution information, and public metadata. Do not expose private tracking tokens, internal reviewer notes, or administrative-only information in public views.

## 9. Map design

The proposed map library is Leaflet. Select map tiles and styling with licensing, attribution, reliability, and usage limits in mind.

- Keep map controls usable on mobile and desktop.
- Use consistent markers and a clear selected state.
- Distinguish statuses with labels or cues, not colour alone.
- Link marker selection to the corresponding report summary.
- Handle overlapping markers and empty, loading, and error states.
- Provide manual map navigation if location permission is denied, where supported.
- Where practical, selecting a report highlights its marker and selecting a marker highlights its report.

Advanced filtering must not delay the core map-and-report workflow.

## 10. Status, AI screening, and administration

Use consistent official status labels, finalized against product requirements and the backend schema. Potential states include Pending review, Under review, Verified, Resolved, and Rejected. Do not display a status transition until the backend confirms it.

Label AI output clearly, such as “AI screening result” or “Possible pothole detected.” Show only actual model outputs. Do not invent confidence scores or represent classification as official verification. Severity rules remain open until defined.

Admin screens should prioritize evidence, status, clear actions, and feedback. Confirm consequential actions, prevent repeated actions while requests are in progress, and show saved results only after confirmation. **Administrative authorization must be enforced by the backend.** Hiding a control is not access control.

## 11. System feedback

Every major screen needs loading, empty, error, and success states.

- **Loading:** Keep layout stable and prevent duplicate operations.
- **Empty:** Explain what is absent and what the user can do next.
- **Error:** Use plain language, preserve safe input, and do not expose secrets, stack traces, database details, or private paths.
- **Success:** Confirm only after the operation succeeds.
- **Uncertain result:** Distinguish uncertainty from confirmed failure.
- **Notifications:** Keep critical privacy and submission information visible; do not rely only on a disappearing toast.

## 12. Accessibility

Target WCAG 2.2 AA: normal text contrast at least 4.5:1, large text at least 3:1, and applicable non-text contrast for meaningful controls and boundaries. Test rendered combinations, especially glass surfaces, focus, disabled states, and badges.

All essential actions must be keyboard accessible. Use semantic headings, buttons, links, labels, and form controls; associate validation errors with fields; name icon-only controls; provide meaningful image alt text; announce important asynchronous updates; and manage dialog focus correctly.

Aim for touch targets around 44 × 44 CSS pixels where practical. Respect reduced motion. Glass effects must have readable fallbacks and must not obscure labels or focus indicators.

## 13. Icons and imagery

Use one consistent icon family and stroke weight. Pair ambiguous icons with text and give standalone icon controls accessible names. Avoid unnecessary decoration.

Road photos must retain a sensible aspect ratio, have fallbacks, avoid distortion, and follow the product's privacy and visibility rules. Decorative patterns and gradients must not compete with reporting, map exploration, or review.

## 14. Proposed design tokens

The following CSS is a proposal, not evidence that tokens have already been added.

```css
:root {
  --color-mulberry: #32292F;
  --color-turquoise: #99E1D9;
  --color-surface-page: #F7F5F6;
  --color-surface-card: #FFFFFF;
  --color-surface-subtle: #EEE9EC;
  --color-text-primary: #32292F;
  --color-text-secondary: #62575F;
  --color-text-on-dark: #FFFFFF;
  --color-border-default: #D8D0D5;
  --color-border-strong: #A99DA5;
  --color-focus-ring: #99E1D9;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;

  --shadow-card: 0 4px 16px rgb(50 41 47 / 8%);
  --shadow-glass-button: 0 8px 24px rgb(50 41 47 / 18%);
  --motion-fast: 120ms;
  --motion-standard: 200ms;
}
```

Add typography tokens after Winked's actual asset and weights are verified.

Prioritize reusable buttons, form fields, validation messages, report cards, status badges, image upload/preview, loading/error/empty states, dialogs, map markers/report summaries, and admin review actions. Do not build a large component library before the core workflow works.

## 15. Architecture alignment

The documented technical direction is React and Vite for the frontend, Supabase for proposed backend services, and Leaflet for the map. This document does not claim those integrations are implemented.

UI decisions must respect backend privacy and authorization. Client-side appearance is not an access-control boundary. When AI, map, or backend services fail, show honest and understandable fallbacks.

## 16. MVP implementation priorities

### Phase 1 — Working MVP
1. Apply brand colours and foundational layout tokens.
2. Establish typography; use Winked after verifying the asset and licence.
3. Implement accessible buttons and forms.
4. Build report submission and confirmation.
5. Build report cards and details.
6. Build the public map and marker interaction.
7. Build basic admin review.
8. Add loading, empty, error, and success states.
9. Verify mobile responsiveness and essential accessibility.

### Phase 2 — Visual refinement
1. Refine glass button surfaces and edges.
2. Add pointer lighting only where useful.
3. Tune shadows, borders, and selected map styling.
4. Refine responsive spacing and transitions.
5. Test fallbacks and reduced-motion behavior.

### Phase 3 — Production-oriented improvements
1. Audit contrast and keyboard access across states.
2. Validate screen-reader announcements and focus management.
3. Test lower-powered mobile devices and poor networks.
4. Refine consistency across the application.

Decorative effects must not delay the functional MVP.

## 17. Verification checklist

### Brand and typography
- [ ] Official HEX values are correct.
- [ ] Supporting colours do not compete with the brand.
- [ ] Winked is loaded from a verified, licensed source or a fallback is used.
- [ ] Typography hierarchy is consistent.

### Buttons and forms
- [ ] Button variants have readable contrast.
- [ ] Keyboard focus is visible.
- [ ] Loading and disabled states behave correctly.
- [ ] Reduced motion is respected.
- [ ] Recoverable failures preserve input.
- [ ] Success appears only after backend confirmation.

### Map, reports, and administration
- [ ] Markers correspond to the correct reports.
- [ ] Empty and failed map states are understandable.
- [ ] Cards remain readable on small screens.
- [ ] AI screening is distinct from official status.
- [ ] Public views do not expose private tracking data.
- [ ] Admin access is enforced by the backend.
- [ ] Private reviewer information is not public.

### Responsive and accessibility
- [ ] Essential workflows work on mobile and desktop.
- [ ] No unintended horizontal scrolling occurs.
- [ ] Contrast meets applicable WCAG 2.2 AA requirements.
- [ ] Essential interactions work without a mouse.
- [ ] Touch targets and focus behavior are usable.
- [ ] Glass effects have readable fallbacks.

Only check an item after testing it. This document alone does not establish implementation or verification.

## 18. Open decisions

1. Verify Winked asset, licence, family name, and weights.
2. Adapt and test the glass button reference in the actual component structure.
3. Confirm official status labels and transitions against the backend schema.
4. Confirm real AI screening fields and failure behavior.
5. Finalize map markers, controls, and tile provider.
6. Contrast-test supporting and semantic colours.
7. Refine responsive breakpoints after real layouts exist.
8. Confirm target browser support and fallbacks.

## 19. Final design direction

RoadWatch AI should have a distinctive **Mulberry-and-Turquoise identity**, a consistent **Winked-based typographic system**, and a restrained **glass-inspired button language** based on the supplied Originkit reference.

The interface must remain readable and functional when decorative effects or external services fail. Reporting, the public map, report status, and administrative review take priority over visual complexity.

**Acceptance principle:** Users can report a road issue, understand what happens next, find reports on the map, and distinguish AI screening from official review on mobile and desktop.

**Status note:** This is a design specification. Implementation and testing are tracked separately.
