# @aperture/health

Phase 13 provides platform-neutral Health models, structural validation, the complete set of 11 approved calculations, and a dependency-injected application service. All 22 principal entities have stored, create/record, and update schemas. Units, identifiers, statuses, quantities, recorded scales, model queries, calculation inputs, calculation results, and service summaries are validated at runtime.

```ts
import { recordHydrationInputSchema } from "@aperture/health";
import { validateInput } from "@aperture/validation";

const result = validateInput(recordHydrationInputSchema, {
  ownerId: "synthetic-owner-1",
  volume: { value: "250.00", unit: "milliliter" },
  consumedAt: "2040-01-01T12:00:00Z",
});
```

Schemas preserve recorded decimal precision and units. `.parse()` throws ZodError; `.safeParse()` and shared `validateInput` return structured results. Unknown fields and null reject; omitted optional values remain optional. Calculators use decimal arithmetic, explicit unit conversion, and a deterministic 12-place half-up output policy. They do not interpret, diagnose, recommend, generate identifiers/timestamps, access storage, or consult the current time.

Root imports expose implemented schemas, calculations, application services, errors, and public types. Calculations also have a focused `@aperture/health/calculations` entry, and service composition is available through `@aperture/health/application`. The 126 lifecycle declarations now have implementations. Combined with 11 summaries and one overlapping equipment-summary method, `createHealthService` exposes 136 unique runtime methods. The types-only `@aperture/health/contracts` entry remains a compatibility alias for implemented public types.

The service requires repository interfaces, a clock, and an ID generator. It validates inputs and repository results, applies owner scoping and relationship ownership, performs explicit lifecycle transitions, and orchestrates Phase 12 calculations. Repository implementations, UI, persistence, authentication, notifications, and integrations remain unimplemented.

From the workspace root:

```sh
npm test --workspace @aperture/health
npm run typecheck --workspace @aperture/health
npm run lint --workspace @aperture/health
npm run build --workspace @aperture/health
```

The build excludes browser and Node ambient globals. Health lint checks strict TypeScript plus unused locals and parameters. Tests import only the public Health package and use synthetic fixtures.

See [the complete model, declaration, and verification inventory](../../docs/HEALTH_MODELS_VALIDATION.md), [the formula, conversion, and safety reference](../../docs/HEALTH_CALCULATIONS.md), and [the service, ownership, lifecycle, and error reference](../../docs/HEALTH_SERVICES.md).
