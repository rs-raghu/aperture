import type { OwnerId, PageResult } from "../education.types.js";
import type { Grade, GradeId, GradesByCourseQuery, GradesBySemesterQuery, RecordGradeInput, UpdateGradeInput } from "./grade.types.js";
export type { GradesByCourseQuery, GradesBySemesterQuery, RecordGradeInput, UpdateGradeInput } from "./grade.types.js";
export declare function recordGrade(input: RecordGradeInput): Promise<Grade>;
export declare function updateGrade(id: GradeId, ownerId: OwnerId, input: UpdateGradeInput): Promise<Grade>;
export declare function deleteGrade(id: GradeId, ownerId: OwnerId): Promise<void>;
export declare function getGrade(id: GradeId, ownerId: OwnerId): Promise<Grade | null>;
export declare function listGradesByCourse(query: GradesByCourseQuery): Promise<PageResult<Grade>>;
export declare function listGradesBySemester(query: GradesBySemesterQuery): Promise<PageResult<Grade>>;
