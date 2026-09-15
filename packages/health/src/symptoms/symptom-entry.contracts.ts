import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { symptomSeveritySchema } from "./symptom-entry.types.js";

export const recordSymptomInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  observation: textSchema,
  severity: symptomSeveritySchema.optional(),
  observedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordSymptomInput = Readonly<z.infer<typeof recordSymptomInputSchema>>;

export const updateSymptomEntryInputSchema = z.strictObject({
  observation: textSchema.optional(),
  severity: symptomSeveritySchema.optional(),
  observedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateSymptomEntryInput = Readonly<z.infer<typeof updateSymptomEntryInputSchema>>;

export const symptomEntryListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type SymptomEntryListQuery = Readonly<z.infer<typeof symptomEntryListQuerySchema>>;
