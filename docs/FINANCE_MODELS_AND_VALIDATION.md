# Finance Models and Validation

Phase 18 turns the Phase 3 Finance declaration surface into runtime validation while preserving the deferred operation and repository contracts for later phases.

## Runtime surface

`@aperture/finance` now exports 281 named Zod schemas covering every non-generic data declaration: identifiers, enums, entities, create and update inputs, queries, service summaries, calculator inputs and outputs, saved scenarios, errors, and shared value objects. `pageResultSchema` covers the generic paged-result contract.

The checked-in generator inventories 30 repository interfaces and 183 declared operations in addition to the runtime schema surface. The generator reads the approved declaration files, emits literal schema exports that bundlers can analyze, and fails `typecheck`, `lint`, and `build` when generated files are stale.

## Financial conventions

- Monetary amounts cross package boundaries as canonical base-10 strings. Exponents, JavaScript numbers, `NaN`, infinity, and incomplete decimals are rejected.
- Every `Money` value carries an uppercase three-letter currency code.
- Percentages and rates use human-percentage strings, so `8.5` means 8.5 percent.
- Every interest rate names its period and compounding frequency.
- Periodic contribution and withdrawal calculators name beginning-of-period or end-of-period timing.
- Fiscal years use consecutive `YYYY-YY` identifiers, such as `2026-27`.
- Dates are real ISO calendar dates. Timestamps require an explicit offset and retain up to nanosecond precision for ordering checks.
- Calculator requests carry a non-empty version plus explicit assumptions and source references. Calculator results retain the version, estimate marker, assumptions, sources, and warnings.
- Entities and owner queries carry owner identifiers. Strict object schemas reject credential-shaped or otherwise undeclared fields.

## Security boundary

Finance contracts contain no bank login credentials, passwords, PINs, OTPs, or raw third-party authentication material. Account records describe financial data only. Future integrations must keep secrets behind server-side adapter boundaries.

## Verification

Generated fixtures exercise every runtime schema. Focused boundary tests cover arbitrary-precision decimal strings, currency requirements, real dates, offset timestamps, fiscal years, rate conventions, contribution timing, pagination, update inputs, ordered ranges, exact timestamp ordering, strict fields, public imports, and the credential/monetary declaration audit.
