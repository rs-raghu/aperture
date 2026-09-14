import { z } from "@aperture/validation";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate, orderedDates } from "../internal/validation.helpers.js";
import { medicationIdSchema, medicationStatusSchema } from "./medication.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { MedicationLog, MedicationLogId } from "./medication-log.types.js";
import type { Medication, MedicationId } from "./medication.types.js";

export const createMedicationInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  name: textSchema,
  startedOn: isoDateStringSchema.optional(),
  endedOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedDates(value.startedOn, value.endedOn), { message: "End date must not be earlier than start date.", path: ["endedOn"] }).readonly();
export type CreateMedicationInput = Readonly<z.infer<typeof createMedicationInputSchema>>;

export const updateMedicationInputSchema = z.strictObject({
  name: textSchema.optional(),
  status: medicationStatusSchema.optional(),
  startedOn: isoDateStringSchema.optional(),
  endedOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedDates(value.startedOn, value.endedOn), { message: "End date must not be earlier than start date.", path: ["endedOn"] })
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateMedicationInput = Readonly<z.infer<typeof updateMedicationInputSchema>>;

export const medicationListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  status: medicationStatusSchema.optional(),
}).readonly();
export type MedicationListQuery = Readonly<z.infer<typeof medicationListQuerySchema>>;

export const recordMedicationLogInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  medicationId: medicationIdSchema,
  scheduledAt: isoDateTimeStringSchema.optional(),
  recordedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordMedicationLogInput = Readonly<z.infer<typeof recordMedicationLogInputSchema>>;

export const updateMedicationLogInputSchema = z.strictObject({
  scheduledAt: isoDateTimeStringSchema.optional(),
  recordedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateMedicationLogInput = Readonly<z.infer<typeof updateMedicationLogInputSchema>>;

export const medicationLogListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  medicationId: medicationIdSchema.optional(),
}).readonly();
export type MedicationLogListQuery = Readonly<z.infer<typeof medicationLogListQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createMedication(input: CreateMedicationInput): Promise<Medication>;
export declare function updateMedication(id: MedicationId, ownerId: OwnerId, input: UpdateMedicationInput): Promise<Medication>;
export declare function archiveMedication(id: MedicationId, ownerId: OwnerId): Promise<Medication>;
export declare function getMedication(id: MedicationId, ownerId: OwnerId): Promise<Medication | null>;
export declare function listMedications(query: MedicationListQuery): Promise<PageResult<Medication>>;
export declare function recordMedicationTaken(input: RecordMedicationLogInput): Promise<MedicationLog>;
export declare function recordMedicationSkipped(input: RecordMedicationLogInput): Promise<MedicationLog>;
export declare function updateMedicationLog(id: MedicationLogId, ownerId: OwnerId, input: UpdateMedicationLogInput): Promise<MedicationLog>;
export declare function listMedicationLogs(query: MedicationLogListQuery): Promise<PageResult<MedicationLog>>;
