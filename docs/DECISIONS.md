# Architectural decisions through Phase 3

## TypeScript-first shared domain

Education, Health, and Finance are expressed as framework-independent TypeScript packages so future consumers can share stable domain vocabularies.

## No runtime code in completed phases

Phases 1 and 2 contain structural TypeScript contracts. Phase 3 strengthens this boundary by using only `.d.ts` Finance source files. All completed phases include no executable business behavior or placeholder implementations.

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

## Web, mobile, and backend code remain deferred

The Education, Health, and Finance packages depend on no UI framework, mobile framework, server, API, authentication system, or database library. Web, mobile, backend, persistence, and external financial integrations remain deferred.

## Existing project retained as an archive

The existing Aperture project remains separate and untouched. Aperture v2 does not copy or import its source.

## Independent Git history

The v2 worktree is linked to the requested GitHub repository as `origin`, while Phase 1 is committed on the isolated `codex/aperture-v2` orphan branch. Existing remote history is not checked out, merged, replaced, or pushed during Phase 1.
