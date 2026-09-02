import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";

export type AppointmentId = string;
export type AppointmentStatus = "scheduled" | "cancelled" | "completed";

export interface Appointment extends EntityMetadata {
  readonly id: AppointmentId;
  readonly title: string;
  readonly status: AppointmentStatus;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}
