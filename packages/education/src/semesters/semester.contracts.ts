import type { OwnerId, PageResult } from "../education.types.js";
import type { CreateSemesterInput, Semester, SemesterId, SemesterListQuery, UpdateSemesterInput } from "./semester.types.js";
export type { CreateSemesterInput, SemesterListQuery, UpdateSemesterInput } from "./semester.types.js";
export declare function createSemester(input: CreateSemesterInput): Promise<Semester>;
export declare function updateSemester(id: SemesterId, ownerId: OwnerId, input: UpdateSemesterInput): Promise<Semester>;
export declare function activateSemester(id: SemesterId, ownerId: OwnerId): Promise<Semester>;
export declare function completeSemester(id: SemesterId, ownerId: OwnerId): Promise<Semester>;
export declare function getSemester(id: SemesterId, ownerId: OwnerId): Promise<Semester | null>;
export declare function listSemesters(query: SemesterListQuery): Promise<PageResult<Semester>>;
