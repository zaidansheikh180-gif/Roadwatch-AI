# RoadWatch AI — Technical Requirements Document (TRD)

**Version:** 0.1 — Draft for Review  
**Last Updated:** October 21, 2026  
**Status:** Approved for MVP planning; implementation not yet verified  
**Repository:** [zaidansheikh180-gif/Roadwatch-AI](https://github.com/zaidansheikh180-gif/Roadwatch-AI)  
**Related Document:** [PRD.md](https://github.com/zaidansheikh180-gif/Roadwatch-AI/blob/main/PRD.md)

---

## 1. Purpose and Scope

This document translates the product requirements in PRD.md into technical responsibilities, constraints, security requirements, testing expectations and deployment considerations. It describes the intended MVP design; it does not claim that features have already been implemented.

### 1.1 MVP scope

- Road-damage reports containing a photograph and geographic location.
- Anonymous and registered report submission.
- Actual AI-based image screening and suggested damage categories.
- A public map showing submitted reports.
- Administrative review and report-status updates.
- Responsive mobile and desktop web layouts.
- Free-first development and demonstration.

### 1.2 Out of scope

Production municipal integration, automatic duplicate detection, repair-photo verification, a production-grade high-availability deployment and custom model training are outside the MVP unless explicitly approved later.

---

## 2. Technical Baseline and Decision Status

| Component | Technical direction | Status |
|---|---|---|
| Frontend | React | Preferred baseline |
| Build tool | Vite | Proposed; confirm during implementation planning |
| Backend platform | Supabase | Approved for MVP planning |
| Database | Supabase PostgreSQL | Approved for MVP planning |
| Authentication | Supabase Auth; email/password first | Product direction |
| File storage | Supabase Storage | Proposed service choice |
| Server-side logic | Supabase Edge Functions where required | Proposed implementation |
| Mapping | Leaflet | Approved for MVP planning |
| Map tiles | Compatible, compliant tile provider | Open |
| AI screening | Evaluate pretrained/open-source computer-vision models | Approved direction |
| AI execution | Local or suitable free hosted inference | Open |
| Frontend hosting | Free-first provider | Open |
| Budget | Target ₹0 for development/demo where practical | Constraint, not a guarantee |

### 2.1 Architectural principle

Supabase is the sole backend platform for the MVP. Do not introduce a separate Express or FastAPI application backend unless a specific requirement cannot be handled appropriately through the chosen architecture.

AI inference may execute outside Supabase. An external model runtime is not a second general-purpose application backend.

### 2.2 Decision classification

- **Approved direction:** Accepted as the intended approach.
- **Proposed:** Recommended but not yet finalized.
- **Open:** Requires evaluation or a decision.
- **Verified:** Supported by implementation evidence or testing.

Approval of this document does not prove that the system works.

---

## 3. System Architecture Requirements

### 3.1 Logical architecture

1. **React frontend:** Report submission, public map, report tracking and administration screens.
2. **Supabase Auth:** Registration, login, session management and identity.
3. **Supabase PostgreSQL and Storage:** Report records, screening results, metadata and photographs.
4. **Supabase Edge Functions:** Trusted operations requiring protected credentials, access checks or service coordination.
5. **AI inference runtime:** Local or hosted environment that executes the selected computer-vision model.
6. **Leaflet and tile provider:** Interactive map and map imagery, supplied by separate components.

### 3.2 Report-submission flow

1. The reporter selects a photograph and provides a location.
2. The frontend validates required fields and permitted file types.
3. The photograph is uploaded through an authorized storage path.
4. A trusted operation creates the report record and initiates AI screening.
5. The AI runtime returns supported predictions and relevant confidence information.
6. Screening results are stored when available.
7. A valid report remains eligible for submission even if screening fails.
8. The public map displays eligible reports with verification state clearly identified.

The implementation must define partial-failure handling. An uploaded photograph without a report record, or a report record without a valid photograph reference, must not silently be treated as a completed submission.

### 3.3 Service boundaries

- React must not contain privileged service credentials.
- Supabase must enforce access restrictions independently of frontend visibility.
- AI predictions are suggestions, not authoritative verification.
- Public map data must be separated from private account information.
- The application must distinguish successful submission from pending, failed or uncertain operations.

---

## 4. Frontend Requirements

Use React for a responsive web interface. Vite is the proposed build tool, subject to confirmation.

The frontend must support:

- Mobile and desktop layouts and reusable components.
- Clear loading, success, empty and error states.
- Accessible form labels, validation messages and keyboard navigation for essential interactions.
- Report submission with photograph, location and optional description.
- Anonymous and registered reporting flows.
- Submission confirmation and anonymous tracking-code display.
- Public map and report details.
- Registered-user report history.
- An administrative review interface protected by authorization.
- Visible verification and lifecycle status labels.
- Clear feedback when AI screening is delayed, uncertain or unavailable.

Client-side validation improves usability but must not be the only validation layer. Backend logic must independently validate required fields, input lengths, file metadata and permissions.

---

## 5. Supabase Backend Requirements

### 5.1 Authentication

Use Supabase Auth. Initial scope includes email/password registration and login, session management, logout and access restrictions for authenticated features. Google sign-in is deferred unless the project scope changes.

### 5.2 Database

Use Supabase PostgreSQL as the primary database. It must support report identity and tracking, descriptions and coordinates, photo references, reporter identity where applicable, AI screening results and state, verification state, lifecycle status, administrative review and timestamps.

Detailed tables, columns, constraints, indexes and relationships belong in BACKEND_SCHEMA.md.

### 5.3 Server-side operations

Supabase Edge Functions should be used where trusted execution is required, such as secure submission coordination, invoking AI inference without exposing protected credentials, validating privileged operations and handling administrative actions.

Not every database operation needs an Edge Function. Direct client access is acceptable where RLS and database constraints make the operation safe.

### 5.4 Secrets

- Never commit service-role keys, AI provider credentials or other secrets.
- Never expose privileged credentials through frontend environment variables.
- Store server-side secrets using the deployment platform's secret-management facilities.
- Use separate configuration for development and deployment.
- Do not store credentials in public reports, logs or MEMORY documentation.

---

## 6. Database Access and Authorization

### 6.1 Row Level Security

Row Level Security (RLS) must be enabled and correctly configured for tables accessible through Supabase's client-facing APIs.

Policies must ensure that:

- Public visitors can read only information intended for public display.
- Public users cannot modify report status or administrative review fields.
- Registered users can access only account-specific information they are authorized to access.
- Anonymous tracking does not grant unrestricted access to reports.
- Administrative operations require verified administrative authorization.
- Users cannot elevate their own privileges by modifying client requests.

### 6.2 Anonymous submissions

Support anonymous reporting without unrestricted database write access. Issue a sufficiently unpredictable tracking code that is not derived from sequential database IDs. If the code grants access to private tracking information, treat it as a secret capability and protect it accordingly.

### 6.3 Administrative privileges and data minimization

Admin privileges must be assigned through trusted configuration or controlled role assignment and checked by database or trusted server-side logic. The frontend must not be able to grant itself admin access.

Store only personal and technical information needed for the MVP. Private account details, authentication credentials and internal administrative information must not be exposed in public report responses.

---

## 7. Photograph and File Storage

Supabase Storage is the proposed photo-storage service. The implementation must define allowed image formats, maximum upload size, file validation, storage paths, access permissions, failed-upload handling and cleanup of abandoned uploads where practical.

Do not rely only on filenames or browser-provided MIME types to validate images. Use appropriate server-side checks and avoid processing unsupported or unexpectedly large files.

### 7.1 Photo visibility and privacy

The PRD warns that publicly visible photographs may contain identifying details. Before submission, users must be informed if photographs will be publicly accessible.

The final implementation must choose whether original photographs are public, restricted, or transformed into a separate public derivative. A public report does not automatically require unrestricted access to every stored file. Enforce the chosen policy through storage permissions and application logic.

Automatic privacy blurring is outside the MVP unless added later. Image resizing or compression may be used if it improves performance without undermining model performance.

---

## 8. AI Screening Requirements

### 8.1 Purpose and model selection

AI screening must use an actual image-analysis model to examine submitted road photographs and suggest relevant road-damage categories. It is a screening aid and does not independently verify that a report is genuine or guarantee a correct assessment.

Evaluate suitable pretrained/open-source computer-vision models before selecting one. Consider:

- Supported road-damage categories and performance on potholes and other in-scope damage.
- Detection versus image-classification capabilities.
- Model and dependency licenses.
- Runtime, memory and inference-speed requirements.
- Local or free-hosted execution feasibility.
- Integration effort and performance on representative test photographs.

A road-damage detection model is the first category to evaluate. A general-purpose vision model may be used for comparison. No specific model, weights file, provider or accuracy level is selected by this document.

### 8.2 Detection versus classification

The model's real capability must determine how results are represented. Object detection may return damage regions, bounding boxes and class scores; image classification may return category scores for the whole image. Do not claim localization if the model only classifies an image.

### 8.3 Output and uncertainty

Where supported, the screening result should contain:

- Screening status.
- Suggested damage category.
- Model confidence or score.
- Detection regions, if supported.
- Model identifier/version and processing timestamp.
- Error or uncertainty information when applicable.

The exact output schema will be finalized with the database schema and model selection. Confidence values must not automatically be interpreted as calibrated probabilities; thresholds must be chosen through testing.

When a result is uncertain, unsupported, invalid or unavailable, record an appropriate screening state and flag the report for manual review. Do not reject a report solely because AI screening failed.

### 8.4 Severity estimation

Severity estimation is conditional. Include it only if the model or a separately justified method supports it and evaluation shows that the result is useful. Do not present unsupported severity scores as reliable real-world measurements.

### 8.5 Inference execution and failures

Evaluate two approaches:

- **Local inference:** Uses available hardware and avoids a paid inference API, but the machine and model process must remain available.
- **Free hosted inference:** Suitable only if current terms, quotas, hardware and runtime limits support the MVP. Free compute may sleep, throttle or become unavailable.

Do not assume a computer-vision model can run directly inside Supabase Edge Functions. Edge Functions may coordinate requests to a suitable inference runtime; model memory and execution requirements must be checked separately.

Handle timeouts, runtime unavailability, invalid model responses, unreadable images, low-confidence results, rate limits, quota exhaustion and failed result persistence. AI screening must not block report acceptance. Preserve the report and mark screening as pending, failed or requiring manual review as appropriate.

---

## 9. Mapping and Geolocation

### 9.1 Map library and tile provider

Use Leaflet for map display, marker interaction and navigation. Leaflet does not supply map tiles itself. Select a compatible tile provider and comply with attribution, usage and caching rules. The standard OpenStreetMap tile servers must not be treated as unlimited or guaranteed free tile hosting. The final provider remains open.

### 9.2 Location capture

Support browser geolocation with a manual map-selection fallback. Permission may be denied, unavailable or inaccurate, so users should be able to correct the location where practical. Validate latitude and longitude ranges and handle missing or invalid coordinates.

### 9.3 Public map

The public map must display eligible reports at stored coordinates, show verification and lifecycle status, provide public report details, avoid exposing private reporter information and handle empty states or map-data failures. Advanced filtering must remain within the MVP's practical time and complexity limits.

---

## 10. Reliability and Outage Handling

### 10.1 Supabase dependency

Supabase is the sole backend platform. If Supabase or a required Supabase service is unavailable, dependent operations may fail. The architecture has no independent fallback database or second backend.

### 10.2 Graceful degradation

- Previously loaded data may remain visible if safely cached.
- Do not show a new report as submitted until the backend confirms it.
- Failed uploads must not produce false submission confirmations.
- AI failure must not automatically discard an otherwise valid report.
- Database and authentication failures must produce understandable messages.
- Retries must avoid creating duplicate reports.

### 10.3 Optional offline queue

A local retry queue is optional for the MVP; a full offline-first application is not required. If implemented, queued reports must be clearly marked as not submitted, input must be preserved safely until retry or discard, photo/browser storage limits must be handled, duplicate creation must be prevented where possible, and submission must be confirmed only after backend acknowledgement. Explain what happens if local data is cleared or the browser closes.

A local queue does not replace a second backend and cannot guarantee submission while Supabase is unavailable.

### 10.4 Timeouts and retries

Use appropriate timeouts and bounded retries for network-dependent operations. Retried operations must not create duplicate reports or consume unnecessary AI resources. Use idempotency or an equivalent duplicate-prevention mechanism where appropriate.

---

## 11. Security and Privacy Requirements

The application must:

- Enforce authorization at the backend/database, not only in the UI.
- Protect privileged credentials.
- Validate uploaded files and user-supplied values.
- Restrict administrative operations.
- Prevent unauthorized modification of report status and verification state.
- Avoid exposing private account data through public APIs.
- Inform users about public photo visibility.
- Avoid logging passwords, tokens, tracking secrets or unnecessary personal data.
- Use HTTPS in deployed environments.
- Apply reasonable request and upload limits where supported.
- Avoid exposing secrets or internal stack traces in public errors.

Test security-sensitive behavior using authorized and unauthorized scenarios.

---

## 12. Performance and Resource Constraints

Optimize for a small hackathon demonstration rather than large-scale production. Consider mobile upload performance, image size, database query efficiency, pagination or limits for public reports, map rendering as markers increase, inference latency, service quotas, function limits and external service availability.

Set measurable performance targets after architecture and model evaluation. Do not claim response times until measured.

---

## 13. Testing and Verification

### 13.1 Frontend tests

Verify required-field validation, photo selection and upload errors, denied location permission and manual selection, submission success/failure, map and report-detail access, mobile/desktop responsiveness, and loading/empty/error states.

### 13.2 Backend and security tests

Verify anonymous submission, authentication, RLS restrictions, protection of other users' private information, denial of admin actions to non-admins, rejection of invalid coordinates and malformed inputs, storage permissions, upload validation and resistance to guessable tracking codes.

### 13.3 AI tests

Evaluate representative photographs containing clear potholes, other road damage, undamaged roads, ambiguous images, poor lighting/image quality and unrelated scenes.

Record category-level performance and notable failures. For a detection model, evaluate localization where appropriate. Keep the test set separate from training/tuning data where practical and document model limitations.

### 13.4 Failure and integration tests

Test AI timeout/unavailability, invalid AI output, failed photo upload, database submission errors, retries, expired/missing sessions, missing map tiles and the distinction between pending and completed submissions.

### 13.5 Acceptance evidence

Mark a feature verified only after implementation inspection or testing. Record relevant code, tests and observed results. A requirement in the PRD or TRD is not evidence that the feature is operational.

---

## 14. Development, Deployment and Cost

### 14.1 Free-first constraint

Target a zero-cost development and demo path where practical. Check current service terms and quotas before relying on them; free tiers may change, impose limits or become unavailable. ₹0 is a budget objective, not a guarantee of unlimited or uninterrupted service.

### 14.2 Deployment components

Expected components are React frontend hosting, a Supabase project, database and authentication configuration, Storage buckets and policies, Edge Functions where required, the selected inference runtime and the selected tile provider. The frontend host, inference runtime and tile provider remain open decisions.

### 14.3 Environment configuration and reproducibility

Document required environment variables and deployment settings. Use example configuration files without real secrets; supply production credentials through secure platform configuration.

Implementation documentation must explain dependency installation, local configuration, Supabase connection, schema and policy setup, Storage and function configuration, AI setup, tests, build and deployment. Exact commands will be documented once the implementation exists.

### 14.4 Dependency and license review

Before selecting the model, inspect model-weight and software dependency licenses. Record attribution, redistribution restrictions and conditions affecting the demo or future distribution.

---

## 15. Technical Decisions and Open Questions

### 15.1 Current approved direction

- React frontend.
- Supabase as the sole backend platform for the MVP.
- Supabase PostgreSQL database.
- Supabase Auth with email/password first.
- Supabase Storage as the proposed photo-storage service.
- Supabase Edge Functions where trusted server-side execution is required.
- Leaflet for mapping.
- Evaluation of actual pretrained/open-source computer-vision models.
- Free-first development and demonstration.

### 15.2 Open decisions

1. Which AI model performs sufficiently well on representative road photographs?
2. Where will inference run: locally or on suitable free hosted compute?
3. What are the model's licensing, hardware and runtime requirements?
4. Which frontend hosting provider will be used?
5. Which Leaflet tile provider will be used?
6. Will original photographs be public or restricted?
7. What upload size and image formats will be permitted?
8. Which AI confidence thresholds, if any, are justified by testing?
9. Will a local retry queue be included in the MVP?
10. What performance targets are appropriate for the demo?

### 15.3 Change control

Record the reason and consequences of technical decision changes in the private Notion MEMORY page. Update relevant repository documentation after approval. Do not silently treat proposed technologies as implemented or claim testing without evidence.

---

## 16. Definition of Technical Readiness

The technical design is ready for implementation planning when:

- The core architecture is agreed.
- Database entities and access boundaries are defined.
- Anonymous and registered reporting paths are understood.
- A candidate AI model and feasible inference strategy are identified.
- Photo-storage and public-access rules are defined.
- Mapping and hosting dependencies are selected or evaluation criteria are documented.
- Failure handling and testing requirements are clear.
- Remaining uncertainties have explicit next steps.

The MVP is technically verified only after implemented report-submission, AI-screening, mapping and administrative-review flows have been tested against the acceptance criteria in PRD.md.

---

**Approval status:** The project owner approved this TRD draft on October 21, 2026. This approval authorizes creation of the document; it does not indicate that the described features have been implemented or verified.
