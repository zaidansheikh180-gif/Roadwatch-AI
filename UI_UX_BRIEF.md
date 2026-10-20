# RoadWatch AI — UI/UX Brief

**Version:** 0.1 — Draft for Review  
**Last Updated:** October 21, 2026  
**Status:** Proposed — Pending Approval  
**Product:** Responsive web application  
**Related Documents:** [PRD.md](./PRD.md) · [TRD.md](./TRD.md) · [APP_FLOW.md](./APP_FLOW.md)

## 1. Purpose

This document defines the user experience, interface structure, responsive behavior, accessibility requirements, and visual direction for RoadWatch AI.

It provides practical guidance for designing and implementing the interface while leaving detailed design tokens, component specifications, and implementation decisions to `DESIGN.md` and the relevant technical documents.

This is a design specification, not a claim that the interface has been implemented.

## 2. Product and UX Goals

The interface must help users:

1. Report road damage quickly using a photograph and location.
2. Submit a report without creating an account.
3. Understand whether a report was successfully submitted.
4. Track report progress using a tracking code or registered account.
5. Explore public reports on an interactive map.
6. Understand AI screening results without confusing them with official verification.
7. Allow administrators to review reports and update their statuses efficiently.

### UX priorities

- **Clarity:** Users should understand what each screen does and what happens next.
- **Low friction:** Keep the reporting flow short and avoid unnecessary mandatory fields.
- **Trust:** Never imply that a report, AI prediction, or repair has been verified when it has not.
- **Accessibility:** Support different screen sizes, input methods, and user abilities.
- **Reliability:** Show accurate submission, loading, failure, and success states.
- **Demo readiness:** Make sample data distinguishable from real test submissions.

## 3. Target Users and Their Needs

| User | Primary need | UX response |
|---|---|---|
| Anonymous citizen | Report damage without registration | Direct reporting access and a clearly displayed tracking code |
| Registered citizen | Manage and track personal reports | Account dashboard with report history and status |
| Public visitor | See reported road damage in an area | Public map, clear markers, and readable report details |
| Administrator | Review and manage submissions | Protected review queue, clear report information, and explicit status controls |

Do not force visitors to sign in before viewing the public map or submitting an anonymous report.

## 4. Proposed Visual Direction

### Design character

Use a **clean, modern civic utility interface**. It should feel reliable, practical, and easy to navigate rather than looking like a government portal or a flashy AI experiment.

The visual system should prioritize:

- Clear typography and strong text contrast.
- Simple layouts with predictable navigation.
- Consistent spacing and alignment.
- Restrained use of color.
- Readable status labels.
- Obvious primary actions.
- Map and photograph content that receives sufficient space.

### Color direction

The final palette remains open until `DESIGN.md` is developed. The proposed direction is:

- Neutral backgrounds for readability.
- A dark, high-contrast primary text color.
- One consistent primary action color.
- Separate semantic colors for success, warning, and error states.
- Map-marker colors that remain distinguishable and are supported by text labels.

Do not use color as the only way to communicate verification, AI status, report lifecycle, or errors.

### Typography

Use a readable sans-serif typeface with:

- Clear distinction between page titles, section headings, body text, and metadata.
- Comfortable line height for mobile screens.
- Legible form labels and error messages.
- Tabular or aligned numerals where useful for dates, counts, and identifiers.

Exact font selection and type scale will be finalized in `DESIGN.md`.

### Iconography

Use familiar, consistent icons for actions such as location, camera, map, account, navigation, and status.

Icons that are not universally recognizable must have visible text labels or accessible names. Avoid decorative icons that make the interface harder to scan.

## 5. Information Architecture

The primary navigation should expose these destinations:

- **Home**
- **Report Damage**
- **Public Map**
- **Track Report**
- **My Reports** — authenticated users only
- **Sign In / Account**
- **Admin Review** — authorized administrators only

Administrative routes must be protected by backend authorization. Hiding a navigation item is not a security measure.

The interface should keep the primary reporting action easy to find from the home screen and public map.

## 6. Screen Requirements

### 6.1 Home

**Purpose:** Explain the product and direct visitors to the main actions.

Required elements:

- A concise explanation of RoadWatch AI.
- A prominent **Report Road Damage** action.
- A secondary **Explore Map** action.
- A **Track Report** action.
- A clear indication that this is a hackathon demonstration, not an official municipal service.
- A short explanation that AI screens reports and that human review is separate.

Avoid large blocks of introductory text that push the main actions below the fold on mobile.

### 6.2 Report Submission

**Purpose:** Help citizens submit a useful report with minimal friction.

The form should contain:

1. Photograph selection or camera capture.
2. Image preview and replacement action.
3. Location selection using device geolocation or manual map selection.
4. A visible location preview and an option to adjust the marker.
5. Optional description.
6. A submission action.
7. Clear validation, loading, and error feedback.

The interface must explain that uploaded photographs may be publicly viewable with the associated report. Automatic blurring of faces or vehicle number plates is not guaranteed in the MVP.

#### Form behavior

- Mark required fields clearly.
- Keep the description optional.
- Preserve valid form input when validation fails.
- Show image requirements before or during image selection.
- Request location permission only when the user invokes location detection.
- Offer manual location selection if permission is denied or unavailable.
- Disable or otherwise guard against repeated submissions while a request is processing.
- Show success only after the backend confirms report creation.

Do not make AI screening a prerequisite for the user to complete a valid report.

### 6.3 Submission Confirmation

**Purpose:** Confirm that the report was accepted and explain the next step.

Required elements:

- Clear submission-success message.
- Tracking code for anonymous reports.
- A prominent action to copy the tracking code.
- Initial lifecycle status: `Submitted`.
- Initial verification status: `Unverified`.
- AI screening state, when available.
- Actions to view the report or return to the public map.

The tracking code must be easy to read and save. Do not present a tracking code as valid before successful report creation.

If AI processing is still running, communicate that the report has been submitted and screening is pending.

### 6.4 Public Map

**Purpose:** Let visitors explore public road-damage reports.

Required elements:

- Interactive map.
- Markers representing public reports.
- A selected-report summary.
- Access to the full public report details.
- Visible lifecycle, verification, and AI screening states.
- A clear distinction between sample reports and real test submissions.

Map controls and markers must remain usable on mobile screens.

Where marker density makes individual markers difficult to select, clustering or another aggregation method may be considered if time allows.

If the map fails to load, explain whether the problem affects map tiles, report data, or both when that information is available. Offer retry rather than displaying an unexplained blank area.

### 6.5 Public Report Details

**Purpose:** Explain what was reported and what is currently known.

Display permitted information such as:

- Report photograph.
- Location.
- Submission date or time.
- Optional description.
- Lifecycle status.
- Verification status.
- Available AI screening result.

Use explicit labels. For example:

- `AI screening: Pothole suggested`
- `Verification: Unverified`
- `Report status: Submitted`

These labels describe different things and must not be merged into one status.

Public views must not expose private account information, internal administrative notes, or protected backend data.

### 6.6 Track Report

**Purpose:** Let an anonymous reporter look up a submission.

Required elements:

- Tracking-code input.
- Clear lookup action.
- Validation feedback.
- Report status and permitted report details after a successful lookup.
- A way to retry an unsuccessful lookup.

Invalid codes should produce a concise error without revealing unrelated report information.

### 6.7 Sign In and Registration

**Purpose:** Give registered citizens access to personal report history.

The initial authentication experience should support email and password.

Requirements:

- Clearly labeled email and password fields.
- Visible validation messages.
- Loading and authentication failure states.
- Password visibility toggle where practical.
- Registration and sign-in navigation.
- Sign-out access after login.
- Session-expiration handling.

Google sign-in is a later enhancement and must not delay the initial email/password flow.

Do not expose whether another account exists through unnecessarily detailed authentication errors.

### 6.8 Citizen Dashboard — My Reports

**Purpose:** Provide a quick overview of the signed-in citizen's reports.

Each report entry should show enough information to identify it, such as:

- Thumbnail or image placeholder.
- Submission date.
- Location summary.
- Lifecycle status.
- Verification status.

Selecting an entry opens the report details.

Include a useful empty state when the citizen has not submitted any reports, with a direct action to submit one.

Loading, backend failure, and expired-session states must be designed rather than left as blank screens.

### 6.9 Admin Review

**Purpose:** Help administrators review submissions and update report information.

Required interface elements:

- Protected access.
- Review queue.
- Clear indication of the report's current lifecycle and verification states.
- Photograph, location, description, and available AI screening results.
- Controls to correct AI suggestions.
- Permitted status-update controls.
- Rejection reason input where supported.
- Confirmation and error feedback.

The interface should make uncertain or failed AI screening visible without treating it as a confirmed classification.

Require confirmation for consequential actions such as rejecting a report when appropriate. Show a status change as saved only after the backend confirms the update.

The admin interface is part of the demonstration workflow; it must not imply that municipal authorities have received or acted on a report.

## 7. Status and Feedback Design

RoadWatch AI has three separate status concepts.

| Concept | Example values | UX requirement |
|---|---|---|
| Lifecycle | Submitted, Under Review, In Progress, Resolved, Rejected | Describe the report's workflow state |
| Verification | Unverified, with reviewed states defined by the backend | Make clear whether the report has been reviewed |
| AI screening | Pending, completed, uncertain, failed | Explain what the model returned or whether screening is available |

The final set of verification and AI states must match the backend schema.

### Feedback patterns

- **Loading:** Explain the action in progress when it may take noticeable time.
- **Success:** Confirm only a completed, backend-acknowledged operation.
- **Validation:** Identify the field and how to fix the issue.
- **Failure:** Explain what failed and provide a reasonable next step.
- **Empty state:** Explain why no content appears and offer a useful action.
- **Unavailable service:** Make the limitation visible without implying the user's action succeeded.

AI failure must not erase an accepted report or require the user to submit it again.

## 8. Responsive Design

The application must support common mobile, tablet, and desktop viewport sizes.

### Mobile

Priorities:

- Reporting action easy to reach.
- Camera and photo-picker support.
- Large touch targets.
- Single-column forms.
- Clear location selection and pin adjustment.
- Compact navigation.
- Map marker details presented through a bottom sheet or dedicated screen.
- No horizontal scrolling for core flows.

### Tablet

- Use available space without making forms excessively wide.
- Keep map interaction and report details easy to access.
- Ensure navigation and admin review remain usable.

### Desktop

- Use a wider map layout where it improves exploration.
- Consider a side-by-side map and selected-report panel.
- Use tables or structured lists for admin queues where they remain readable.
- Avoid excessive empty space or overly wide form fields.

Exact breakpoints and component dimensions belong in `DESIGN.md`.

## 9. Accessibility Requirements

- All form controls must have meaningful labels.
- Interactive elements must support keyboard navigation.
- Keyboard focus must remain visible.
- Validation errors should be associated with their relevant fields.
- Statuses must not rely on color alone.
- Text and interactive controls must have sufficient contrast.
- Images conveying report information should have appropriate alternative text.
- Buttons and icon-only controls need accessible names.
- The reporting form must remain usable with browser zoom and mobile keyboards.
- Map-based location selection should have an accessible alternative where practical.
- Dynamic status updates should be communicated to assistive technology without unnecessarily interrupting the user.

Accessibility should be considered during implementation, not added only at the end.

## 10. Privacy and Trust

The interface must:

- Disclose that submitted photographs may be publicly viewable.
- Avoid implying that automatic image redaction is available unless implemented and tested.
- Distinguish public information from account-only or administrator-only information.
- Avoid exposing internal notes or protected data on public screens.
- Explain that AI output is a suggestion rather than an authoritative finding.
- Clearly label the application as a demonstration without official municipal integration.
- Avoid presenting `In Progress` or `Resolved` as proof of municipal action.

The backend remains responsible for enforcing data access and authorization; interface design alone cannot provide privacy or security.

## 11. Demo Data and Presentation

The demo should feel complete without misleading viewers.

- Sample reports must be visibly distinguishable from real test submissions.
- Use realistic but clearly identified demonstration content.
- Include useful examples of different lifecycle and AI screening states.
- Avoid fabricated claims about official repairs, municipal partnerships, or model accuracy.
- Ensure empty, loading, error, and successful states can be demonstrated reliably.

The team should be able to show a complete path from submission through AI screening and administrative review.

## 12. MVP Design Priorities

### Priority 1 — Required for the core demo

- Home and primary navigation.
- Responsive report submission.
- Photograph preview and location selection.
- Validation and upload feedback.
- Submission confirmation and tracking code.
- Public map and report details.
- Clear AI screening and verification distinctions.
- Admin review and status updates.
- Error and loading states.

### Priority 2 — Required citizen account experience

- Email/password registration and sign-in.
- My Reports dashboard.
- Session-expiration handling.
- Empty states for users with no reports.

### Later enhancements

- Google sign-in.
- Automatic photo blurring.
- Advanced map filters.
- Duplicate-report indicators.
- Full offline-first interactions.
- More advanced admin analytics.

Later enhancements must not be represented as MVP features unless explicitly approved and implemented.

## 13. Design Handoff Requirements

Before implementation is considered design-complete, the following should be defined in `DESIGN.md` or the relevant implementation artifacts:

- Color tokens and semantic colors.
- Typography and text hierarchy.
- Spacing scale and layout rules.
- Button, input, card, dialog, and status-label conventions.
- Map marker and selected-report patterns.
- Responsive breakpoints.
- Loading, empty, success, and error components.
- Focus and disabled states.
- Image preview and upload behavior.

This brief establishes the intended UX; it does not prescribe a particular component library or claim that these components already exist.

## 14. Open Design Decisions

1. What final color palette and visual identity should the project use?
2. Should the home page show a map preview, or focus primarily on reporting?
3. Should report details appear in a mobile bottom sheet or a dedicated page?
4. Which report fields should appear in map-marker previews?
5. What is the most usable admin queue layout for the available demo time?
6. Which verification labels and AI screening labels will the final backend schema support?
7. What image-size guidance and preview behavior best fit the chosen upload limits?

These decisions should be resolved before the relevant interface is implemented, without expanding the MVP unnecessarily.

## 15. Approval and Implementation Boundary

This is a proposed UI/UX specification awaiting review. It has not yet been created in the GitHub repository.

After approval, create `UI_UX_BRIEF.md` on `main`, verify the committed file, and append the verified document record and any newly established decisions to the private Notion MEMORY page.
