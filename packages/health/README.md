# @aperture/health

Phase 12 provides platform-neutral Health models, structural validation, and the complete set of 11 approved Health calculations. All 22 principal entities have stored, create/record, and update schemas. Units, identifiers, statuses, quantities, recorded scales, model queries, calculation inputs, and calculation results are validated at runtime.

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

Root imports expose implemented schemas, calculations, and public types. Calculations also have a focused `@aperture/health/calculations` entry. Deferred lifecycle operation signatures remain available through the types-only `@aperture/health/contracts` entry and cannot be called at runtime. Service behavior, repositories, UI, persistence, and integrations remain unimplemented.

From the workspace root:

```sh
npm test --workspace @aperture/health
npm run typecheck --workspace @aperture/health
npm run lint --workspace @aperture/health
npm run build --workspace @aperture/health
```

The build excludes browser and Node ambient globals. Health lint checks strict TypeScript plus unused locals and parameters. Tests import only the public Health package and use synthetic fixtures.

See [the complete model, declaration, and verification inventory](../../docs/HEALTH_MODELS_VALIDATION.md) and [the formula, conversion, and safety reference](../../docs/HEALTH_CALCULATIONS.md).
