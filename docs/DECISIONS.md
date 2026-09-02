# Architectural decisions through Phase 2

## TypeScript-first shared domain

Education and Health are expressed as framework-independent TypeScript packages so future consumers can share stable domain vocabularies.

## No runtime code in completed phases

Phases 1 and 2 contain types, interfaces, ambient function declarations, explicit exports, and documentation only. They include no executable business behavior or placeholder implementations.

## ISO date strings at boundaries

Domain boundary dates use `IsoDateString` and date-times use `IsoDateTimeString`. Both are string aliases whose ISO formatting will be enforced only in a later, approved validation phase. Health observations and activities use the same ISO boundary convention.

## Decimal strings reserved for future financial values

Future financial values will use decimal strings at boundaries to avoid binary floating-point ambiguity. Phase 1 introduces no financial entities or calculations.

## Explicit units at health boundaries

Health, fitness, workout, and running quantities carry explicit structural units. This includes weight, height, distance, duration, pace, speed, heart rate, blood pressure, temperature, energy, hydration volume, nutrition mass, blood glucose, oxygen saturation, repetitions, and workout load. No conversion functions exist in Phase 2.

## Decimal strings where precision may matter

Health contract values that may require future decimal precision use the `DecimalString` boundary alias. Runtime parsing and validation remain deferred.

## User-recorded observations are not diagnoses

Symptoms, vital readings, laboratory results, body measurements, and recovery entries represent records supplied by a future user or source. Their structures do not classify, interpret, or diagnose health conditions.

## No medical recommendation logic

Phase 2 contains no medical, medication, nutrition, recovery, workout, or training recommendation behavior. Calculation contracts describe inputs and outputs without formulas, thresholds, or advice.

## Repository interfaces separated from implementations

Repository files define interfaces only. Repository contracts remain independent of storage, and storage-specific implementations remain outside the completed phase surfaces.

## Web, mobile, and backend code remain deferred

The Education and Health packages depend on no UI framework, mobile framework, server, API, authentication system, or database library. Web, mobile, and backend code remain deferred.

## Existing project retained as an archive

The existing Aperture project remains separate and untouched. Aperture v2 does not copy or import its source.

## Independent Git history

The v2 worktree is linked to the requested GitHub repository as `origin`, while Phase 1 is committed on the isolated `codex/aperture-v2` orphan branch. Existing remote history is not checked out, merged, replaced, or pushed during Phase 1.
