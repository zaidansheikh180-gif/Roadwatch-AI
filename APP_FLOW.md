# RoadWatch AI — Application Flow Document

- **Version:** 0.1
- **Last Updated:** 2026-10-21
- **Status:** Proposed baseline for MVP flow
- **Related Documents:** [PRD.md](./PRD.md) · [TRD.md](./TRD.md)

## 1. Purpose

This document defines the main screens, user journeys, navigation rules, decision points, and error states for the RoadWatch AI MVP. It describes the intended behavior, not a claim that the application has already been implemented.

## 2. User Roles

| Role | Intended capabilities |
| --- | --- |
| Public visitor | View the public map and public report details; start a report; track a report with its tracking code |
| Anonymous reporter | Submit a report without creating an account and receive a tracking code |
| Registered citizen | Sign in, submit reports, and view their own report history |
| Administrator | Access the protected review queue, review reports, and update permitted verification and lifecycle states |

Administrative access must be enforced by trusted backend authorization, not merely by hiding a link in the frontend.

## 3. Global Navigation

The primary navigation should provide access to:

- **Home** — overview and primary actions.
- **Report Damage** — begin the report submission flow.
- **Public Map** — browse publicly visible reports.
- **Track Report** — look up a report using its tracking code.
- **My Reports** — available to signed-in citizens.
- **Sign In / Account** — authentication and account actions.
- **Admin Review** — visible only to authorized administrators, with backend authorization required on every protected operation.

Navigation may collapse on small screens. Exact visual layout belongs in `UI_UX_BRIEF.md`.

## 4. Application Entry and Home

1. A visitor opens the application.
2. The home screen explains the road-damage reporting purpose and clearly identifies the application as a hackathon demo.
3. The visitor can choose **Report Damage**, **Explore Map**, or **Track Report**. Sign-in is available but is not required to browse or submit an anonymous report.
4. If backend services are unavailable, the application explains which actions are temporarily unavailable and does not imply that data was saved.

## 5. Anonymous Report Submission

### 5.1 Main journey

1. The reporter selects **Report Damage**.
2. The reporter selects or captures a photograph.
3. The application previews the image and validates the supported file type and configured size limit.
4. The reporter sets the damage location using device geolocation or by selecting a point on the map. They can adjust the pin if the detected location is inaccurate.
5. The reporter may add a short description.
6. Before submission, the interface explains the photograph and location visibility policy. The exact public/private media policy must be finalized before implementation.
7. The reporter submits the form.
8. The application validates required fields and sends the report and image to the backend.
9. A report is considered accepted only after the backend confirms report creation. AI screening may begin after creation and may finish later.
10. The confirmation screen shows the tracking code, initial report lifecycle state, verification state, and AI screening state. It provides actions to view the report or open the public map.

### 5.2 Validation and failure paths

- **Missing photograph or location:** identify the missing field and prevent submission.
- **Unsupported or oversized image:** explain the issue and allow the reporter to select another image.
- **Location permission denied:** offer manual map selection rather than blocking the report.
- **Inaccurate geolocation:** allow the reporter to move the location pin before submission.
- **Upload or report creation failure:** show an actionable error and allow retry. Do not show a success confirmation or tracking code for a report that the backend did not create.
- **AI screening failure:** preserve the accepted report and mark screening as failed or requiring manual review. Do not ask the reporter to submit the same report again solely because AI failed.
- **Repeated submit attempt:** prevent accidental duplicate submissions where feasible; do not promise duplicate detection until implemented and tested.
- **Network interruption:** an offline retry queue is optional. If implemented, queued items must be clearly labeled as pending and must not be presented as accepted until the backend acknowledges them.

### 5.3 Confirmation state

The confirmation view should distinguish these concepts:

- **Lifecycle:** initially `Submitted`.
- **Verification:** initially `Unverified`.
- **AI screening:** pending, completed, failed, or another explicitly defined state supported by the backend schema.

AI screening is not the same as administrative verification.

## 6. Registered Citizen Flow

1. The visitor chooses **Sign In** or **Create Account**.
2. The application uses Supabase Auth for the approved MVP authentication flow. Email/password is the initial proposed method; email confirmation behavior depends on the configured project settings. Google sign-in is a later enhancement unless separately approved.
3. After authentication, the citizen reaches an account area showing their reports and current states.
4. A signed-in citizen can start the same report submission journey; successful reports are associated with their account.
5. The citizen can open a report to view its permitted details and status.
6. The citizen can sign out from the account area.

If a session expires during an action, preserve any locally available form input where safe, explain that sign-in is required, and avoid claiming that an unconfirmed submission succeeded. Authorization for viewing or changing data must be enforced by the backend.

## 7. Anonymous Report Tracking

1. The visitor opens **Track Report**.
2. They enter the tracking code received after a successful submission.
3. The application sends the code to a protected backend lookup.
4. For a valid code, the application displays only fields intended for the reporter-facing view, such as report location, permitted image/details, lifecycle state, verification state, and AI screening state.
5. For an invalid or unrecognized code, show a concise message and allow another attempt. Avoid exposing private data or confirming unrelated report details.

The tracking-code format, entropy, expiration policy, and rate limiting remain implementation decisions. Tracking codes must not be treated as authorization for administrative actions.

## 8. Public Map Flow

1. A visitor opens **Public Map** without needing to sign in.
2. The map loads publicly visible report markers from the backend.
3. Selecting a marker opens a concise summary and an action to view permitted report details.
4. The report detail view keeps lifecycle, verification, and AI screening states visually distinct.
5. The map should not imply that every submitted report is verified or that a reported road has been repaired.

Expected initial states include lifecycle `Submitted`, verification `Unverified`, and AI screening pending, completed, or failed, as applicable.

If map tiles or report data fail to load, explain the problem and offer retry. Where safe and available, previously loaded data may remain visible with a clear indication that it may be stale. The map tile provider and caching behavior remain open decisions.

## 9. AI Screening Flow

1. The backend accepts and stores a report.
2. The system schedules or performs AI screening according to the selected inference architecture.
3. The result is associated with the report and made available to authorized review flows.
4. The interface may display a screening summary or confidence information only if the selected model provides meaningful, validated values.
5. Low-confidence, ambiguous, unsupported, or failed results should be flagged for manual review.

AI screening must not block report acceptance. A failed inference must not delete or invalidate the accepted report. A severity score is optional and may be shown only if the chosen model supports it and the result is appropriately validated.

## 10. Administrative Review Flow

1. An administrator opens **Admin Review** and authenticates if necessary.
2. The backend verifies administrator privileges before returning the review queue or allowing any protected action.
3. The administrator opens a report and reviews its photograph, location, description, AI screening result, and current states.
4. The administrator may confirm or correct the screening suggestion and update the verification and lifecycle states permitted by the final backend rules.
5. If a report is rejected, the interface should capture a reason where feasible and approved by the schema.
6. The application confirms an update only after the backend reports success.

Proposed lifecycle states for the MVP are:

- `Submitted`
- `Under Review`
- `In Progress`
- `Resolved`
- `Rejected`

These are proposed application states, not proof of action by a municipal authority. In particular, `Resolved` must not imply an independently verified physical repair unless the product defines and supports that verification.

If an update fails, retain the last confirmed state, show an error, and allow retry. Do not optimistically present an unconfirmed status change as saved. The exact allowed transitions and audit-history requirements remain to be finalized in `BACKEND_SCHEMA.md`.

## 11. Shared Error and Empty States

| Condition | Expected behavior |
| --- | --- |
| No public reports | Show an informative empty state and an option to submit a report |
| No reports in a citizen account | Explain that submitted reports will appear here |
| Invalid report form | Identify fields requiring correction without clearing valid input |
| Unsupported or oversized image | Explain the supported requirements and allow replacement |
| Geolocation unavailable or denied | Offer manual location selection |
| Upload or report creation fails | Show retry guidance; do not show success |
| AI screening fails | Preserve the report and flag manual review |
| Invalid tracking code | Show a concise lookup error without exposing unrelated information |
| Session expires | Explain the need to sign in again and preserve safe local input where possible |
| Unauthorized admin access | Deny access; do not rely on frontend navigation restrictions alone |
| Admin update fails | Keep the last confirmed state and allow retry |
| Backend unavailable | Show a service error and disable or safely degrade dependent actions |
| Map tiles or report data fail | Explain what failed and offer retry; distinguish stale data if shown |

All error messages should be understandable to nontechnical users and should not expose stack traces, credentials, or sensitive backend details.

## 12. Core Navigation and Redirect Rules

- Successful report creation leads to the confirmation screen with the backend-issued tracking code.
- Failed or unconfirmed creation must not lead to a success screen.
- Report details may link back to the public map where the report is publicly visible.
- After sign-in, return the user to the intended safe destination when practical; validate redirect targets to prevent unsafe redirects.
- Direct navigation to a protected admin URL must still trigger backend authorization.
- Signing out returns the user to a public screen and removes access to authenticated views.
- A failed status update stays on the review context and shows the last confirmed state.

## 13. Responsive Behavior

- **Desktop:** map and report details may be shown side by side where space allows.
- **Mobile:** prioritize a compact navigation pattern, camera/photo picker support, touch-friendly map controls, and either a bottom sheet or a dedicated report-detail screen.
- Form input and progress should remain usable on narrow screens and with a mobile keyboard open.

Exact breakpoints, component layouts, and visual styling belong in `UI_UX_BRIEF.md` and `DESIGN.md`.

## 14. Accessibility and Usability

- Provide visible labels and understandable instructions for form controls.
- Support keyboard navigation and visible focus.
- Associate validation messages with the relevant fields.
- Do not communicate status by color alone; include text labels.
- Provide appropriate alternative text for meaningful images.
- Make interactive map controls accessible where feasible and provide a usable alternative for selecting a location.
- Clearly distinguish AI suggestions, administrative verification, and lifecycle state.
- Confirm consequential administrative actions where appropriate.

## 15. MVP Flow Priorities

### Priority 1 — Core hackathon demonstration

- Home and primary navigation.
- Anonymous report submission with photograph and location.
- Backend-confirmed submission and tracking code.
- Public map and permitted report details.
- AI screening success and failure handling.
- Protected administrator review and status updates.

### Priority 2 — Citizen accounts and history

- Email/password authentication.
- Registered report submission.
- Personal report history.
- Tracking-code lookup.
- Session-expiration handling.

### Later enhancements, not assumed to be in the MVP

- Google sign-in.
- Automatic image blurring or redaction.
- Duplicate-report detection.
- Repair-photo verification.
- Advanced map filters.
- Full offline-first submission and synchronization.

## 16. Open Implementation Decisions

Resolve these in the relevant follow-on documents before treating them as implemented requirements:

- Tracking-code format, entropy, expiration, and rate limits.
- Exact public/private policy for uploaded photographs and personal information.
- Final AI screening state values and the fields returned by the selected model.
- Whether confidence and severity are supported and safe to display.
- Allowed lifecycle transitions, rejection reasons, and status-history visibility.
- Exact admin authorization mechanism and test coverage.
- Whether a local retry queue is included in the MVP.
- Map tile provider, caching strategy, and mobile map-detail interaction.
- Final authentication settings and account recovery behavior.

---

**Implementation note:** This document defines intended application behavior. It does not establish that any flow or feature has been implemented or tested.
