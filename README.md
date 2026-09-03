# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

The Phase 1 Education, Phase 2 Health, and Phase 3 Finance packages contain declarations only. Phase 4 adds structural Next.js web and Expo mobile workspaces plus declaration-only platform, data-access, validation, calculator-registry, formatting, configuration, and feature-registry packages.

Nothing is functional. The web and mobile applications are skeletons only: they have no pages, screens, route handlers, components, authentication, database clients, repositories, validation behavior, formulas, synchronization, or API requests. Aperture v2 is not runnable yet.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 4 is structurally complete after verification. Phase 5 has not started, and no implementation phase is underway.

## Structural verification

```bash
npm install
npm run typecheck
```

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
