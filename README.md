# Rescue Hub

🔲 Pending phases to build

#PhaseWhat it needs1Rescue teamsrescue_teams table + UI to manage teams, availability, capabilities, and lifecycle status: AVAILABLE → DISPATCHED → ON_THE_WAY → ON_SITE → RESCUING → COMPLETED2NGO operations & volunteersNGO volunteer profiles, skills, availability, task assignment, and NGO-specific operations3ResourcesInventory per team/NGO/shelter, allocation to incidents, stock tracking4Alerts & notificationsIn-app notification centre, read/unread state, realtime updates via database realtime channel5AI intelligenceSeverity recommendation, 0–100 priority score, classification, summarisation, duplicate detection, NGO/rescue matching, image analysis — all labelled as human-advisory only6Analytics & exportsRecharts dashboards + role-scoped PDF/CSV/XLSX export with filters (date, type, severity, status, verification, location)7Role-scoped dashboardsDedicated landing pages for Citizen, Authority/Admin, NGO, Rescue Team, Volunteer8Final polishAccessibility pass, responsive pass, unique per-route SEO metadata, consistent loading/empty/error/retry states, pagination, debounced search, production build                                                                                this pending thinks continue building phase

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c49c45f0-dbb9-45ed-9ec8-7390bd6d9253).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
