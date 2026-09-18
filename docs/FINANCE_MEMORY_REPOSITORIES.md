# Finance memory repositories

`@aperture/finance-memory` implements all 26 repository interfaces declared by `@aperture/finance`. It is intended for deterministic tests and explicit local previews. The factory creates a fresh store on every call, so records never leak between application runtimes or test cases and disappear when the process is restarted.

## Composition

```ts
import {
  allFinanceCalculatorPlugins,
  createFinanceApplicationService,
} from "@aperture/finance";
import { createFinanceMemoryRepository } from "@aperture/finance-memory";

const repositories = createFinanceMemoryRepository();
const finance = createFinanceApplicationService({
  repositories,
  calculatorRegistry: allFinanceCalculatorPlugins,
  clock,
  idGenerator,
});
```

The adapter remains below the application-service boundary. Presentation code uses the Finance service and does not depend on its storage implementation.

## Guarantees

- Every operation is owner scoped. A record belonging to another owner is unavailable through reads, updates, and deletes.
- Inputs and outputs are defensively cloned by default, including nested money values and saved calculator inputs.
- Decimal amounts remain strings. The adapter neither parses money nor performs currency conversion.
- Each collection has an explicit deterministic sort order with the record identifier as its final tie breaker.
- Account and transaction queries support currency filters. Transaction queries also combine account, category, date-range, and owner filters with AND semantics.
- Date ranges are inclusive. Transaction date filters compare the calendar portion of ISO date-time values against date-only boundaries.
- Pagination cursors bind to the collection revision and query filters. A cursor is rejected after a mutation or when reused with another query.
- Entity schemas from `@aperture/finance` validate every stored record.

Repository-generated identifiers and timestamps are configurable for deterministic direct adapter tests. In the application composition, the Finance service supplies identifiers and timestamps using its injected dependencies.

## Error behavior

Adapter failures use `FinanceMemoryRepositoryError` with stable codes for duplicate identifiers, missing records, immutable identity changes, invalid entities, and invalid or stale queries. Cross-owner update and delete attempts intentionally use the same missing-record error as unknown identifiers.

## Verification

The package includes deterministic fixtures for every aggregate and reusable contract coverage for create, get, update, list, delete, owner isolation, cloning, filters, ordering, pagination, and decimal preservation. An integration test runs the real Finance application service against the adapter to verify the package boundary.

The adapter is volatile by design. Durable storage and cross-device synchronization are introduced by later infrastructure phases without changing the Finance application service.
