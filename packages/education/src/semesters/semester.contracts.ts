import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { Semester, SemesterId, SemesterStatus } from "./semester.types.js";

export interface CreateSemesterInput {
  readonly ownerId: OwnerId;
  readonly programId: ProgramId;
  readonly name: string;
  readonly startsOn: IsoDateString;
  readonly endsOn: IsoDateString;
}

export interface UpdateSemesterInput {
  readonly name?: string;
  readonly status?: SemesterStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}

export interface SemesterListQuery extends OwnerQuery {
  readonly programId?: ProgramId;
  readonly status?: SemesterStatus;
}

export declare function createSemester(input: CreateSemesterInput): Promise<Semester>;
export declare function updateSemester(id: SemesterId, ownerId: OwnerId, input: UpdateSemesterInput): Promise<Semester>;
export declare function activateSemester(id: SemesterId, ownerId: OwnerId): Promise<Semester>;
export declare function completeSemester(id: SemesterId, ownerId: OwnerId): Promise<Semester>;
export declare function getSemester(id: SemesterId, ownerId: OwnerId): Promise<Semester | null>;
export declare function listSemesters(query: SemesterListQuery): Promise<PageResult<Semester>>;
