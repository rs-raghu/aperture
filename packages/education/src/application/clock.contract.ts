import type { IsoDateTimeString } from "../education.types.js";

export interface EducationClock {
  now(): IsoDateTimeString;
}
