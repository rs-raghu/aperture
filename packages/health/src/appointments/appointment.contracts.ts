import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { Appointment, AppointmentId, AppointmentStatus } from "./appointment.types.js";

export interface CreateAppointmentInput {
  readonly ownerId: OwnerId;
  readonly title: string;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}
export interface UpdateAppointmentInput {
  readonly title?: string;
  readonly status?: AppointmentStatus;
  readonly startsAt?: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}
export interface AppointmentListQuery extends OwnerQuery {
  readonly status?: AppointmentStatus;
}
export interface UpcomingAppointmentsQuery extends OwnerQuery {
  readonly startsBefore?: IsoDateTimeString;
}

export declare function createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
export declare function updateAppointment(id: AppointmentId, ownerId: OwnerId, input: UpdateAppointmentInput): Promise<Appointment>;
export declare function cancelAppointment(id: AppointmentId, ownerId: OwnerId): Promise<Appointment>;
export declare function completeAppointment(id: AppointmentId, ownerId: OwnerId): Promise<Appointment>;
export declare function getAppointment(id: AppointmentId, ownerId: OwnerId): Promise<Appointment | null>;
export declare function listAppointments(query: AppointmentListQuery): Promise<PageResult<Appointment>>;
export declare function listUpcomingAppointments(query: UpcomingAppointmentsQuery): Promise<PageResult<Appointment>>;
