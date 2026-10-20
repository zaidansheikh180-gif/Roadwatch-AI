# RoadWatch AI — Implementation Plan

**Version:** 0.2 — Revised Draft  
**Last Updated:** October 21, 2026  
**Status:** Approved for implementation planning  
**Repository:** [zaidansheikh180-gif/Roadwatch-AI](https://github.com/zaidansheikh180-gif/Roadwatch-AI)

**Related Documents:** [PRD.md](./PRD.md) · [TRD.md](./TRD.md) · [APP_FLOW.md](./APP_FLOW.md) · [UI_UX_BRIEF.md](./UI_UX_BRIEF.md) · [BACKEND_SCHEMA.md](./BACKEND_SCHEMA.md)

---

## 1. Objective

Build a functional RoadWatch AI application as quickly as possible, with the essential features needed to demonstrate a complete road-damage reporting workflow.

The project follows two stages:

1. **Stage 1 — Working MVP:** Build, connect, test, and deploy a usable application with the essential features working end-to-end.
2. **Stage 2 — Production Readiness:** After the MVP works reliably, improve security, scalability, reliability, monitoring, AI quality, and operational maturity.

The immediate objective is not to build every possible feature or a production-scale civic platform. It is to deliver a working application that demonstrates the core idea convincingly.

**Core principle: Build the smallest complete application first. Expand only after it works.**

This plan describes intended work. It does not claim that any unimplemented feature has already been built or tested.

## 2. Stage 1 — Working MVP

### 2.1 Essential features

The MVP must support this complete workflow:

**Submit a report → Save it → Display it on the map → Review it → Update its status.**

| Feature | Minimum required behavior |
|---|---|
| Report submission | Accept a road-damage photograph, location, and optional description |
| Backend persistence | Save the report and its relevant metadata |
| Public map | Display eligible saved reports at their submitted locations |
| Report details | Show the photograph, location, report date, and permitted status information |
| AI screening | Attempt genuine AI screening when a workable model is available |
| Admin review | Allow authorized administrators to review reports and update permitted statuses |
| Basic tracking | Allow anonymous reporters to track their reports securely; support personal history for registered users if required by the approved MVP scope |
| Sample data | Provide clearly labeled sample reports so the demonstration does not depend on live submissions |
| Responsive UI | Make the core workflow usable on mobile and desktop |
| Error handling | Display accurate loading, success, and failure states |

### 2.2 Essential safeguards

These safeguards are part of the MVP, not optional production enhancements:

- Admin permissions must be enforced by the backend.
- Users must not be able to access another user's private tracking information.
- Public responses must not expose private credentials, tracking-token hashes, or internal administrative notes.
- Image uploads and submitted data must receive server-side validation.
- A report must not be shown as successfully submitted until the backend confirms its creation.
- AI failure must not prevent an otherwise valid report from being accepted.
- AI suggestions must not be presented as official verification.
- Photograph visibility must be disclosed clearly to users.
- Secrets must not be committed to GitHub or exposed in browser code.

### 2.3 Features to defer

Do not delay the working MVP for:

- Advanced analytics and reporting dashboards.
- Automated duplicate detection.
- Repair verification using before-and-after photographs.
- Custom AI model training.
- Complex notification systems.
- Municipal API integrations.
- Multi-city production infrastructure.
- Advanced account-management features.
- Extensive animations and decorative UI effects.
- High-availability infrastructure and complex deployment automation.

Reconsider deferred features only after the MVP works or when an actual hackathon requirement makes one necessary.

## 3. Fastest Practical Implementation Order

### Phase 1 — Start the application

**Goal:** Get a running frontend connected to the intended backend as early as possible.

- [ ] Confirm the existing repository structure and current implementation state.
- [ ] Set up React with the selected build tool; Vite is the proposed baseline.
- [ ] Configure the development environment and required environment variables.
- [ ] Set up or verify the Supabase project.
- [ ] Create the basic layout and navigation.
- [ ] Add the minimum pages for reporting, map exploration, report details, and administration.
- [ ] Verify that the app starts and builds successfully.

**Completion gate:** The application runs locally and can communicate with the development backend.

Avoid spending days polishing the interface before the application can save and retrieve data.

### Phase 2 — Build the report submission and storage flow

**Goal:** Make report submission genuinely work.

- [ ] Implement the minimum required database schema using version-controlled migrations.
- [ ] Configure essential row-level security and access rules.
- [ ] Configure photograph storage and upload validation.
- [ ] Build the report submission form.
- [ ] Accept a photograph and location, with an optional description.
- [ ] Save the report and return confirmation only after successful creation.
- [ ] Display the initial lifecycle status as `Submitted`.
- [ ] Display the initial verification status as `Unverified`.
- [ ] Implement the minimum safe anonymous tracking mechanism.
- [ ] Handle upload, validation, and database errors.

**Completion gate:** A tester can submit a report and verify that its data and photograph are actually saved. Failed submissions display errors rather than false success messages.

This is the first major milestone. Until it works, prioritize fixing the submission flow over building secondary features.

### Phase 3 — Build the public map

**Goal:** Make saved reports visible and useful.

- [ ] Integrate Leaflet.
- [ ] Retrieve eligible public reports from the backend.
- [ ] Display markers using saved coordinates.
- [ ] Show report details when a marker is selected.
- [ ] Display the photograph and permitted report information.
- [ ] Clearly distinguish sample reports from genuine test submissions.
- [ ] Add basic loading, empty, and error states.
- [ ] Ensure the map works on mobile screens.

**Completion gate:** A successfully saved report appears on the map and opens the correct details.

Use a suitable map tile provider and confirm its usage requirements. Do not spend time implementing advanced mapping features before basic markers and report details work.

### Phase 4 — Implement administrator review

**Goal:** Complete the core workflow from reporting to review.

- [ ] Set up the minimum administrator role and assignment process.
- [ ] Protect the review interface.
- [ ] Enforce administrator permissions on backend operations.
- [ ] Display submitted reports in a review queue.
- [ ] Allow administrators to inspect photographs and available AI results.
- [ ] Implement the approved status changes.
- [ ] Save changes to the backend.
- [ ] Record important review and status changes.
- [ ] Show confirmation only after a change is saved successfully.

**Completion gate:** An authorized administrator can review a report and update its status. An ordinary user cannot perform administrative actions, including by directly calling the backend.

At this point, the app should already demonstrate its central civic reporting workflow, even if AI screening has not yet been integrated.

### Phase 5 — Integrate AI screening

**Goal:** Add genuine AI functionality without making the rest of the app dependent on it.

- [ ] Evaluate suitable pretrained road-damage detection models.
- [ ] Check model licensing, supported categories, inference requirements, and feasibility.
- [ ] Select a model and an execution environment that can be tested within the available time.
- [ ] Connect inference to the report workflow.
- [ ] Store the actual screening outcome and relevant model output.
- [ ] Show the suggested damage category when supported.
- [ ] Show severity only if the selected method supports it and testing justifies the estimate.
- [ ] Represent uncertain, failed, and unavailable outcomes honestly.
- [ ] Test representative damage and non-damage images.

**Completion gate:** The application displays real model output when inference succeeds and handles failure without losing an accepted report.

If integrating a reliable model takes too long, keep AI clearly marked as unavailable until genuine inference works. Do not substitute fabricated predictions or hardcoded results and present them as AI output.

AI research may happen in parallel with the earlier phases if team capacity allows.

### Phase 6 — Complete minimum user journeys

**Goal:** Ensure both anonymous and registered users can use the application as intended.

- [ ] Implement email/password authentication if required by the approved MVP.
- [ ] Provide a basic personal report history for signed-in citizens.
- [ ] Complete anonymous report tracking with a secret tracking token.
- [ ] Ensure tracking credentials are never exposed in public map responses.
- [ ] Test access restrictions and session handling.
- [ ] Keep public map browsing and anonymous reporting accessible without sign-in.

**Completion gate:** Anonymous and registered users can complete their intended journeys without accessing one another's private information.

Do not build elaborate profile pages or account features unless they are necessary for the core workflow.

### Phase 7 — Connect, test, and deploy

**Goal:** Deliver a working application that can be demonstrated from a deployed environment.

- [ ] Test the full workflow from report submission to map display to administrator review.
- [ ] Test failed uploads, database errors, and AI timeouts.
- [ ] Verify admin restrictions and report ownership rules.
- [ ] Check mobile and desktop usability.
- [ ] Fix critical UI and functional errors.
- [ ] Configure the selected hosting provider and environment variables.
- [ ] Apply and verify database migrations in the target environment.
- [ ] Deploy the application.
- [ ] Test the deployed application using a separate browser session and a mobile device.
- [ ] Prepare labeled sample reports and a short demonstration sequence.
- [ ] Document setup instructions and known limitations in the README.

**Completion gate:** The deployed app completes its essential workflow, handles critical failure cases, and can be demonstrated without relying on unverified assumptions.

## 4. Definition of a Working MVP

Stage 1 is complete when all the following are true:

- [ ] The application is deployed and accessible.
- [ ] A user can submit a road-damage photograph and location.
- [ ] The backend actually saves the report.
- [ ] The report appears on the public map.
- [ ] The report details display correctly.
- [ ] An administrator can review the report and update its status.
- [ ] Unauthorized users cannot perform administrator operations.
- [ ] Basic report tracking works securely.
- [ ] AI screening works with genuine inference, or its unavailable state is clearly communicated.
- [ ] AI failure does not break report submission.
- [ ] Sample data is clearly labeled.
- [ ] Core mobile and desktop interactions work.
- [ ] Essential privacy, authorization, and error-handling checks pass.

A screen that looks finished but uses nonfunctional buttons, fabricated data, or disconnected backend operations does not count as a completed feature.

## 5. Stage 2 — Production Readiness

Begin this stage only after the MVP is working end-to-end and its limitations are documented.

Potential work includes:

### Security and privacy
- Stronger abuse prevention and rate limiting.
- More extensive authorization testing and security review.
- Improved image privacy and moderation controls.
- Account deletion and retention workflows.
- Audit-log hardening and sensitive-data review.

### Reliability and performance
- Automated integration and end-to-end testing.
- Monitoring, error reporting, and alerting.
- Database and map-query performance improvements.
- Backup and recovery procedures.
- Retry policies and resilience for external services.

### AI quality
- Evaluation on representative, locally relevant road-damage images.
- Measured precision, recall, and category-level performance where appropriate.
- Better uncertainty handling and model monitoring.
- Versioned model deployments and regression tests.
- Human review processes for uncertain predictions.

### Operational maturity
- Automated build, test, and deployment workflows.
- Separate development, staging, and production environments.
- Documented incident response and maintenance procedures.
- Capacity, cost, and scaling reviews.
- Municipal integration and advanced features when justified.

These are future workstreams, not prerequisites for getting the MVP running. Production readiness must be established through implementation and testing, not merely by completing documentation.

## 6. Execution Rules

1. **Prioritize working software.** Choose implementation tasks by how directly they advance the complete MVP workflow.
2. **Build end-to-end.** Prefer one connected, tested feature over several unfinished screens.
3. **Use the simplest suitable tools.** Avoid unnecessary frameworks, services, and abstractions.
4. **Make decisions quickly.** Resolve blocking technical choices with small tests rather than prolonged research.
5. **Preserve essential safeguards.** Speed is not a reason to expose credentials, bypass authorization, or mislead users.
6. **Deploy early enough to test reality.** Local success alone does not establish that the deployed app works.
7. **Defer production hardening, not core correctness.**
8. **Verify before claiming completion.** Record whether work is planned, implemented, tested, or verified.
9. **Update progress as work happens.** Keep `PROGRESS.md` and the private Notion MEMORY aligned with verified project state.
10. **Protect the demo deadline.** Once the essential workflow works, avoid adding features that could destabilize it before the demonstration.

## 7. Final Strategy

**First:** Build a small, connected, deployed application that proves the idea.

**Then:** Test it, demonstrate it, and identify actual weaknesses.

**Finally:** Invest in production-grade reliability, security, AI quality, scalability, and operational maturity based on evidence from the working MVP.

The success criterion for the immediate stage is not the number of features or documents completed. It is whether RoadWatch AI works end-to-end for a real test user.