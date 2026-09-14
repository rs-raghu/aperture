import { z } from "@aperture/validation";
import { hydrationVolumeValueSchema } from "../health-units.types.js";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { HydrationEntry, HydrationEntryId } from "./hydration-entry.types.js";

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

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordHydration(input: RecordHydrationInput): Promise<HydrationEntry>;
export declare function updateHydrationEntry(id: HydrationEntryId, ownerId: OwnerId, input: UpdateHydrationEntryInput): Promise<HydrationEntry>;
export declare function deleteHydrationEntry(id: HydrationEntryId, ownerId: OwnerId): Promise<void>;
export declare function getHydrationEntry(id: HydrationEntryId, ownerId: OwnerId): Promise<HydrationEntry | null>;
export declare function listHydrationEntries(query: HydrationEntryListQuery): Promise<PageResult<HydrationEntry>>;
export declare function listHydrationEntriesByDate(query: HydrationEntriesByDateQuery): Promise<PageResult<HydrationEntry>>;
