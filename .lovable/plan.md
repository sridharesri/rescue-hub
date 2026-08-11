# DISASTRA — Restore the Build, Then Ship the 8 Pending Phases

## Current state (verified)

This workspace is the blank starter again: `src/routes/index.tsx` is still the placeholder image, there are no components, no backend integration folder, and no migrations. The uploaded zip contains the full earlier DISASTRA build (156 files): design system, public pages (Home, Map, Disasters list/detail, Alerts, Shelters, Hospitals, NGOs, History, Safety, About), auth plus a guarded area (report, my-reports, verification queue, operations, admin), server functions split into `*.functions.ts` / `*.server.ts`, and three SQL migrations.

So the pending phases can't be built on top of nothing — the restore has to come first.

## Step 0 — Restore and get green

- Copy the app files from the zip into the workspace (routes, components, layouts, hooks, context, lib, types, constants, assets, styles, config, migrations), excluding git metadata and the bundled `.env`.
- Install missing dependencies (Leaflet, react-leaflet, recharts, export libs as needed).
- Enable the built-in Cloud backend, apply the three migrations, regenerate the client and types for this project.
- Smoke-check: landing page replaces the placeholder, seeded rows render, sign up / sign in works, a citizen report reaches the queue, operations writes persist, production build passes.

## Then the phases, one at a time (pausing after each for review)

1. **Rescue teams** — `rescue_teams` table plus assignments; UI to manage teams, availability and capabilities; lifecycle AVAILABLE → DISPATCHED → ON_THE_WAY → ON_SITE → RESCUING → COMPLETED enforced server-side.
2. **NGO operations & volunteers** — NGO relief operations, volunteer profiles, skills, availability, task assignment.
3. **Resources** — inventory per team/NGO/shelter, allocation to incidents, stock tracking with audit of movements.
4. **Alerts & notifications** — in-app notification centre, per-user read/unread state, live updates over the database realtime channel (no polling fakes).
5. **AI intelligence** — classification, severity recommendation, 0–100 priority score, summarisation, duplicate detection, NGO/rescue matching, image analysis. Every output labelled "AI Recommendation — Human Authority Makes Final Decision"; nothing auto-dispatches.
6. **Analytics & exports** — Recharts dashboards plus server-generated PDF/CSV/XLSX export with date, type, severity, status, verification and location filters, scoped by role.
7. **Role-scoped dashboards** — dedicated landing surfaces for Citizen, Authority/Admin, NGO, Rescue Team and Volunteer over the above data.
8. **Final polish** — accessibility pass, responsive pass, unique per-route SEO metadata, consistent loading/empty/error/retry states, pagination, debounced search, clean production build.

## Technical notes

- Each phase ships its own migration: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → policies. Roles stay in the existing roles table behind a security-definer check.
- Writes go through `createServerFn` with auth middleware; public reads use unauthenticated handlers with narrow anon SELECT policies. Server-side authorisation is authoritative — the UI never decides access.
- Lifecycle transitions (rescue status, task status, allocations) validated in the server function, not just the dropdown.
- Exports and AI calls run server-side so no unauthorised row or personal field leaks; AI uses the built-in AI gateway.
- The map stays browser-only behind a client-only wrapper.

## Out of scope

SMS/push delivery, external agency data feeds, live GPS vehicle tracking.
