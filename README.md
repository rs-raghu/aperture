# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

Phase 5 implements runtime Education models and structural validation for all 14 Education entities. Health and Finance remain declaration-only. Phase 4's Next.js web and Expo mobile workspaces remain structural skeletons.

Education objects can now be parsed with strict Zod schemas, but Education operations are still non-functional. There are no calculations, repository implementations, services, pages, screens, route handlers, components, authentication, database clients, synchronization, or API requests. Aperture v2 is not an application and is not runnable yet.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 5 implements models and validation only. Phase 6 has not started.

## Structural verification

```bash
npm install
npm run typecheck
npm test
npm run build --workspace @aperture/validation
npm run build --workspace @aperture/education
```

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
