# Planner and Today

Phase 33 adds two complete owner-scoped vertical slices.

## Planner domain

`@aperture/planner` owns plans, items, cross-feature links, validation, daily and weekly projections, recurrence expansion, completion, filtering, and overdue derivation. Planner items support tasks, events, reminders, and focus blocks; priorities range from 0 through 4; statuses are planned, in progress, completed, cancelled, and archived.

Recurrence is stored as structured data with a daily, weekly, or monthly frequency, a positive interval, optional weekly weekdays, and an optional ending date. The service expands occurrences when it builds a daily or weekly plan. It does not materialize duplicate database rows for every occurrence. Overdue is also derived at read time from the deadline and current plan date, so storage never needs a stale `overdue` status.

The package exposes an isolated memory repository for tests and explicit development preview. `@aperture/postgres-repositories` maps the same contracts to the existing `planner.plans`, `planner.items`, and `planner.item_links` tables. The Phase 33 migration adds plan cadence, descriptions, deadlines, recurrence rules, completion timestamps, an overdue index, and Planner synchronization scope support. Supabase uses the same durable adapter and reports Planner in its synchronization monitor.

## Today aggregation

`@aperture/today` is a framework-neutral aggregator. It receives widget definitions, contributor functions, and quick actions through dependency injection. A contributor failure is isolated to its widget and does not prevent the rest of Today from loading.

The application composition root reads widget definitions from `@aperture/feature-registry`, then connects public repository contracts to standard contributors:

- Planner scheduled and overdue items;
- Education assignments, exams, and planned study sessions;
- active Health workout plans; and
- upcoming Finance recurring transactions.

The Today web and mobile features consume only the Today service. They do not import Education, Health, or Finance feature components or providers. Widget visibility is configurable for the mounted Today screen; durable owner preferences remain Phase 34 work.

## Platform routes

Web and mobile expose `/planner` for the daily workflow, `/planner/week` for the weekly view, and `/today` for aggregation. The Planner manifest owns both routes, its backend and migration references, and the `planner.items` Today widget. Education contributes separate deadlines and planned-study widgets, while Health and Finance retain their plan and reminder contributions.
