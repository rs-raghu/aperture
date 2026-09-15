import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { laboratoryResultValueSchema } from "./laboratory-result.types.js";

export const recordLaboratoryResultInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  testName: textSchema,
  result: laboratoryResultValueSchema,
  collectedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordLaboratoryResultInput = Readonly<z.infer<typeof recordLaboratoryResultInputSchema>>;

export const updateLaboratoryResultInputSchema = z.strictObject({
  testName: textSchema.optional(),
  result: laboratoryResultValueSchema.optional(),
  collectedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateLaboratoryResultInput = Readonly<z.infer<typeof updateLaboratoryResultInputSchema>>;

export const laboratoryResultListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type LaboratoryResultListQuery = Readonly<z.infer<typeof laboratoryResultListQuerySchema>>;
