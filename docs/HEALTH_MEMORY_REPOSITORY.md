# Health memory repository

Phase 14 adds `@aperture/health-memory`, a process-local adapter for the complete `HealthRepository` aggregate. The adapter implements the profile repository, 21 CRUD repositories, and equipment-usage aggregation. It composes directly with the real Phase 13 Health service.

## Isolation and ownership

Every `createHealthMemoryRepository()` call creates a new store. There is no module singleton, implicit seed, local-storage write, file write, network call, or database connection. Identifiers are unique across all owners within each repository collection. Reads, updates, deletes, profile lookup, and equipment usage require a matching owner.

The aggregate and each exposed repository object are frozen. Stored values and returned values use deep defensive copies by default, including nested quantity objects and identifier arrays. `cloneValues: false` exists only for controlled adapter tests.

## Ordering and filters

Every list has a deterministic ascending primary order and uses the entity ID as an ascending tie-breaker.

| Repository | Primary order | Filters |
| --- | --- | --- |
| Appointments | start time | status, inclusive `startsBefore` |
| Body composition | observation time | owner |
| Equipment | name | category and status |
| Exercise sets | sequence | workout and exercise |
| Exercises | name | category and status |
| Hydration | consumption time | exact recorded calendar-date prefix |
| Laboratory results | collection time | owner |
| Measurements | observation time | type and inclusive range |
| Medications | name | status |
| Medication logs | recorded time | medication |
| Nutrition | consumption time | exact recorded calendar-date prefix |
| Personal records | achievement time | exercise |
| Recovery | observation time | owner |
| Routes | title | owner |
| Running activities | start time | inclusive range |
| Running splits | sequence | running activity |
| Sleep | start time | inclusive range |
| Symptoms | observation time | owner |
| Vital readings | observation time | type and inclusive range |
| Workout plans | start date, then title | status |
| Workout sessions | scheduled, started, or creation time | inclusive range |

Multiple supplied filters use AND semantics. Date and time boundaries are inclusive. Timestamp ranges, `startsBefore`, and timestamp ordering compare absolute instants across explicit offsets and preserve the domain's supported nanosecond precision. Date-only hydration and nutrition filters deliberately match the timestamp's recorded `YYYY-MM-DD` prefix. Specialized Phase 13 queries use the same storage-neutral `findMany` repository method and are recognized by the adapter at runtime.

## Pagination

List results accept limits from 1 through 100. Cursors are opaque adapter values. Each cursor is bound to its collection, owner, filters, and collection revision. A malformed cursor, a cursor from another collection or owner, a cursor used with different filters, or a cursor made stale by a collection mutation produces `health-memory-invalid-query`.

This revision binding prevents an offset cursor from silently skipping or repeating records after a create, update, or delete. Consumers should restart from the first page after a stale-cursor error and must not parse cursor text.

## Mutations and deletion

Create rejects a duplicate ID even when the existing record belongs to another owner. Update rejects missing records, owner reassignment, ID substitution, and creation-time changes. Delete rejects missing and wrong-owner targets identically, then removes the owned record.

The profile repository also enforces one profile per owner. Equipment usage requires owned equipment, stores only explicit usage inputs, converts distance to kilometers and duration to seconds through the Health calculation layer, and returns a validated summary. Deleting equipment also removes its process-local usage history, so recreating an ID cannot reveal old usage.

## Errors

Expected adapter failures use `HealthMemoryRepositoryError` and one of these stable codes:

- `health-memory-duplicate-id`
- `health-memory-record-not-found`
- `health-memory-immutable-identity`
- `health-memory-invalid-query`
- `health-memory-owner-conflict`

Errors identify an entity or field when useful but do not reveal whether another owner has a matching record.

## Reusable contract verification

The test-only `runHealthRepositoryContractSuite` accepts an adapter factory and adapter-specific error assertions. It runs the same create, read, list, owner, update, immutable-field, delete, defensive-copy, pagination, invalid-cursor, invalid-limit, and factory-isolation checks across every CRUD repository. A future Supabase adapter can call the suite with its own factory and error mapping.

Additional tests cover every declared filter, inclusive range behavior, primary ordering, the profile interface, equipment usage, exact public exports, empty startup, nested defensive copies, and a connected workflow through the real Health service and every summary path. All fixtures are deterministic and synthetic.

From the workspace root:

```sh
npm test --workspace @aperture/health-memory
npm run lint --workspace @aperture/health-memory
npm run typecheck --workspace @aperture/health-memory
npm run build --workspace @aperture/health-memory
```

The memory adapter is not production storage. Durable PostgreSQL/Supabase adapters, migrations, Row Level Security, authentication, offline synchronization, import/export, backup, and recovery remain deferred.
