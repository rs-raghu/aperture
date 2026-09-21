# Shared data and synchronization

Phase 31 replaces the signed-in preview stores with one Supabase-backed
repository composition. Web and mobile authenticate the same owner and read and
write the same Education, Health, and Finance tables. Feature services still
depend only on their domain repository interfaces.

## Composition

The web dashboard creates its repository set in `WebDataProvider`; the mobile
tabs create theirs in `MobileDataProvider`. Both pass the authenticated user ID
as the operation owner. Supabase mode is selected for authenticated sessions.
Memory mode is available only to tests and the explicit local development
bypass.

The Supabase adapter reuses all 62 durable repository surfaces and their
validation, relational projections, decimal handling, filtering, pagination,
and tombstones. Supabase Row Level Security provides the final owner boundary.
The checked-in local configuration exposes only the Education, Health, and
Finance schemas required by this phase.

## Retry and idempotency

Reads and writes retry only transient connection, timeout, throttling, and
provider-availability failures. Retries are bounded to two after the initial
attempt, with a short increasing delay. Constraint, authorization, validation,
and duplicate errors do not retry.

The domain-generated record ID is the write idempotency key. If the network
drops after a mutation may have committed, the adapter reads that exact owner
and record. It reports success only when the persisted payload matches the
requested create/update or the expected deletion tombstone exists. Otherwise
it retries within the bound and ultimately returns failure. This prevents a
lost response from creating or applying a write twice without hiding a real
duplicate request.

## Observable state

Each composition owns a synchronization monitor with immutable snapshots for
Education, Health, and Finance. A snapshot reports `idle`, `synchronizing`,
`synchronized`, or `failed`, along with in-flight count, current attempt,
timestamps, and a stable error code. Web and mobile expose these snapshots
through their data-provider hooks for the shell and later diagnostics UI.

## Offline behavior

Aperture is cloud-synchronized and requires connectivity for feature data. It
does not cache records locally, accept offline writes, maintain an outbox, or
claim local-first behavior. The mobile authentication session remains in
SecureStore, but that is not a data cache. A network failure never fabricates a
successful feature operation; the existing feature error state remains visible
and the user can retry after connectivity returns.
