# Architectural decisions through Phase 7

## TypeScript-first shared domain

Education, Health, and Finance are expressed as framework-independent TypeScript packages so future consumers can share stable domain vocabularies.

## Runtime code is limited to the approved Education layers

Phase 5 introduced Education schemas and shared validation. Phase 6 added seven calculators. Phase 7 adds Education workflows and summaries through an injected service. Repositories remain interfaces. Health, Finance, and application skeleton behavior remain unchanged.

## Application dependencies are explicit

Education workflows receive repositories, a clock, and an ID generator through `createEducationService`. They never select production adapters, read global time, generate random IDs, read environment variables, or keep mutable module state. Authentication remains deferred, but every public workflow receives an owner context and scopes repository access to it.

## Lifecycle and deletion policy

Archives are idempotent state transitions and never cascades. Institution archival is blocked by active programs; Program archival is blocked by an active semester. Grade, Attendance, Schedule Entry, and Certificate deletion are owner-scoped, non-idempotent hard deletes. Lifecycle methods, not repositories, enforce transitions.

## Deterministic application summaries

Lists and combined deadlines use stable domain-key ordering with entity ID as the tie-breaker. Course progress exposes topic and assignment completion separately. Missing study duration and grade-point data remain explicit. Academic and attendance summaries call Phase 6 calculators rather than duplicating formulas.

## Zod supplies structural validation

`@aperture/validation` owns the Zod dependency and exposes a narrow schema/result boundary. Education depends on Validation; Validation never depends on Education. Zod is not used for repository existence, ownership, calculations, UI behavior, or persistence.

## UUID identifiers

Education owner and entity identifiers use UUID-compatible strings to align with a future PostgreSQL UUID design. Runtime validation checks syntax only and does not assert record existence or ownership.

## Calendar-valid dates and explicit-zone timestamps

Education date-only values use real `YYYY-MM-DD` calendar dates. Timestamps require RFC 3339 form with `Z` or an explicit numeric offset. Schemas preserve strings and never localize or convert boundary values.

## Education decimal strings and arithmetic

Education scores, credits, percentages, grade points, and goal values use normalized decimal strings. Structural schemas reject scientific notation, symbols, commas, non-finite tokens, and prohibited negative values. Academic arithmetic uses `decimal.js`; JavaScript floating-point numbers are not used for grade, credit, percentage, or weighted-score arithmetic.

## Academic rounding and policy choices

Calculator outputs retain an exact normalized value and a rounded display value. The documented default is two decimal places with half-up rounding; callers may select half-up, half-even, down, or up. Intermediate values are not rounded. GPA scales are caller-configurable. Zero-credit GPA courses reject by default and may be explicitly excluded. Extra credit and total weight above 100 reject unless explicitly enabled. Excused attendance always requires an explicit policy. Transfer credits count toward degree progress only when explicitly enabled.

## Runtime-safe Education exports

The default, `/models`, `/calculations`, and `/application` entry points expose only implemented runtime values plus type contracts. Former ambient operation functions were removed. Repository and dependency contracts are type-only; no production adapter is emitted.

## ISO date strings at boundaries

Domain boundary dates use `IsoDateString` and date-times use `IsoDateTimeString`. Both are string aliases whose ISO formatting will be enforced only in a later, approved validation phase. Health observations and activities use the same ISO boundary convention.

## Decimal strings reserved for future financial values

Future financial values will use decimal strings at boundaries to avoid binary floating-point ambiguity. Phase 1 introduces no financial entities or calculations.

## Explicit units at health boundaries

Health, fitness, workout, and running quantities carry explicit structural units. This includes weight, height, distance, duration, pace, speed, heart rate, blood pressure, temperature, energy, hydration volume, nutrition mass, blood glucose, oxygen saturation, repetitions, and workout load. No conversion functions exist in Phase 2.

## Decimal strings where precision may matter

Health contract values that may require future decimal precision use the `DecimalString` boundary alias. Runtime parsing and validation remain deferred.

## Money represented as decimal strings with currency

Finance uses `DecimalString` for monetary amounts, quantities, prices, percentages, interest rates, and calculated financial results. Every monetary value is represented by `Money`, which always carries a `CurrencyCode`. JavaScript `number` is reserved for integral counts and sequence positions.

## Percentage and interest-rate convention

Finance boundary percentages and rates use human percentage strings: `"8.5"` means 8.5%, never the decimal fraction `"0.085"`. `Percentage` and `InterestRate` carry an explicit `human_percentage` representation marker; interest rates also state their period.

## Finance dates and timestamps

Finance dates and timestamps use the `IsoDate` and `IsoDateTime` string aliases. Runtime format validation remains deferred.

## Financial calculations remain unimplemented

The 36 Finance calculator contracts define inputs, results, units, estimate status, versions, assumptions, warnings, and source references without arithmetic or formulas.

## Rule-based calculators require provenance

Future rule-based calculator implementations must identify their version, effective assumptions, and source references. Phase 3 records placeholders only and contains no current tax, legal, interest-rate, or government-scheme rules.

## No financial advice or recommendations

Finance contracts record user-supplied data and describe neutral outputs. They contain no financial advice, buy/sell recommendations, market opinions, or legal conclusions.

## User-recorded observations are not diagnoses

Symptoms, vital readings, laboratory results, body measurements, and recovery entries represent records supplied by a future user or source. Their structures do not classify, interpret, or diagnose health conditions.

## No medical recommendation logic

Phase 2 contains no medical, medication, nutrition, recovery, workout, or training recommendation behavior. Calculation contracts describe inputs and outputs without formulas, thresholds, or advice.

## Repository interfaces separated from implementations

Repository files define interfaces only. Repository contracts remain independent of storage, and storage-specific implementations remain outside the completed phase surfaces.

## Web and mobile are separate application shells

Next.js App Router is the future web platform and Expo Router with React Native is the future mobile platform. Phase 4 registers compatible dependencies and reserves route directories but creates no executable page, screen, layout, component, hook, or handler.

## Shared packages remain application-neutral

Platform, data-access, validation, calculator-registry, formatting, configuration, and feature-registry contracts are framework-neutral. Application packages may consume shared contracts in future phases; shared packages must not import web or mobile code.

## Public and server-only configuration are distinct

Public web and mobile values are explicitly separated from server-only service-role keys, owner bootstrap settings, and integration credentials. Phase 4 example files contain variable names and comments only, and no code reads environment variables.

## Authentication and personal-data ownership

Supabase Auth is the planned identity provider. Public signup will eventually be disabled. Every future personal-data table must enforce owner-based Row Level Security before use. Phase 4 contains signatures only and no authentication or policy behavior.

## Storage-neutral data access

Generic data-access contracts do not mention Supabase. Future provider adapters will implement those contracts without leaking storage details into domain or application surfaces.

## Modular monolith, not runtime plugins

The feature registry describes Today, Education, Health, Finance, Calculators, and Settings through static metadata contracts. It does not scan files, load code dynamically, install plugins, or provide enterprise organization/authorization behavior.

## Platform implementation remains deferred

The Education, Health, and Finance packages depend on no UI framework, mobile framework, server, API, authentication system, or database library. Phase 4 dependencies belong only to their application workspaces. Web/mobile behavior, persistence, authentication, SQL, and provider integrations remain deferred.

## Future Supabase boundary

Supabase PostgreSQL and Auth are the planned backend. Database implementation begins no earlier than Phase 26. Phase 4 creates only documented migration, function, and test directories; it contains no executable SQL or client.

## Existing project retained as an archive

The existing Aperture project remains separate and untouched. Aperture v2 does not copy or import its source.

## Independent Git history

The v2 worktree is linked to the requested GitHub repository as `origin`, while Phase 1 is committed on the isolated `codex/aperture-v2` orphan branch. Existing remote history is not checked out, merged, replaced, or pushed during Phase 1.
