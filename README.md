# RoadWatch AI

**AI-assisted road-damage reporting and civic visibility.**

RoadWatch AI is a responsive web application concept that helps citizens report damaged roads using photographs and location data. It aims to make reports easier to explore on a public map and provides an administrative workflow for reviewing submissions and updating their statuses.

**Project status:** Documentation and implementation planning. The working application has not yet been verified as implemented.

## Project Goals

- Make road-damage reporting straightforward.
- Allow users to submit a photograph and location.
- Use AI to screen submitted images and suggest damage classifications where supported.
- Display eligible reports on an interactive public map.
- Give administrators a way to review reports and update their statuses.
- Build a working MVP first, then improve it toward production readiness.

## Planned MVP Features

| Feature | Purpose |
|---|---|
| Road-damage reporting | Submit a photograph, location, and optional description |
| Report storage | Persist reports and their metadata |
| Public map | Explore eligible reports geographically |
| Report details | Inspect a report's photograph and public information |
| AI screening | Provide model-generated suggestions, with uncertainty handled honestly |
| Administrative review | Review reports and update permitted statuses |
| Report tracking | Allow reporters to find their submissions securely |
| Responsive interface | Support mobile and desktop screens |

These are planned capabilities, not a statement that they are already available.

## Planned Technology

The current technical plan proposes the following baseline. Choices marked as proposed still need to be confirmed during implementation.

| Area | Planned technology | Status |
|---|---|---|
| Frontend | React | Planned |
| Build tool | Vite | Proposed |
| Backend services | Supabase | Planned |
| Database | Supabase PostgreSQL | Planned |
| Authentication | Supabase Auth | Planned |
| Photograph storage | Supabase Storage | Planned |
| Interactive map | Leaflet | Planned |
| Road-damage AI | Suitable pretrained model | Not selected |
| Hosting | To be selected and tested | Open decision |

The final model, hosting provider, map tile provider, and some backend implementation details remain open decisions.

## How the Application Should Work

1. A citizen opens the application and submits a road-damage photograph with its location.
2. The backend validates and saves the submission.
3. The application confirms success only after the backend confirms the report was created.
4. AI screening attempts to classify the image when the model is available. AI failure must not prevent a valid report from being accepted.
5. Eligible reports appear on the public map.
6. An authorized administrator reviews a report and updates its status.
7. The application displays the saved status and makes permitted information available to users.

AI suggestions are not official verification. A report's lifecycle status, verification state, and AI screening outcome are separate concepts.

## Repository Structure

The following structure describes the current documentation organization and intended future implementation areas. Application source folders may be added as implementation begins.

```text
Roadwatch-AI/
├── README.md
├── PRD.md
├── TRD.md
├── APP_FLOW.md
├── UI_UX_BRIEF.md
├── BACKEND_SCHEMA.md
├── IMPLEMENTATION_PLAN.md
├── ARCHITECTURE.md
├── PROGRESS.md
└── DESIGN.md
```

## Getting Started

**The application setup instructions will be completed when the initial implementation exists and has been tested.**

At present, the repository contains project documentation and planning. Do not assume that install commands, environment variables, database migrations, or deployment steps have already been configured.

The intended setup process is:

1. Clone the repository.
2. Install the dependencies defined by the finalized frontend project.
3. Configure the required environment variables.
4. Connect the development application to the intended Supabase project.
5. Apply the version-controlled database migrations and configure access policies.
6. Start the development server.
7. Verify report submission, persistence, map display, and administrative review as each capability is implemented.

Exact commands and required environment variables will be documented after the project setup is established and verified.

## Configuration and Secrets

Configuration will depend on the finalized implementation. In general:

- Keep local credentials in an untracked environment file.
- Provide a safe example environment file once the required variables are known.
- Never commit service-role keys, private tokens, passwords, or other secrets.
- Never expose privileged backend credentials in frontend code.
- Enforce administrative permissions in the backend, not merely through the interface.

## Development Strategy

RoadWatch AI follows two stages.

### Stage 1 — Working MVP

Prioritize a small, connected application that can complete the core workflow:

**Submit a report → Save it → Display it on the map → Review it → Update its status.**

Build and test the essential safeguards alongside these features. Add genuine AI inference when feasible without making submission dependent on it.

### Stage 2 — Production Readiness

After the MVP works end-to-end, improve security, reliability, performance, AI evaluation, monitoring, backups, deployment automation, and other operational requirements.

Advanced analytics, custom model training, duplicate detection, municipal integrations, and other nonessential capabilities must not delay the first working app unless a real requirement makes them necessary.

## Documentation

| Document | Purpose |
|---|---|
| [PRD.md](./PRD.md) | Product requirements, users, goals, and scope |
| [TRD.md](./TRD.md) | Technical requirements and technology decisions |
| [APP_FLOW.md](./APP_FLOW.md) | Screens, user journeys, and navigation |
| [UI_UX_BRIEF.md](./UI_UX_BRIEF.md) | User experience and interface requirements |
| [BACKEND_SCHEMA.md](./BACKEND_SCHEMA.md) | Proposed database schema, access rules, and data handling |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | MVP-first build sequence and acceptance criteria |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System components and their relationships |
| [PROGRESS.md](./PROGRESS.md) | Verified implementation status, blockers, and next steps |
| [DESIGN.md](./DESIGN.md) | Visual design system and reusable interface guidance |

## Project Status and Contributions

The current focus is completing the project documentation before implementation begins. Progress records must distinguish planned, implemented, tested, and verified work.

When development begins, each completed milestone should be checked against its acceptance criteria. A mockup or planned feature should not be described as a working feature until it has been implemented and tested.

## License

A project license has not yet been selected. Until one is added, do not assume that the repository grants permission to redistribute or reuse its contents under an open-source license.