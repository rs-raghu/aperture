# Health web preview

> **Phase 31 update:** authenticated routes now receive the shared Supabase
> repository and owner from the dashboard composition root. Memory storage and
> synthetic owners remain only in tests and the explicit development bypass.

Phase 15 composes the runtime Health service and `@aperture/health-memory` adapter into a local Next.js preview. It is a presentation and composition layer; domain validation, ownership, lifecycle transitions, relationships, and calculations remain in the shared Health package.

## Routes

| Route | Capability |
| --- | --- |
| `/health` | Profile prompt, overview counts, latest measurements, and upcoming appointments |
| `/health/profile` | Create or edit the single owner profile |
| `/health/measurements` | Record, filter, and delete body measurements |
| `/health/vitals` | Record, filter, and delete supported vital readings |
| `/health/workouts` | Manage exercises and plans, workout lifecycle states, and exercise sets |
| `/health/running` | Manage routes, equipment, activities, results, lifecycle completion, and usage |
| `/health/sleep` | Record and delete sleep observations |
| `/health/nutrition` | Record, filter, and delete nutrition entries |
| `/health/hydration` | Record, date-filter, total, and delete hydration entries |
| `/health/goals` | Track achieved personal records and recovery observations using implemented contracts |

The route files only select feature screens. Navigation, UI, adapters, hooks, error models, and workflows live under `apps/web/src/features/health`.

## Runtime composition

The Health layout mounts one `HealthProvider`. The provider creates its runtime once and shares it with every nested route, so client-side Health navigation and rerenders preserve state. A browser refresh remounts the provider and creates a new empty repository aggregate.

The production preview adapter injects `crypto.randomUUID`, a wall clock, the real Health service, and a new memory repository. Tests inject a deterministic clock and ID generator into the same service and repository implementation.

`health-preview-owner` is an explicit synthetic development identity. It scopes service operations, but it is not a login, authorization check, or Row Level Security policy. The shell displays this limitation and warns against entering personal data.

## Interaction and error behavior

Forms have associated labels, native required/range controls, keyboard-visible focus, pending states, and responsive one-column layouts on narrow screens. Collections include initial and filtered empty states. Supported domain deletion and lifecycle methods are exposed directly; workout sessions use cancel instead of deletion because the service contract intentionally exposes lifecycle retention.

Browser date-time values are converted to ISO timestamps at the presentation boundary. Service and repository errors are normalized into concise messages and field mappings. Unknown objects, validation structures, stack traces, and `[object Object]` are never displayed.

## Scope and safety

The preview records observations and displays factual counts, units, lifecycle states, and arithmetic totals. It provides no diagnosis, classification, clinical threshold, intake target, workout prescription, recovery advice, or medical recommendation.

The Health contract has personal records and recovery entries but no goal target entity. The Goals route therefore records completed milestones and observations and clearly discloses that target-setting is not implemented.

Storage is volatile. There is no browser persistence, database, synchronization, API, authentication, production owner, or Health mobile screen in this phase.

## Verification

Component tests mount the real Health service with a fresh Health memory repository. They cover provider stability and isolation, profile create/edit, measurement and vital recording, filters, overview updates, exercise/plan/session/set workflows, workout transitions, routes, equipment, running results and usage, sleep, nutrition, hydration, achieved personal records, recovery observations, empty states, and safe error formatting. The Next.js production build verifies every route entry point.
