# Supabase repositories

`@aperture/supabase-repositories` connects authenticated web and mobile clients
to the durable Education, Health, and Finance repositories. It adapts the small
SQL boundary already consumed by `@aperture/postgres-repositories` to
owner-protected Supabase table requests, so domain services keep one repository
contract and one data mapping implementation.

The adapter retries only transient network, timeout, throttling, and provider
availability failures. The default is two retries. When a create, update, or
delete response is lost, it reads the target record and accepts success only
when the persisted payload or tombstone proves that exact mutation committed.
A definitive duplicate or constraint response is returned immediately.

`CloudSynchronizationMonitor` exposes immutable per-domain snapshots for idle,
synchronizing, synchronized, and failed states. Applications can subscribe
without coupling feature code to Supabase.

This is a cloud-synchronized adapter. It does not implement an offline data
cache or write outbox. A failed network write stays failed and must be retried
by an explicit later user action.
