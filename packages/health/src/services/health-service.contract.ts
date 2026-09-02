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

export interface DailyHealthSummary {
  readonly date: IsoDateString;
  readonly measurementCount: number;
  readonly vitalReadingCount: number;
  readonly hydrationEntryCount: number;
  readonly nutritionEntryCount: number;
}

export interface DateRangeSummaryQuery {
  readonly ownerId: OwnerId;
  readonly range: DateRange;
}

export interface WorkoutSummary {
  readonly range: DateRange;
  readonly workoutCount: number;
  readonly completedWorkoutCount: number;
  readonly totalDuration?: DurationValue;
}

export interface UpcomingMedicationReminder {
  readonly medicationId: MedicationId;
  readonly medicationName: string;
  readonly scheduledAt: IsoDateTimeString;
}

export interface UpcomingItemsQuery {
  readonly ownerId: OwnerId;
  readonly before?: IsoDateTimeString;
  readonly limit?: number;
}

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
