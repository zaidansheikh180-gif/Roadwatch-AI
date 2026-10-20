# RoadWatch AI

A responsive civic-tech MVP for reporting road damage, exploring public reports on a map, privately tracking submissions, and reviewing reports.

**Repository:** [zaidansheikh180-gif/Roadwatch-AI](https://github.com/zaidansheikh180-gif/Roadwatch-AI)

## Current implementation status

The application source and initial Supabase migration are being built in small, verifiable steps. Until you run and test the app, do not treat the presence of source files as proof that the deployed workflow works.

- React + Vite + TypeScript frontend.
- Interactive Leaflet map.
- Mulberry (`#32292F`) and Turquoise (`#99E1D9`) visual identity.
- Local browser demo mode when Supabase environment variables are absent.
- Supabase Edge Functions for report submission, private tracking, and administrator review.
- AI inference is **not yet integrated**; the interface must show it as unavailable rather than fabricate predictions.

## Requirements

- Node.js 20 or newer recommended.
- npm.
- For shared persistence and secure review: a Supabase project.

## Run locally

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite.

Without Supabase configuration, the app runs in **demo mode**. Reports and status changes are saved only in that browser's local storage; demo mode is not secure multi-user persistence and must not be used as a real civic reporting service.

## Connect Supabase

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the project's public URL and anon/publishable key.
3. Apply the SQL migration in `supabase/migrations/` using the Supabase CLI or SQL editor.
4. Deploy the Edge Functions in `supabase/functions/`:
   - `submit-report`
   - `track-report`
   - `admin-review`
5. Ensure the Edge Functions have the standard server-side `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` secrets. Never expose the service-role key to the frontend.
6. Create an administrator using Supabase Auth, then assign the role through a trusted SQL/admin process:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('AUTH_USER_UUID', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

7. Restart Vite after editing environment variables.

Public photo storage is intentional in the current product brief. The submission form warns that report photos may be publicly visible. Do not upload sensitive photos.

## Commands

- `npm run dev` — local development.
- `npm run build` — TypeScript build and production bundle.
- `npm run typecheck` — TypeScript checks.
- `npm run preview` — serve the production build locally.

## Important limitations

- AI screening is not connected yet.
- Local demo mode is not secure multi-user storage.
- Supabase services must be configured, migrations applied, and functions deployed before shared submission/tracking/admin operations work.
- The current map uses OpenStreetMap's public tile service. Confirm its usage policy and attribution requirements before a public/high-traffic deployment.
- Winked is the selected brand typeface, but a licensed font asset has not been added. The UI currently uses system fallbacks and a web font fallback.

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md), [DESIGN.md](./DESIGN.md), and [PROGRESS.md](./PROGRESS.md) for the agreed scope and verification rules.
