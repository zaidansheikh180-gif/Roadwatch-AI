# RoadWatch AI — System Architecture

**Version:** 0.1 — Draft for Review  
**Last Updated:** October 21, 2026  
**Status:** Proposed architecture for MVP; implementation not yet verified  
**Repository:** [zaidansheikh180-gif/Roadwatch-AI](https://github.com/zaidansheikh180-gif/Roadwatch-AI)

**Related Documents:** [PRD.md](./PRD.md) · [TRD.md](./TRD.md) · [APP_FLOW.md](./APP_FLOW.md) · [BACKEND_SCHEMA.md](./BACKEND_SCHEMA.md) · [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## 1. Purpose

This document defines the proposed system architecture for RoadWatch AI, including its main components, responsibilities, data flows, security boundaries, and failure-handling rules.

The architecture is designed around one priority: deliver a working hackathon MVP as quickly as practical, then improve it toward production readiness.

This document describes the intended design. It does not claim that any component has already been implemented, deployed, or tested.

## 2. Architectural Principles

1. **Build the smallest complete system.** Implement the end-to-end reporting workflow before adding secondary features.
2. **Use one primary backend platform.** Supabase provides authentication, PostgreSQL, file storage, and trusted server-side operations.
3. **Keep the frontend unprivileged.** Browser code must never contain service-role credentials or other privileged secrets.
4. **Enforce permissions on the backend.** Hiding a page or button is not authorization.
5. **Separate AI screening from report acceptance.** AI may be unavailable or uncertain without invalidating an otherwise valid report.
6. **Separate report states.** Lifecycle status, verification status, and AI screening status represent different things.
7. **Protect private data.** Public map responses must not expose tracking credentials, account details, or internal administrative notes.
8. **Make failures visible.** The interface must distinguish a confirmed save from an upload failure, pending operation, or uncertain result.
9. **Avoid premature infrastructure.** Do not introduce microservices, a separate application backend, or complex deployment infrastructure without a demonstrated need.
10. **Verify before claiming completion.** Architecture decisions become verified only when supported by implementation and test evidence.

## 3. High-Level Architecture

```text
                         CITIZENS / ADMINISTRATORS
                                    |
                                    v
                       React Responsive Web App
                         (Vite is proposed)
                                    |
                      Supabase client / HTTPS
                                    |
                   +----------------+----------------+
                   |                |                |
                   v                v                v
             Supabase Auth    PostgreSQL       Supabase Storage
             User sessions    Report data      Report photographs
             User identity    AI results       Protected file access
             Authentication   Status history
                   |                ^
                   |                |
                   +--------+-------+
                            |
                            v
                   Supabase Edge Functions
                   Trusted operations where needed
                            |
                            v
                     AI Inference Runtime
                     Pretrained model
                     Local or hosted execution
```

The diagram shows logical relationships, not a finalized deployment topology. The exact AI execution environment and hosting providers remain open decisions.

### 3.1 Main components

| Component | Responsibility | Decision status |
|---|---|---|
| React frontend | Reporting form, public map, tracking, account views, admin interface | Preferred baseline |
| Vite | Frontend development server and build tooling | Proposed |
| Supabase Auth | User registration, login, sessions, identity | Approved direction |
| Supabase PostgreSQL | Reports, screening attempts, roles, reviews, status history | Approved direction |
| Supabase Storage | Store submitted photographs | Proposed |
| Supabase Edge Functions | Trusted operations, protected lookups, authorization-sensitive workflows, and service coordination | Proposed where required |
| Leaflet | Interactive map and report markers | Approved direction |
| Map tile provider | Supplies map imagery | Open decision |
| AI inference runtime | Runs the selected road-damage model | Open decision |
| Frontend hosting | Serves the web application | Open decision |

Supabase remains the primary application backend. The AI runtime may be external because model inference can require a different execution environment; it must not become a second general-purpose application backend.

## 4. Component Responsibilities

### 4.1 Frontend

The frontend is responsible for:

- Displaying the reporting, map, tracking, account, and administrative screens.
- Collecting a photograph, location, and optional description.
- Performing immediate usability validation.
- Requesting browser geolocation when the user permits it.
- Providing manual location selection when geolocation is unavailable.
- Showing submission progress and backend-confirmed results.
- Displaying public report information and permitted tracking information.
- Communicating AI uncertainty and failures clearly.
- Presenting an administrative interface only to authorized users.

Frontend validation is for usability. All security-sensitive validation and permission checks must also be performed by trusted backend components.

### 4.2 Supabase Auth

Supabase Auth manages registered-user identity and sessions.

The initial authentication direction is email/password. Anonymous reporting must remain available without requiring account creation.

A registered user's report history must be restricted to that user's permitted records. Administrative access must be granted through a trusted role mechanism and enforced on every protected operation.

### 4.3 PostgreSQL Database

PostgreSQL is the source of truth for report records and their current saved states.

The proposed data model is defined in `BACKEND_SCHEMA.md` and includes:

- `reports` — primary report information, location, photo reference, and current states.
- `ai_screenings` — individual AI screening attempts and their actual results.
- `user_roles` — application roles, including administrative access.
- `report_status_history` — history of lifecycle and verification changes.
- `report_reviews` — administrative decisions, corrections, and review details.

The database must enforce relevant constraints and access policies. The frontend must not be treated as the authority for a report's status or the identity of an administrator.

### 4.4 Photograph Storage

Supabase Storage is the proposed service for submitted photographs.

The storage design must define:

- Which uploads are permitted.
- Which users or trusted operations may upload and access files.
- How file type, size, and actual content are validated.
- How a stored image is associated with a report.
- Whether public report photographs are served through a public bucket or a controlled-access mechanism.
- How failed submissions and abandoned uploads are handled.

The product currently intends to display photographs alongside public reports. Reporters must be informed of this visibility before submission. The exact storage access policy must be finalized before implementation; a public photograph URL must not accidentally expose unrelated private files.

### 4.5 Supabase Edge Functions

Use Edge Functions only where a trusted server-side boundary is needed, such as:

- Creating reports through a controlled submission workflow.
- Validating anonymous tracking credentials.
- Performing authorization-sensitive administrative operations.
- Coordinating AI screening requests.
- Returning a restricted public or reporter-specific data view.

Not every frontend request requires a separate function. Use PostgreSQL access policies and the Supabase client directly where they provide the required security and behavior.

Never expose service-role keys or other privileged credentials to the browser.

### 4.6 AI Inference Runtime

The AI runtime analyzes a submitted photograph using a suitable pretrained road-damage model.

Its responsibilities are limited to:

- Receiving an authorized screening request.
- Running the selected model.
- Returning only predictions and confidence information actually supported by the model.
- Reporting processing failures and unsupported results.
- Allowing the application to record the screening attempt and its outcome.

The model, inference provider, request format, execution limits, and supported prediction categories have not yet been finalized.

AI output is a suggestion, not official verification. A confidence value must not be presented as a guaranteed probability of correctness unless that interpretation is justified.

## 5. Core Data Flow: Submit a Report

The intended submission flow is:

1. The reporter selects a photograph and chooses a location.
2. The frontend validates required inputs and displays the photo and location preview.
3. The frontend explains the relevant photograph and location visibility policy.
4. The submission reaches the backend through the approved upload and report-creation workflow.
5. The photograph is validated and stored, and the report record is created with its initial states.
6. Anonymous tracking credentials, when required, are generated and handled through a trusted process.
7. The backend confirms that the report was successfully created.
8. The frontend displays confirmation and the anonymous tracking code when applicable.
9. AI screening runs when available. Its outcome is stored separately from the report's lifecycle and verification states.
10. Eligible report information becomes available through the public map query.

**Success rule:** The application must not show a report as successfully submitted until the backend confirms its creation. A file upload alone is not a successful report.

The implementation must handle partial failures. For example, if the photograph uploads but report creation fails, the system must not silently treat the operation as complete. Any retry or cleanup behavior must be explicit and tested.

## 6. Core Data Flow: AI Screening

AI screening must not be a prerequisite for accepting a valid report.

1. A valid report is created.
2. The backend records or initiates a screening attempt.
3. The inference runtime receives the authorized image input.
4. The runtime returns supported predictions, uncertainty information, or a failure.
5. The backend records the actual outcome.
6. The interface displays the screening state and any supported suggestions.
7. Reports with failed, uncertain, or unsupported screening results remain available for appropriate manual review.

The implementation may run screening immediately or asynchronously, depending on the selected model runtime and available execution environment. This decision should favor the simplest reliable approach that does not block report acceptance.

The application must never invent an AI result when the model has not produced one.

## 7. Core Data Flow: Public Map

1. The frontend loads eligible public reports from the backend.
2. The backend returns only fields approved for public display.
3. Leaflet places markers using the saved coordinates.
4. Selecting a marker opens a report detail view.
5. The detail view displays permitted information such as the photograph, location, submission date, lifecycle status, verification state, and available AI screening result.
6. Sample records are visibly distinguishable from genuine test submissions.

The public query must not expose anonymous tracking-token hashes, private account information, privileged role data, or internal administrative notes.

The map tile provider and its usage requirements must be checked before deployment. Leaflet provides the map interface; it does not itself supply a map tile service.

## 8. Core Data Flow: Administrative Review

1. An administrator authenticates through Supabase Auth.
2. The frontend requests access to the review queue.
3. The backend verifies the user's administrative role.
4. The administrator inspects the photograph, location, description, and available AI suggestions.
5. The administrator may correct supported classifications or update permitted report states.
6. The backend validates and persists the decision.
7. Relevant status history and review records are recorded.
8. Reporters see the updated permitted status through secure tracking or their account history.

Administrative access must be enforced on every protected data operation, not only when loading the admin screen. Ordinary users must not be able to assign themselves an administrative role or modify another user's report through direct API requests.

## 9. Security and Privacy Boundaries

The following controls are required from the MVP stage.

### 9.1 Authentication and authorization

- Use Supabase Auth for registered-user identity.
- Enforce row-level security and backend authorization where applicable.
- Keep administrative role assignment under trusted control.
- Restrict registered-user report history to authorized records.
- Protect anonymous tracking through a secret tracking credential, not a public report ID alone.
- Rate-limit sensitive operations where the selected implementation supports it.

### 9.2 Data exposure

- Public responses must contain only approved public fields.
- Never return tracking secrets or their stored hashes to public clients.
- Keep internal review notes and privileged information out of public report responses.
- Avoid placing tracking credentials in public URLs, logs, or analytics events.
- Disclose that submitted photographs may be publicly visible.

### 9.3 Input and file validation

- Validate coordinates and text lengths on the backend.
- Validate image type, size, and content rather than trusting filename extensions.
- Restrict upload paths and permissions.
- Do not allow client-supplied fields to grant administrative privileges or mark a report as officially verified.
- Keep secrets out of source control and browser bundles.

Exact file-size limits, accepted formats, tracking-code lifecycle, rate limits, and final storage policies remain implementation decisions.

## 10. Failure Handling

| Failure | Required behavior |
|---|---|
| Invalid submission | Explain the validation error and allow correction |
| Geolocation unavailable or denied | Allow manual location selection |
| Image upload fails | Do not report successful submission |
| Report creation fails | Show failure and allow a safe retry |
| Upload succeeds but report creation fails | Treat as incomplete; use an explicit cleanup or recovery approach |
| AI runtime is unavailable | Preserve the report and record screening failure or unavailability |
| AI output is uncertain | Preserve the uncertainty; allow manual review |
| Public report query fails | Show a clear map error and retry option |
| Tracking code is invalid | Show a generic error without exposing unrelated report data |
| User lacks administrative access | Deny the protected operation on the backend |
| Status update fails | Keep the previously saved state visible and explain that the change was not confirmed |

The interface must reflect the backend's actual outcome. Optimistic UI updates must not be presented as confirmed saved changes.

## 11. Deployment Model

The proposed deployment consists of:

- A hosted React frontend.
- A Supabase project for authentication, database, storage, and any required Edge Functions.
- An AI inference runtime selected after evaluating suitable models and free-first hosting options.
- A compatible map tile provider.

The frontend hosting provider, AI execution environment, and map tile provider remain open decisions.

Keep local credentials in untracked environment files and provide an example environment file after the required variables are established. Privileged backend secrets must remain in trusted server-side configuration.

Development, demonstration, and production-like environments should be separated where practical. Database migrations and access policies must be version-controlled before the application is treated as reproducible.

## 12. Testing and Verification

Architecture is not verified merely because its diagram and documentation exist.

The implementation should verify the following:

- A valid report and photograph are actually saved.
- Invalid submissions are rejected safely.
- Failed report creation does not show false success.
- A saved report appears at the correct location on the public map.
- Public queries exclude private fields.
- Anonymous tracking cannot be performed using a public report ID alone.
- Registered users cannot access another user's private report history.
- Non-administrators cannot perform administrative operations, including through direct requests.
- AI failure does not invalidate an otherwise accepted report.
- AI results, verification state, and lifecycle status remain distinct.
- Report status changes are persisted and reflected in permitted user views.
- Essential journeys work on mobile and desktop.

Record test evidence in `PROGRESS.md` as implementation begins. Do not mark a component as verified until the relevant checks have passed.

## 13. Decisions Still Open

The following decisions must be resolved during implementation or model evaluation:

1. Whether Vite is finalized as the React build tool.
2. The exact Edge Functions needed for the minimum secure workflow.
3. The photograph storage access model and final public-media policy.
4. Accepted image formats, maximum file size, and server-side image validation.
5. Anonymous tracking-code generation, storage, expiration, and rate limiting.
6. The pretrained AI model, supported classes, confidence interpretation, and inference runtime.
7. Whether AI screening runs synchronously or asynchronously in the first implementation.
8. The map tile provider and applicable usage limits.
9. The frontend hosting provider and environment configuration.
10. Cleanup or recovery behavior for incomplete submissions and abandoned uploads.

Resolve these decisions only as far as necessary to build and safely demonstrate the working MVP. Avoid blocking implementation on choices that can be deferred without compromising core correctness or security.

## 14. Implementation Order

Follow the MVP-first sequence defined in `IMPLEMENTATION_PLAN.md`:

1. Establish the frontend and connect it to the development Supabase project.
2. Implement and test report creation, photograph storage, and essential access policies.
3. Display persisted reports on the public map and detail view.
4. Implement secure tracking and the minimum required account flows.
5. Implement the protected administrative review and status-update workflow.
6. Integrate genuine AI screening without making submission dependent on AI availability.
7. Test the complete end-to-end workflow and deploy the demonstration.
8. Improve production readiness only after the working MVP has been demonstrated.

**Definition of architectural success:** A citizen can submit a road-damage report, the backend saves it, the report appears on the map, an authorized administrator can review it and update its status, and the application reports failures honestly. AI screening should work when available but must not prevent the core workflow from completing.

---

**Implementation boundary:** This document defines the intended architecture. It does not establish that application code, database migrations, access policies, AI inference, or deployment already exist or have passed testing.