# Finance application services

Phase 23 adds `createFinanceApplicationService`, a repository-only application layer for Finance. It has no UI or database imports. The composition root injects repository interfaces, a clock, an ID generator, and the calculator registry.

## Owner and mutation boundaries

Every data operation receives a `FinanceOperationContext`. Create payloads and list queries cannot choose an owner; the service injects the context owner after rejecting any runtime `ownerId` field. Repository results are validated against generated schemas and checked for owner and identity agreement.

The service materializes new records with the injected ID and timestamp, `manual` source metadata, and the domain default status. Updates use the injected clock. Lifecycle state changes use dedicated operations so a normal update cannot directly set status.

Structured `FinanceApplicationError` codes distinguish invalid input, missing records, conflicts, owner mismatches, invalid transitions, invalid relationships, unknown calculators, and repository contract violations.

## Domain use cases

The service exposes scoped resources for:

- financial accounts,
- transactions and income/expense summaries,
- transaction categories,
- budgets and budget lines,
- income sources,
- assets and liabilities,
- investment accounts,
- loans,
- financial goals and progress,
- saved calculator scenarios, and
- calculator discovery, category filtering, search, and execution.

Favorites and recent calculators do not have declared Finance repository contracts, so Phase 23 does not invent persistence for them.

## Business validation

Account-linked transactions must use the account currency. Category kind must agree with transaction type. Matching account, amount, timestamp, type, and description are treated as a duplicate transaction.

Budget lines require an owned budget, an owned expense category, the budget currency, and one line per category. Linked investment accounts must use the financial-account currency. Loans require a positive principal, one currency, and an opening balance no greater than principal. Financial-goal target and progress values must share a currency.

Names are unique within an owner where the domain represents a named resource. All money remains a base-10 decimal string at repository boundaries; summaries and ratios use `decimal.js` rather than binary floating-point arithmetic.

## Calculator boundary

The calculator registry is injected. Service startup rejects duplicate calculator identifiers. Discovery returns manifest metadata, execution validates input through the plug-in-owned schema, and saved scenarios require an existing calculator, a matching version, and valid calculator input. The application layer adds no advice, rate, or product recommendation.

Durable storage is outside this package. Phase 24 supplies the in-memory repository adapters against the interfaces used here.
