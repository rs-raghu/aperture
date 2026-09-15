import { z } from "@aperture/validation";
import { hydrationVolumeValueSchema } from "../health-units.types.js";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";

export const recordHydrationInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  volume: hydrationVolumeValueSchema,
  consumedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordHydrationInput = Readonly<z.infer<typeof recordHydrationInputSchema>>;

export const updateHydrationEntryInputSchema = z.strictObject({
  volume: hydrationVolumeValueSchema.optional(),
  consumedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateHydrationEntryInput = Readonly<z.infer<typeof updateHydrationEntryInputSchema>>;

export const hydrationEntryListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type HydrationEntryListQuery = Readonly<z.infer<typeof hydrationEntryListQuerySchema>>;

export const hydrationEntriesByDateQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  date: isoDateStringSchema,
}).readonly();
export type HydrationEntriesByDateQuery = Readonly<z.infer<typeof hydrationEntriesByDateQuerySchema>>;
