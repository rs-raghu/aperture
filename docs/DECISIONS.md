# Phase 1 architectural decisions

## TypeScript-first shared domain

Education is expressed as a framework-independent TypeScript package so future consumers can share one domain vocabulary.

## No runtime code in Phase 1

Phase 1 contains types, interfaces, and ambient function declarations only. It includes no executable business behavior or placeholder implementations.

## ISO date strings at boundaries

Domain boundary dates use `IsoDateString` and date-times use `IsoDateTimeString`. Both are string aliases whose ISO formatting will be enforced only in a later, approved validation phase.

## Decimal strings reserved for future financial values

Future financial values will use decimal strings at boundaries to avoid binary floating-point ambiguity. Phase 1 introduces no financial entities or calculations.

## Repository interfaces separated from implementations

Repository files define interfaces only. Storage-specific implementations remain outside this phase and package surface.

## No frontend or backend dependency yet

The Education package depends on neither a UI framework nor a server, API, authentication, or database library.

## Existing project retained as an archive

The existing Aperture project remains separate and untouched. Aperture v2 does not copy or import its source.

## Independent Git history

The v2 worktree is linked to the requested GitHub repository as `origin`, while Phase 1 is committed on the isolated `codex/aperture-v2` orphan branch. Existing remote history is not checked out, merged, replaced, or pushed during Phase 1.
