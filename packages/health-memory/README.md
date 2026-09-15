# @aperture/health-memory

Phase 14 provides an isolated, volatile implementation of every `@aperture/health` repository interface.

```ts
import { createHealthMemoryRepository } from "@aperture/health-memory";

const repositories = createHealthMemoryRepository();
```

Each factory call owns a separate store. No records are seeded, and all data disappears when the process, browser document, or app runtime is replaced. Values are defensively cloned on writes and reads by default.

This package is intended for local previews, tests, and repository-contract development. It is not durable storage and does not provide authentication, synchronization, encryption, database access, or backup.

See [the full behavior, ordering, pagination, and verification reference](../../docs/HEALTH_MEMORY_REPOSITORY.md).
