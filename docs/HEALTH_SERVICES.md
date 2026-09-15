# Health services

Phase 13 turns the Health operation declarations into a platform-neutral application service. `createHealthService` exposes 136 unique runtime methods: all 126 lifecycle declarations and all 11 summary declarations, with `getEquipmentUsageSummary` shared by both inventories.

## Composition

The service receives every external capability through `HealthServiceDependencies`:

- the aggregate `HealthRepository` interface;
- a clock returning an ISO date-time string; and
- an identifier generator.

The application package contains no database, browser, React, React Native, Supabase, or global time/UUID call. Phase 13 tests use deterministic repository doubles. Production-quality volatile repositories are Phase 14 work.

```ts
import { createHealthService } from "@aperture/health/application";

const health = createHealthService({ repositories, clock, idGenerator });
const entry = await health.recordHydration(
  { ownerId: "synthetic-owner-1" },
  {
    volume: { value: "250.00", unit: "milliliter" },
    consumedAt: "2040-01-01T12:00:00Z",
  },
);
```

The operation context supplies the trusted owner. Create and query payloads cannot assign `ownerId`, and update payloads cannot replace an entity's identifier, owner, creation time, or immutable relationships. Every read and mutation scopes repository access to the validated owner. Returned entities and pages are validated again, including their owner and expected identifier, before crossing the service boundary.

## Workflows

The service covers the Health profile and all 21 collection repositories: measurements, vital readings, body composition, sleep, nutrition, hydration, medications and logs, symptoms, appointments, laboratory results, exercises, workout plans and sessions, exercise sets, running activities and splits, activity routes, equipment usage, personal records, and recovery entries.

Relationship checks run before mutation. Medication logs require an owned medication. Workout sessions can require an owned plan. Exercise sets require the referenced workout and exercise. Running activities can require an owned workout, route, and equipment record. Splits require an owned running activity. Personal records validate optional exercise and running references. Equipment usage validates the equipment and optional workout and running references. A missing or cross-owner reference produces `health-parent-not-found` without a write.

Status changes use explicit operations and reject invalid transitions:

| Entity | Accepted transitions |
| --- | --- |
| Appointment | `scheduled` to `cancelled` or `completed` |
| Exercise | `active` to `archived` |
| Medication | `active` to `archived` |
| Equipment | `active` to `retired` |
| Workout plan | `draft` to `active`; `draft` or `active` to `archived` |
| Workout session | `planned` to `in_progress`; `in_progress` to `paused`; `paused` to `in_progress`; `in_progress` or `paused` to `completed`; `planned`, `in_progress`, or `paused` to `cancelled` |
| Running activity | `planned` or `in_progress` to `completed` |

Normal update methods do not accept status changes for entities with explicit lifecycle operations.

## Summaries

Summary methods validate their queries and results. Sleep, hydration, running, and recovery summaries call the Phase 12 calculation functions. Workout duration aggregation uses decimal arithmetic. Aggregate reads follow every repository cursor and reject repeated cursors, so results are not limited to the first page.

`getDailyHealthSummary` treats the requested ISO date as the complete UTC day. `getUpcomingAppointments` filters scheduled appointments against the injected clock. `getLatestMeasurements` returns the newest observation for each stored measurement type.

The Phase 2 medication model records a medication name, lifecycle dates, and status, but it has no dosage schedule, recurrence, time-of-day, or reminder entity. `getUpcomingMedicationReminders` therefore returns a validated empty list. Generating reminder times from missing data would create medical behavior outside the approved model.

The Phase 2 workout-session model stores `startedAt` and `endedAt`, but has no pause or resume timestamp fields. `pauseWorkout` and `resumeWorkout` validate their timestamp arguments and apply the status transitions without inventing unapproved persisted fields.

`recentWorkoutCount` retains the Phase 2 summary name and counts the owner's repository-visible workout sessions because the declared query has no recency window. A future contract change must define a range before the service can apply one.

## Errors and propagation

Expected application failures use `HealthApplicationError` with one of these stable codes:

- `health-validation-failed`
- `health-record-not-found`
- `health-parent-not-found`
- `health-owner-mismatch`
- `health-invalid-state-transition`
- `health-conflict`
- `health-repository-contract-violation`

Repository failures propagate unchanged. The service does not retry a failed mutation or turn an infrastructure failure into a domain error. Validation, parent ownership, duplicate-ID, and transition checks complete before their corresponding write.

## Verification

The focused suite checks the exact public method inventory, every CRUD family, one-profile ownership, specialized queries, relationship ownership, all lifecycle transitions, all summaries, injected time and identifiers, duplicate IDs, invalid input, repository failures, repository-result ownership, and rejected owner reassignment. All fixtures use synthetic values.

From the workspace root:

```sh
npm test --workspace @aperture/health
npm run lint --workspace @aperture/health
npm run typecheck --workspace @aperture/health
npm run build --workspace @aperture/health
```

Health services remain application-neutral. Durable persistence, APIs, authentication, UI, synchronization, background scheduling, notifications, diagnostic interpretation, and medical recommendations are outside Phase 13.
