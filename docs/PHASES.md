# Aperture v2 phases

This plan records boundaries, not implementation promises. Work beyond an explicitly approved phase remains uncommitted scope.

## Phase 1 — Education domain skeleton

Phase 1 establishes the npm workspace, shared strict TypeScript configuration, the `@aperture/education` package, entity shapes, operation declarations, repository interfaces, calculation declarations, a service interface, public exports, and documentation.

All code in this phase is structural. Declarations describe a future API but do not provide runtime behavior.

## Phase 1 exclusions

Phase 1 excludes frontend and mobile frameworks, UI components, backend frameworks, API routes, authentication, database clients or migrations, runtime repositories, validation, business calculations, mock or seed data, business-behavior tests, Python, Docker, and deployment work.

## Possible future phases

- **Phase 2:** Define approved runtime validation and domain behavior while preserving the Phase 1 public boundary.
- **Phase 3:** Add approved persistence and application adapters, then integrate selected clients or APIs.
- **Phase 4:** Add approved delivery hardening such as behavior tests, observability, security review, and deployment preparation.

These summaries identify planning categories only. They neither authorize the work nor promise particular technologies or delivery dates.
