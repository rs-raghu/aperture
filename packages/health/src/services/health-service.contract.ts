import { z } from "@aperture/validation";
import { appointmentSchema } from "../appointments/appointment.types.js";
import { equipmentUsageSummarySchema } from "../equipment/equipment.types.js";
import { dateRangeSchema, isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { durationValueSchema } from "../health-units.types.js";
import { healthMeasurementSchema } from "../measurements/health-measurement.types.js";
import { medicationIdSchema } from "../medications/medication.types.js";
import type { Appointment } from "../appointments/appointment.types.js";
import type { HydrationSummaryResult } from "../calculations/hydration-summary.contracts.js";
import type { RecoverySummaryResult } from "../calculations/recovery-summary.contracts.js";
import type { RunningSummaryResult } from "../calculations/running-summary.contracts.js";
import type { SleepSummaryResult } from "../calculations/sleep-summary.contracts.js";
import type { EquipmentId, EquipmentUsageSummary } from "../equipment/equipment.types.js";
import type { DateRange, IsoDateString, IsoDateTimeString, OwnerId } from "../health.types.js";
import type { DurationValue } from "../health-units.types.js";
import type { HealthMeasurement } from "../measurements/health-measurement.types.js";
import type { MedicationId } from "../medications/medication.types.js";

export interface HealthOverview {
  readonly latestMeasurementCount: number;
  readonly recentWorkoutCount: number;
  readonly upcomingAppointmentCount: number;
}

export const healthOverviewSchema = z.strictObject({
  latestMeasurementCount: z.number().finite().int().nonnegative(),
  recentWorkoutCount: z.number().finite().int().nonnegative(),
  upcomingAppointmentCount: z.number().finite().int().nonnegative(),
}).readonly();

export interface DailyHealthSummary {
  readonly date: IsoDateString;
  readonly measurementCount: number;
  readonly vitalReadingCount: number;
  readonly hydrationEntryCount: number;
  readonly nutritionEntryCount: number;
}

export const dailyHealthSummarySchema = z.strictObject({
  date: isoDateStringSchema,
  measurementCount: z.number().finite().int().nonnegative(),
  vitalReadingCount: z.number().finite().int().nonnegative(),
  hydrationEntryCount: z.number().finite().int().nonnegative(),
  nutritionEntryCount: z.number().finite().int().nonnegative(),
}).readonly();

export interface DateRangeSummaryQuery {
  readonly ownerId: OwnerId;
  readonly range: DateRange;
}

export const dateRangeSummaryQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();

export interface WorkoutSummary {
  readonly range: DateRange;
  readonly workoutCount: number;
  readonly completedWorkoutCount: number;
  readonly totalDuration?: DurationValue;
}

export const workoutSummarySchema = z.strictObject({
  range: dateRangeSchema,
  workoutCount: z.number().finite().int().nonnegative(),
  completedWorkoutCount: z.number().finite().int().nonnegative(),
  totalDuration: durationValueSchema.optional(),
}).readonly();

export interface UpcomingMedicationReminder {
  readonly medicationId: MedicationId;
  readonly medicationName: string;
  readonly scheduledAt: IsoDateTimeString;
}

export const upcomingMedicationReminderSchema = z.strictObject({
  medicationId: medicationIdSchema,
  medicationName: z.string().trim().min(1),
  scheduledAt: isoDateTimeStringSchema,
}).readonly();

export interface UpcomingItemsQuery {
  readonly ownerId: OwnerId;
  readonly before?: IsoDateTimeString;
  readonly limit?: number;
}

export const upcomingItemsQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  before: isoDateTimeStringSchema.optional(),
  limit: z.number().finite().int().min(1).max(100).optional(),
}).readonly();

export const latestMeasurementsResultSchema = z.array(healthMeasurementSchema).readonly();
export const upcomingMedicationRemindersResultSchema = z.array(upcomingMedicationReminderSchema).readonly();
export const upcomingAppointmentsResultSchema = z.array(appointmentSchema).readonly();
export { equipmentUsageSummarySchema };

export interface HealthService {
  getHealthOverview(ownerId: OwnerId): Promise<HealthOverview>;
  getLatestMeasurements(ownerId: OwnerId): Promise<readonly HealthMeasurement[]>;
  getDailyHealthSummary(ownerId: OwnerId, date: IsoDateString): Promise<DailyHealthSummary>;
  getSleepSummary(query: DateRangeSummaryQuery): Promise<SleepSummaryResult>;
  getHydrationSummary(query: DateRangeSummaryQuery): Promise<HydrationSummaryResult>;
  getWorkoutSummary(query: DateRangeSummaryQuery): Promise<WorkoutSummary>;
  getRunningSummary(query: DateRangeSummaryQuery): Promise<RunningSummaryResult>;
  getEquipmentUsageSummary(ownerId: OwnerId, equipmentId: EquipmentId): Promise<EquipmentUsageSummary>;
  getRecoverySummary(query: DateRangeSummaryQuery): Promise<RecoverySummaryResult>;
  getUpcomingMedicationReminders(query: UpcomingItemsQuery): Promise<readonly UpcomingMedicationReminder[]>;
  getUpcomingAppointments(query: UpcomingItemsQuery): Promise<readonly Appointment[]>;
}
