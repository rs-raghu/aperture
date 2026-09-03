# Phase 8 Education memory repository

`@aperture/education-memory` is a volatile adapter for deterministic development and tests. It implements every repository interface consumed by the Phase 7 Education service. It is not durable storage: all records disappear when the owning JavaScript process or repository instance ends.

## Dependency direction and public API

```text
@aperture/education-memory
└── @aperture/education
```

Education does not import the adapter. Health, Finance, platform, web, and mobile packages do not depend on it. The public API contains only `createEducationMemoryRepository`, its options type, and the safe `EducationMemoryRepositoryError` contract. Internal stores, collections, cloning helpers, concrete repository factories, and test fixtures are not public exports.

Each factory call creates one new store and a frozen `EducationRepository` aggregate. Its fourteen repository properties are also frozen. There is no singleton, global reset, seed step, clock, or ID generator. Phase 7 remains responsible for constructing entities with injected IDs and timestamps.

## Implemented repositories

1. Institution
2. Academic program
3. Semester
4. Course
5. Topic
6. Assignment
7. Exam
8. Grade
9. Attendance
10. Study session
11. Schedule entry
12. Learning resource
13. Certificate
14. Education goal

The aggregate supports generic `create`, `update`, `delete`, `findById`, and `findMany` methods plus the declared course-code, grade-by-semester, gradeable-assessment, and attendance-session identity queries.

## Ownership and identity

- All lookups, lists, specialized queries, and deletes are owner-scoped.
- A missing record and a record belonging to another owner have the same inaccessible result: reads return `null`, while update/delete reject with `education-memory-record-not-found`.
- IDs are globally unique within an aggregate, including across owners. Duplicate creation rejects with `education-memory-duplicate-id`.
- Update derives ownership from the complete entity contract. Owner changes cannot select the stored record and therefore reject as inaccessible.
- `id`, `ownerId`, and `createdAt` are immutable. Repositories never generate identifiers, timestamps, defaults, or lifecycle state.
- Deletes affect one collection entry and never cascade.

## Immutability strategy

Defensive cloning uses the platform `structuredClone` algorithm. Unlike JSON serialization, it does not silently stringify or discard supported structured values. Cloning occurs before storage and again on every returned entity, including list results and nested values. The default `cloneValues: true` protects internal state from caller mutation. The opt-out exists only for controlled test profiling and removes that protection deliberately.

Every factory owns independent `Map` instances. No maps, mutable collections, reset functions, or mutation escape hatches are exported.

## Filtering

Supplied filters combine with logical AND. Omitted filters do not constrain results. Text `search` fields declared by Institution and Course perform case-insensitive substring matching over their declared name/code fields; no fuzzy or full-text search exists. Other text filters use exact matching.

Date and timestamp boundaries are inclusive:

- `dueFrom <= dueAt <= dueTo`
- `startsAfter <= start <= startsBefore`
- `dateFrom <= sessionDate <= dateTo`
- Schedule overlap requires `startsAt <= startsBefore` and `endsAt >= endsAfter` when those bounds are supplied.

Repositories do not validate parent existence or apply relationship cascades. They expose owner-scoped facts; Phase 7 services decide business conflicts and relationship validity.

## Sorting

Each repository has a deterministic domain default:

| Repository | Primary order |
| --- | --- |
| Institution, Program | Name |
| Semester | Sequence, then start date |
| Course | Code when present, otherwise name |
| Topic | Sequence |
| Assignment | Due timestamp |
| Exam | Scheduled start |
| Grade | Recorded timestamp |
| Attendance | Session date |
| Study session | Planned start |
| Schedule | Start timestamp |
| Resource | Title |
| Certificate | Issue date |
| Goal | Target date |

`sortDirection` reverses the primary ordering. Entity ID is always the final ascending tie-breaker, independent of direction. Optional primary values sort after present values when ascending and before present values when descending.

## Pagination

The adapter implements the existing cursor/limit contract after filtering and sorting. Limits must be integers from 1 through 100. Cursors are opaque adapter values in the form `memory:<offset>`; malformed or out-of-range cursors reject with `education-memory-invalid-query`. Under unchanged repository state, pages neither duplicate nor skip records. The result contract does not request a total count, so none is added.

## Errors and missing records

The safe adapter error codes are:

- `education-memory-duplicate-id`
- `education-memory-record-not-found`
- `education-memory-immutable-identity`
- `education-memory-invalid-query`

Messages contain no HTTP status, database terminology, internal objects, or stack trace payloads.

## Repository versus service responsibilities

The adapter stores complete entities, applies owner-scoped queries, and protects memory boundaries. Education services continue to own validation, parent existence checks, uniqueness decisions, state transitions, archive rules, ID generation, timestamps, and calculations. The memory adapter does not pretend to be the future Supabase implementation.

## Testing

- A reusable contract suite exercises all fourteen repositories for CRUD, missing and cross-owner behavior, immutable identity, defensive copies, and factory isolation.
- Domain-query tests cover every filter family, specialized uniqueness lookup, ordering, pagination, and invalid cursor/limit behavior.
- Aggregate tests verify the fourteen-property shape, frozen public surface, empty startup, and globally unique IDs.
- Service integration tests run real Phase 7 workflows and Phase 6 calculations against the adapter.
- Fourteen deterministic fixture builders live only under `tests/fixtures`. They use synthetic labels, explicit UUIDs, ISO values, and decimal strings.
- A package-import smoke test uses only `@aperture/education-memory`.

## Phase 8 exclusions

There is no Supabase, PostgreSQL, SQL, ORM, IndexedDB, SQLite, LocalStorage, filesystem or network persistence, API, authentication, synchronization, import/export, backup, notification, UI, Health/Finance repository, production seed data, or Phase 9 implementation. Web and mobile remain non-runnable. Do not enter personal data.
