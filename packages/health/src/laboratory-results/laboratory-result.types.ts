import { z } from "@aperture/validation";
import { decimalStringSchema, isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const laboratoryResultIdSchema = ownerIdSchema;
export type LaboratoryResultId = Readonly<z.infer<typeof laboratoryResultIdSchema>>;

export const laboratoryResultValueSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("numeric"),
    value: decimalStringSchema,
    unit: textSchema,
  }),
  z.strictObject({
    kind: z.literal("text"),
    value: textSchema,
  })
]).readonly();
export type LaboratoryResultValue = Readonly<z.infer<typeof laboratoryResultValueSchema>>;

export const laboratoryResultSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: laboratoryResultIdSchema,
  testName: textSchema,
  result: laboratoryResultValueSchema,
  collectedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type LaboratoryResult = Readonly<z.infer<typeof laboratoryResultSchema>>;
