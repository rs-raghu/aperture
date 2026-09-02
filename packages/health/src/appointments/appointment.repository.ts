import type { CrudRepository } from "../repositories/repository.types.js";
import type { AppointmentListQuery, CreateAppointmentInput, UpdateAppointmentInput } from "./appointment.contracts.js";
import type { Appointment, AppointmentId } from "./appointment.types.js";

export interface AppointmentRepository
  extends CrudRepository<Appointment, AppointmentId, CreateAppointmentInput, UpdateAppointmentInput, AppointmentListQuery> {}
