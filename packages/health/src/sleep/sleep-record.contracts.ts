import { z } from "@aperture/validation";
import { durationValueSchema } from "../health-units.types.js";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate, orderedInstants } from "../internal/validation.helpers.js";
import { sleepQualitySchema } from "./sleep-record.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { SleepRecord, SleepRecordId } from "./sleep-record.types.js";

export const recordSleepInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  startedAt: isoDateTimeStringSchema,
  endedAt: isoDateTimeStringSchema,
  duration: durationValueSchema.optional(),
  quality: sleepQualitySchema.optional(),
})
  .refine((value) => orderedInstants(value.startedAt, value.endedAt), { message: "End time must not be earlier than start time.", path: ["endedAt"] }).readonly();
export type RecordSleepInput = Readonly<z.infer<typeof recordSleepInputSchema>>;

export const updateSleepInputSchema = z.strictObject({
  startedAt: isoDateTimeStringSchema.optional(),
  endedAt: isoDateTimeStringSchema.optional(),
  duration: durationValueSchema.optional(),
  quality: sleepQualitySchema.optional(),
})
  .refine((value) => orderedInstants(value.startedAt, value.endedAt), { message: "End time must not be earlier than start time.", path: ["endedAt"] })
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateSleepInput = Readonly<z.infer<typeof updateSleepInputSchema>>;

export const sleepRecordListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type SleepRecordListQuery = Readonly<z.infer<typeof sleepRecordListQuerySchema>>;

export const sleepRecordsByDateRangeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();
export type SleepRecordsByDateRangeQuery = Readonly<z.infer<typeof sleepRecordsByDateRangeQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordSleep(input: RecordSleepInput): Promise<SleepRecord>;
export declare function updateSleep(id: SleepRecordId, ownerId: OwnerId, input: UpdateSleepInput): Promise<SleepRecord>;
export declare function deleteSleep(id: SleepRecordId, ownerId: OwnerId): Promise<void>;
export declare function getSleepRecord(id: SleepRecordId, ownerId: OwnerId): Promise<SleepRecord | null>;
export declare function listSleepRecords(query: SleepRecordListQuery): Promise<PageResult<SleepRecord>>;
export declare function listSleepRecordsByDateRange(query: SleepRecordsByDateRangeQuery): Promise<PageResult<SleepRecord>>;
