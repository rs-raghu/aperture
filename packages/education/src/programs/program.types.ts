import type { EntityMetadata, IsoDateString } from "../education.types.js";
import type { InstitutionId } from "../institutions/institution.types.js";

export type ProgramId = string;
export type ProgramStatus = "planned" | "active" | "completed" | "archived";

export interface AcademicProgram extends EntityMetadata {
  readonly id: ProgramId;
  readonly institutionId: InstitutionId;
  readonly name: string;
  readonly status: ProgramStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}
