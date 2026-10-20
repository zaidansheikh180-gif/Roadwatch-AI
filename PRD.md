# RoadWatch AI — Product Requirements Document (PRD)

**Document status:** Approved baseline — v1.0  
**Last updated:** October 21, 2026  
**Product type:** Responsive web application  
**Geographic scope:** India  
**Purpose:** Hackathon demonstration

## 1. Product Overview

RoadWatch AI is a civic reporting platform that allows citizens to report damaged roads using photographs and location data. AI screens submitted reports and suggests a damage type and, only where adequately supported, severity. A public map displays reported damage, while administrators review reports and update their status.

The application demonstrates how AI-assisted reporting can organize road-damage information and make report progress visible to citizens.

## 2. Problem Statement

Citizens may encounter potholes, cracked roads, and other road damage without a convenient way to report the issue and track progress. Reports can be difficult to organize, verify, and communicate consistently.

RoadWatch AI provides a single interface for submitting reports, viewing reported damage, screening submissions with AI, and managing report status.

## 3. Product Vision

Build a functional, accessible demonstration of an AI-assisted road-damage reporting system connecting citizen submissions, a public map, and an administrative review workflow.

## 4. Goals and Non-Goals

### 4.1 Goals

- Submit road-damage reports with photographs and location information.
- Support anonymous reporting through a unique tracking code.
- Support registered accounts with report history.
- Use AI to suggest damage categories and, where adequately supported, severity.
- Accept reports when AI screening fails or is uncertain.
- Display public reports on an interactive map.
- Let administrators review reports and update status.
- Include realistic sample data alongside real test submissions for the demo.
- Keep the core demo free-first, avoiding mandatory paid services.

### 4.2 Non-Goals for the MVP

- Integration with real municipal or government systems.
- Automatic dispatch of repair crews or official repair requests.
- Automated duplicate detection.
- Verification using before-and-after repair photographs.
- Guaranteed damage detection or severity prediction in every image.
- Native Android or iOS applications.
- Production-scale deployment across all of India.
- Google sign-in in the initial authentication implementation.

## 5. Target Users

- **Citizens:** Submit reports, view public reports, and track progress.
- **Anonymous reporters:** Submit without an account and track using a unique code.
- **Registered citizens:** Register, sign in, submit reports, and view their report history.
- **Administrators:** Review submissions, inspect photos and AI suggestions, correct classifications, reject invalid reports, and update statuses.

## 6. Scope and Priorities

### Priority 1 — Road-Damage Reporting

- Photograph upload.
- Location selection through browser geolocation or manual map selection.
- Optional description.
- Anonymous and authenticated submissions.
- Unique tracking code for anonymous submissions.
- Report history for registered users.

### Priority 2 — AI Screening

- Analyze submitted photographs using a suitable road-damage model.
- Suggest a damage category.
- Suggest severity only if the chosen model or method supports it and testing justifies the estimate.
- Represent uncertainty or screening failure.
- Allow administrator review and correction.

### Priority 3 — Public Map

- Interactive map of public reports.
- Report markers and basic report details.
- Visible verification state.
- Report status and available AI screening results.
- Clear distinction between sample data and real test submissions.

### Priority 4 — Administration

- Administrative authentication and access control.
- Report review interface.
- Status updates.
- Ability to correct AI suggestions.
- Ability to reject invalid reports.

## 7. User Journeys

### 7.1 Anonymous Reporting

1. Citizen opens the reporting page.
2. Citizen uploads a photograph of road damage.
3. Citizen selects a location or grants location permission.
4. Citizen optionally adds a description.
5. Application validates the submission.
6. AI screening attempts to classify the photograph.
7. Application saves the report even if screening is uncertain or unavailable.
8. Citizen receives a unique tracking code.
9. Report appears on the public map with an **Unverified** label.

The tracking code must be shown clearly and be available to save. Knowing a public report ID must not grant unrestricted report-management access.

### 7.2 Registered Reporting

1. Citizen registers or signs in.
2. Citizen submits a report using the reporting flow.
3. Report is associated with the authenticated account.
4. Citizen views the report in account history.
5. Citizen checks status updates.

### 7.3 Public Map

1. Visitor opens the map.
2. Visitor sees public reports in the displayed map area.
3. Visitor selects a marker.
4. Application displays public report details: photograph, location, submission time, status, and available AI screening information.
5. Verification state remains clear.

Uploaded photographs are intended to be viewable with public reports. The MVP does not promise automatic blurring of faces, vehicle number plates, or other identifying details. Users must be informed that submitted photographs may be publicly visible.

### 7.4 Administrative Review

1. Administrator signs in through an authorized administrative account.
2. Administrator opens the report queue.
3. Administrator inspects photograph, location, description, and AI screening results.
4. Administrator may correct the suggested damage type or severity.
5. Administrator updates status as appropriate.
6. Citizen sees the updated status through tracking or account history.

### 7.5 AI Uncertainty or Failure

1. A report is submitted.
2. AI screening returns an uncertain result, unsupported prediction, or processing error.
3. Application retains the report.
4. Report is flagged for manual review.
5. Administrator reviews it without relying on an unsupported AI conclusion.

## 8. Functional Requirements

### 8.1 Reporting

- **FR-001:** Citizens can submit a road-damage report.
- **FR-002:** A report must include a photograph and location.
- **FR-003:** Description is optional.
- **FR-004:** Browser geolocation is supported when permission is granted.
- **FR-005:** A location can be selected or adjusted manually on the map.
- **FR-006:** Required fields and supported image formats are validated.
- **FR-007:** Validation and upload errors are understandable.
- **FR-008:** Anonymous and registered submissions are supported.
- **FR-009:** Each successful report receives a unique report identifier.
- **FR-010:** Anonymous reporters receive a unique tracking code.
- **FR-011:** Registered reports are associated with the authenticated user.
- **FR-012:** Registered users can view their report history.

### 8.2 AI Screening

- **FR-013:** The application attempts AI screening of uploaded photographs.
- **FR-014:** Screening suggests a damage category when supported by the model.
- **FR-015:** Severity is displayed only when the chosen model or method supports the estimate and its limitations are documented.
- **FR-016:** AI categories and severity estimates are suggestions, not authoritative findings.
- **FR-017:** Uncertain, unsupported, and failed screening outcomes are represented.
- **FR-018:** AI screening failure does not prevent an otherwise valid report from being submitted.
- **FR-019:** Administrators can inspect and correct AI-generated suggestions.
- **FR-020:** The application never implies an AI result has been independently verified when it has not.

### 8.3 Public Map and Report Details

- **FR-021:** The application provides an interactive map of public reports.
- **FR-022:** Visitors can select markers and inspect public report details.
- **FR-023:** Public details include the photograph, location, status, and available screening information.
- **FR-024:** Public reports display a clear verification label.
- **FR-025:** Uploaded photographs are viewable with their associated public reports.
- **FR-026:** Private account information, credentials, and administrative-only information are not exposed through public views or APIs.
- **FR-027:** Sample reports and real test submissions are distinguishable.
- **FR-028:** Public map access does not require a citizen account.

### 8.4 Authentication and Account Management

- **FR-029:** Email/password registration and login work in the first authentication phase.
- **FR-030:** Passwords are stored using an appropriate secure password-hashing method, never as plaintext.
- **FR-031:** Authenticated users can access their own report history.
- **FR-032:** Users cannot access another user's private account or report-management data.
- **FR-033:** Google sign-in remains in the intended product scope but is implemented only after email/password authentication works.
- **FR-034:** Administrative access is restricted to authorized administrator accounts.

### 8.5 Administration and Status Management

- **FR-035:** Administrators have a report-review interface.
- **FR-036:** Administrators can update report status.
- **FR-037:** Administrators can reject invalid reports and record a reason where feasible.
- **FR-038:** Administrators can correct AI-generated classifications and severity suggestions.
- **FR-039:** The application preserves the distinction between submitted, reviewed, and resolved reports.

## 9. Report Status Lifecycle

Statuses:

- **Submitted:** The report has been received.
- **Under Review:** An administrator is examining the report.
- **In Progress:** The report is marked as being addressed within the demonstration workflow.
- **Resolved:** The report is marked as resolved in the application.
- **Rejected:** The report is determined to be invalid or unsuitable for inclusion.

New reports become publicly visible immediately with an **Unverified** label. Verification is separate from lifecycle status: a report can be Submitted and Unverified at the same time.

This is a demonstration workflow. In Progress or Resolved does not independently prove that a municipal authority has acted.

## 10. Non-Functional Requirements

### Security and Privacy

- **NFR-001:** Authentication and authorization are enforced on protected operations.
- **NFR-002:** Passwords are securely hashed.
- **NFR-003:** Public APIs do not return private account data or administrative credentials.
- **NFR-004:** Tracking codes are difficult to guess and do not grant unrestricted administrative access.
- **NFR-005:** Image uploads are validated for file type and size and handled safely.
- **NFR-006:** Users are informed that report photographs may be publicly viewable.

### Reliability

- **NFR-007:** A valid report remains saved if AI screening fails.
- **NFR-008:** Upload, authentication, and processing failures are communicated clearly.
- **NFR-009:** Successful submission provides confirmation and a way to track the report.

### Usability and Accessibility

- **NFR-010:** The interface works on common mobile and desktop screen sizes.
- **NFR-011:** Forms provide clear labels, validation messages, and submission feedback.
- **NFR-012:** Manual location selection is available as an alternative to browser geolocation.

### Performance

- **NFR-013:** Routine interactions should remain responsive on typical consumer devices and networks.
- **NFR-014:** Image processing must not make submission appear to have failed when the report has already been saved.
- **NFR-015:** Performance targets are finalized after testing the selected model and demo environment.

### Maintainability and Cost

- **NFR-016:** Frontend, backend, storage, and AI screening should be modularly separated.
- **NFR-017:** The MVP avoids mandatory paid APIs and services where practical.
- **NFR-018:** Model licensing and usage restrictions are checked before selection.
- **NFR-019:** Map data and tile services are used according to applicable usage policies.

## 11. Acceptance Criteria

- **AC-001:** A citizen submits a report with a valid photograph and location.
- **AC-002:** An anonymous submission returns a unique tracking code.
- **AC-003:** A registered citizen can sign in and view their own reports.
- **AC-004:** Email/password registration and login work before Google sign-in is introduced.
- **AC-005:** A report is retained when AI screening is unavailable or uncertain.
- **AC-006:** AI output is presented as a suggestion, with uncertainty represented where applicable.
- **AC-007:** An administrator can review a report and correct AI suggestions.
- **AC-008:** An administrator can update a report through supported lifecycle statuses.
- **AC-009:** Public visitors can view the map and reports without signing in.
- **AC-010:** Public report details show the uploaded photograph and an Unverified label when the report has not been reviewed.
- **AC-011:** Public views do not expose private account information or administrative-only data.
- **AC-012:** Sample data and real test submissions are clearly distinguishable.
- **AC-013:** The responsive interface is usable on mobile and desktop layouts.
- **AC-014:** The team can demonstrate submission through administrative review and status updates.

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AI misclassifies damage | Present predictions as suggestions; allow manual correction. |
| Severity estimates are unreliable | Validate before displaying them; omit unsupported estimates. |
| AI processing fails | Save the report and flag it for manual review. |
| Public photos reveal identifying details | Disclose public visibility; consider automatic blurring as a later enhancement. |
| Anonymous tracking codes are guessed | Use unpredictable codes and restrict tracking endpoint data. |
| Google sign-in consumes hackathon time | Deliver email/password authentication first. |
| Map or model services impose restrictions | Check licensing and usage policies before selecting dependencies. |
| Reports are mistaken for official municipal actions | Clearly label the app as a demonstration without authority integration. |
| Model performance varies by location or image conditions | Test representative images and disclose known limitations. |

## 13. Assumptions and Constraints

- The product is a hackathon demonstration, not an official municipal service.
- Geographic scope is India, but AI performance is not assumed to be validated across all regions.
- Reports require a photograph and location; descriptions are optional.
- Reports are public by default and marked Unverified until reviewed.
- Anonymous tracking and registered report history are both required.
- Email/password authentication is implemented first; Google sign-in follows later.
- Duplicate detection and repair-photo verification are outside the MVP.
- Real municipal integration is outside the MVP.
- The technical stack remains provisional until documented in TRD.md.
- Final hackathon deadline and judging criteria are not yet confirmed.

## 14. Open Questions

1. What maximum image size and accepted formats should the MVP support?
2. Which road-damage model can be used legally and reliably within the available time and compute budget?
3. What evidence is required before displaying an AI-generated severity estimate?
4. Should administrators have internal notes hidden from the public?
5. What hosting and deployment environment will the team use?
6. What is the final hackathon deadline, and what are the official judging criteria?
7. Should future versions automatically blur faces and vehicle number plates?

These questions should be resolved in the relevant technical and implementation documents without blocking the core product scope.

## 15. Dependencies on Other Documents

- **TRD.md:** Technology choices, architecture constraints, model evaluation, authentication implementation, and hosting.
- **APP_FLOW.md:** Screen transitions and interaction flows.
- **UI_UX_BRIEF.md:** Layout, responsive behavior, accessibility, and visual requirements.
- **BACKEND_SCHEMA.md:** Entities, fields, permissions, lifecycle, and tracking-code design.
- **IMPLEMENTATION_PLAN.md:** Build phases, task ordering, testing, and Google sign-in sequencing.
- **ARCHITECTURE.md:** System components and their relationships.
- **DESIGN.md:** Design tokens and interface conventions.
- **README.md:** Setup, run instructions, demo information, and project overview.
- **PROGRESS.md:** Implementation progress, completed work, blockers, and verification.
- **MEMORY decision log:** Persistent record of important project decisions, rationale, and changes.

## 16. Change Control

Changes to scope, priorities, authentication sequencing, public visibility, AI behavior, or acceptance criteria should be reviewed before implementation. Record significant decisions and rationale in the private MEMORY decision log.
