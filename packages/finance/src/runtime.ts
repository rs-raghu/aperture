import { z } from "@aperture/validation";

export type * from "./generated/finance.types.js";
export * from "./generated/finance.schemas.js";
export * from "./calculators/foundation/index.js";
export * from "./calculators/investments/index.js";

export function pageResultSchema<TEntity>(itemSchema: z.ZodType<TEntity>) {
  return z.strictObject({
    items: z.array(itemSchema).readonly(),
    nextCursor: z.string().trim().min(1).max(1_024).optional(),
  }).readonly();
}
