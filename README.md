# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

Phase 5 implements runtime Education models and structural validation for all 14 Education entities. Phase 6 implements seven Education academic calculators. Health and Finance remain declaration-only. Phase 4's Next.js web and Expo mobile workspaces remain structural skeletons.

Education objects can be parsed with strict Zod schemas, and the GPA, CGPA, weighted-grade, grade-projection, required-score, count-based attendance, and degree-progress calculators are available as pure functions. Education CRUD operations remain non-functional. There are no repository implementations, services, pages, screens, route handlers, components, authentication, database clients, synchronization, or API requests. Aperture v2 is not an application and is not runnable yet.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 6 implements Education calculations only. Phase 7 has not started.

## Structural verification

```bash
npm install
npm run typecheck
npm test
npm run build --workspace @aperture/validation
npm run build --workspace @aperture/education
```

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md). Phase 6 formulas and policies are documented in [Education calculations](docs/EDUCATION_CALCULATIONS.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
