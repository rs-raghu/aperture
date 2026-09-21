# Finance vertical slice

> **Phase 31 update:** the signed-in web and mobile slices now use durable,
> shared Supabase repositories. The Phase 27 limitations below describe the
> earlier preview milestone; memory storage remains only for tests and the
> explicit development bypass.

Phase 27 closes the Finance and Calculator vertical slice from typed contracts through domain calculations, application services, volatile repositories, and web and Expo presentation layers. The slice contains 36 Finance calculators plus GPA and CGPA adapters, 26 memory repository implementations, nine Finance workflows on each platform, and one presentation registry shared by web and mobile.

## Architecture boundary

```text
Web screens ───────┐
                   ├─ @aperture/calculators ── Education calculations
Expo screens ──────┘             │
                                 └─ Finance generated plug-in registry

Web FinanceProvider  ─┐
Expo FinanceProvider ─┴─ FinanceApplicationService ── FinanceRepository contracts
                                                        │
                                                        └─ @aperture/finance-memory
```

The UI layers own controlled input, navigation, loading, error announcements, favorites, recent use, and side-by-side scenario display. They do not implement money arithmetic, interest conversion, tax slabs, retirement projections, repository filtering, ownership checks, or lifecycle transitions. Financial scenarios are validated and stored through the application service. GPA and CGPA scenarios remain provider state because those calculators intentionally belong to Education rather than the Finance service registry.

## Audit result

| Area | Evidence | Result |
| --- | --- | --- |
| Required inventory | Generated Finance registry and shared presentation registry | 36 Finance plug-ins plus GPA and CGPA; 38 unique IDs in nine presentation categories |
| Formula correctness | Foundation, investment, regulated, retirement, and Education reference tests | Every registered example validates and equals its expected result |
| Decimal precision | Decimal.js clones use precision 50; portable-number audit rejects fractional JavaScript output numbers | Money and rates remain decimal strings; numbers are limited to safe integer counts and ages |
| Rounding | Explicit half-up and half-even foundation cases; GPA/CGPA rounding contracts | Rounding occurs only under an explicit contract and UI code does not re-round |
| Sign conventions | Cash-flow foundation tests and XIRR cases | Positive values are inflows, negative values are outflows; missing or ambiguous sign transitions fail deterministically |
| Rate conversions | Nominal/effective round-trip, unsupported-convention, loan, and retirement tests | Period and compounding frequency are explicit; ambiguous nominal non-annual input is rejected |
| Government rules | Manifest and output-metadata hardening tests | Nine government calculators have no embedded presets and require caller rates or effective-dated rules |
| Tax metadata | Income Tax and HRA reference inputs and warning assertions | Financial year, caller rule version, and effective date remain part of the validated input and disclosed output |
| Web/mobile parity | Both applications import `@aperture/calculators`; each runs all 38 examples | IDs, categories, formula text, assumptions, examples, and calculation functions are shared |
| Repository behavior | Finance Memory contract, clone, pagination, filter, ordering, and mutation-cursor tests | 26 repositories satisfy the same contracts with deterministic volatile behavior |
| Ownership | Application-service and memory owner-isolation tests | Every persisted Finance record is scoped by the operation context owner |
| Accessibility | Web Testing Library and React Native Testing Library suites | Labels, announced errors, textual status, pressed/busy state, keyboard access, and card alternatives are covered |
| Error behavior | Schema, calculation, application, repository, web, and mobile error tests | Invalid input is normalized; forms retain text; raw objects and stacks are not presented |
| Disclosures | Domain metadata, web shell, mobile preview notice, and calculator screens | Every Finance estimate now returns `estimate_not_advice`; platform copy rejects financial, tax, legal, and investment advice claims |

## Calculation conventions

The Finance calculation foundation publishes its conventions in `financeCalculationFoundationManifest`:

- Decimal precision: 50 digits.
- Internal decimal rounding: half-even.
- Public precision values: decimal strings.
- Day-count convention for NPV and XIRR: Actual/365 Fixed.
- Cash-flow signs: positive inflow and negative outflow.
- Contribution, payment, and withdrawal timing: explicit beginning or end of period.
- Nominal and effective rates: converted only when the input supplies source kind, period, target kind, and compounding frequency.

Reference tests cover simple and compound interest, present/future value round trips, ordinary and due annuities, amortization with exact zero closing balance, ROI, CAGR, XIRR convergence and rejection, inflation inverse operations, contribution and withdrawal timing, and half-up versus half-even ties. Calculator-specific suites then test those primitives through every public plug-in.

## Government and tax policy

There are no built-in current rate tables. The government calculators are NSC, Post Office MIS, PPF, SCSS, SSY, APY, EPF, Gratuity, and NPS. Their manifests expose an empty preset list. Investment schemes require a user-supplied rate, while retirement schemes also require a caller rule version and effective date where the formula depends on scheme rules. Missing source references produce an unverified-caller warning.

Income Tax accepts a financial year, jurisdiction, tax-rule version, rule effective date, slabs, rebate, cess, surcharge, and deductions. HRA accepts a caller rule version and effective date alongside its supplied percentages. TDS and GST use explicit rates and state that the output is not a final liability or assertion of current law. The calculators make no network request and do not silently refresh rules.

## Repository and ownership behavior

`FinanceApplicationService` receives the owner from `FinanceOperationContext`; callers cannot override it through create or query input. The memory adapter clones values at read/write boundaries, filters within the owner partition, sorts deterministically, and invalidates continuation cursors after mutation. Relationship checks resolve linked records through the same owner scope. Scenario creation also verifies the registered calculator ID, exact version, and input schema before persistence.

Separate providers create separate repository aggregates. Within one provider, finance routes and calculator routes share the same runtime. This gives deterministic navigation persistence during the preview while keeping reload behavior explicit.

## Presentation parity and safety

Web and Expo use the same `CalculatorPresentationDefinition` objects from `@aperture/calculators`. The package maps the generated Finance registry once and adds GPA and CGPA as thin adapters to Education. Both platforms validate the edited input through the same schema and invoke the same calculation function. Neither platform contains a copied formula or category list.

Web renders nested input and output trees as labelled fields and result groups. Expo renders the same input graph with native fields and long arrays as labelled horizontal card collections. Numeric and decimal fields request numeric keyboards where appropriate. Both platforms expose formulas, assumptions, result warnings, reset, favorites, recent use, scenario saving, and comparison.

The web shell and mobile calculator notice state that results are estimates and are not financial advice. Shared Finance result metadata adds the stronger `estimate_not_advice` warning to every estimate, including outputs consumed outside these applications. Existing calculator-specific warnings remain intact.

## Error behavior

- Schema failures identify invalid paths and become concise field or banner messages.
- Unsupported rate conventions, mixed currencies, invalid signs, impossible age ordering, invalid percentages, and non-convergence use stable calculation error codes.
- Relationship, duplicate, missing-record, lifecycle, and ownership failures use stable application or repository errors.
- Web and mobile forms remain controlled after failure, so the user can correct the original text.
- The UI never renders a validation object as `[object Object]` and never exposes an internal stack trace.

## Verification map

| Layer | Main suites |
| --- | --- |
| Finance schemas and formulas | `packages/finance/test/finance.schemas.test.ts`, `calculation-foundation.test.ts`, `investment-calculators.test.ts`, `regulated-calculators.test.ts`, `retirement-calculators.test.ts` |
| Finance application | `packages/finance/test/finance-application-service.test.ts` |
| Finance repositories | `packages/finance-memory/test/*.test.ts` |
| Shared calculator integration | `packages/calculators/test/integration-hardening.test.ts` |
| Web | `apps/web/tests/finance-*.test.tsx`, `calculator-hub.test.tsx`, and route tests |
| Expo | `apps/mobile/tests/finance-*.test.tsx` and `calculator-hub.test.tsx` |

The complete per-calculator inventory, formulas, assumptions, units, output fields, preset policy, examples, and test references are in [CALCULATOR_REFERENCE.md](CALCULATOR_REFERENCE.md).

## Remaining boundaries

This slice still uses volatile repositories and synthetic owners. It does not provide authentication, durable storage, synchronization, a bank connection, current government-rate feeds, current tax-law feeds, personalized advice, native device certification, or deployment. Those capabilities remain gated behind later phases.
