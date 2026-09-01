import type { EntityMetadata, IsoDateString } from "../education.types.js";
import type { ProgramId } from "../programs/program.types.js";

export type SemesterId = string;
export type SemesterStatus = "planned" | "active" | "completed";

export interface Semester extends EntityMetadata {
  readonly id: SemesterId;
  readonly programId: ProgramId;
  readonly name: string;
  readonly status: SemesterStatus;
  readonly startsOn: IsoDateString;
  readonly endsOn: IsoDateString;
}
