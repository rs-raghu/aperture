# Implemented route inventory

Phase 39 inventory from executable route files. Reserved directories and their historical READMEs do not claim implemented screens. Public signup/password-management reservations are not executable routes.

## Web application (47 pages and handlers)

| Path | Entry | Authentication |
| --- | --- | --- |
| `/` | Page | Owner protected or redirect |
| `/api/health` | Handler | Public protocol/liveness |
| `/api/health/ready` | Handler | Owner protected or redirect |
| `/api/integrations/strava` | Handler | Feature-owned protocol/verified owner, depending on operation |
| `/api/integrations/strava/callback` | Handler | Feature-owned protocol/verified owner, depending on operation |
| `/api/integrations/strava/webhook` | Handler | Feature-owned protocol/verified owner, depending on operation |
| `/api/recovery` | Handler | Verified owner cookie/Origin or bearer |
| `/auth/callback` | Handler | Public protocol/liveness |
| `/calculators` | Page | Owner protected or redirect |
| `/calculators/[calculator-id]` | Page | Owner protected or redirect |
| `/education` | Page | Owner protected or redirect |
| `/education/assignments` | Page | Owner protected or redirect |
| `/education/attendance` | Page | Owner protected or redirect |
| `/education/courses` | Page | Owner protected or redirect |
| `/education/exams` | Page | Owner protected or redirect |
| `/education/grades` | Page | Owner protected or redirect |
| `/education/setup` | Page | Owner protected or redirect |
| `/education/study-sessions` | Page | Owner protected or redirect |
| `/finance` | Page | Owner protected or redirect |
| `/finance/accounts` | Page | Owner protected or redirect |
| `/finance/assets` | Page | Owner protected or redirect |
| `/finance/budgets` | Page | Owner protected or redirect |
| `/finance/goals` | Page | Owner protected or redirect |
| `/finance/investments` | Page | Owner protected or redirect |
| `/finance/liabilities` | Page | Owner protected or redirect |
| `/finance/loans` | Page | Owner protected or redirect |
| `/finance/transactions` | Page | Owner protected or redirect |
| `/health` | Page | Owner protected or redirect |
| `/health/goals` | Page | Owner protected or redirect |
| `/health/hydration` | Page | Owner protected or redirect |
| `/health/measurements` | Page | Owner protected or redirect |
| `/health/nutrition` | Page | Owner protected or redirect |
| `/health/profile` | Page | Owner protected or redirect |
| `/health/running` | Page | Owner protected or redirect |
| `/health/sleep` | Page | Owner protected or redirect |
| `/health/vitals` | Page | Owner protected or redirect |
| `/health/workouts` | Page | Owner protected or redirect |
| `/planner` | Page | Owner protected or redirect |
| `/planner/week` | Page | Owner protected or redirect |
| `/portfolio` | Page | Public only when explicit publication gate and snapshot permit |
| `/portfolio/edit` | Page | Owner protected or redirect |
| `/settings` | Page | Owner protected or redirect |
| `/settings/data` | Page | Owner protected or redirect |
| `/sign-in` | Page | Public protocol/liveness |
| `/strava` | Page | Owner protected or redirect |
| `/strava/complete` | Page | Fixed integration completion; no private payload |
| `/today` | Page | Owner protected or redirect |

The public installation assets are `/manifest.webmanifest` and `/icon.svg`. Next.js also generates its not-found route and framework assets. `[calculator-id]` is one dynamic route covering all 38 calculator presentations; these are not 38 independent page modules.

## Mobile application (39 route files)

- `/`
- `/calculators`
- `/calculators/[calculator-id]`
- `/education`
- `/education/assignments`
- `/education/attendance`
- `/education/courses`
- `/education/exams`
- `/education/grades`
- `/education/setup`
- `/education/study-sessions`
- `/finance`
- `/finance/accounts`
- `/finance/assets`
- `/finance/budgets`
- `/finance/goals`
- `/finance/investments`
- `/finance/liabilities`
- `/finance/loans`
- `/finance/transactions`
- `/health`
- `/health/goals`
- `/health/hydration`
- `/health/measurements`
- `/health/nutrition`
- `/health/profile`
- `/health/running`
- `/health/sleep`
- `/health/vitals`
- `/health/workouts`
- `/planner`
- `/planner/week`
- `/portfolio`
- `/portfolio/edit`
- `/settings`
- `/settings/data`
- `/sign-in`
- `/strava`
- `/today`

The native root redirects according to session state. `/sign-in` is the authentication screen; the tabs and feature workspaces require the owner session. Portfolio mobile routes edit private curated content or link to the independently gated web presentation. Layouts and the generated not-found screen are excluded from this count. Android/iOS exports are verified separately from native execution.
