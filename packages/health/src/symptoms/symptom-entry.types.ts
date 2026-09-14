import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const symptomEntryIdSchema = ownerIdSchema;
export type SymptomEntryId = Readonly<z.infer<typeof symptomEntryIdSchema>>;

export const symptomSeveritySchema = z.strictObject({
  value: z.number().finite().min(0).max(10),
  scale: z.literal("zero_to_ten"),
}).readonly();
export type SymptomSeverity = Readonly<z.infer<typeof symptomSeveritySchema>>;

export const symptomEntrySchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: symptomEntryIdSchema,
  observation: textSchema,
  severity: symptomSeveritySchema.optional(),
  observedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type SymptomEntry = Readonly<z.infer<typeof symptomEntrySchema>>;
