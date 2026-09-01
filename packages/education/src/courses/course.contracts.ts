import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { SemesterId } from "../semesters/semester.types.js";
import type { Course, CourseId, CourseStatus } from "./course.types.js";

export interface CreateCourseInput {
  readonly ownerId: OwnerId;
  readonly programId: ProgramId;
  readonly semesterId?: SemesterId;
  readonly code?: string;
  readonly title: string;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}

export interface UpdateCourseInput {
  readonly semesterId?: SemesterId;
  readonly code?: string;
  readonly title?: string;
  readonly status?: CourseStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}

export interface CourseListQuery extends OwnerQuery {
  readonly programId?: ProgramId;
  readonly semesterId?: SemesterId;
  readonly status?: CourseStatus;
}

export interface CoursesBySemesterQuery extends OwnerQuery {
  readonly semesterId: SemesterId;
}

export declare function createCourse(input: CreateCourseInput): Promise<Course>;
export declare function updateCourse(id: CourseId, ownerId: OwnerId, input: UpdateCourseInput): Promise<Course>;
export declare function archiveCourse(id: CourseId, ownerId: OwnerId): Promise<Course>;
export declare function getCourse(id: CourseId, ownerId: OwnerId): Promise<Course | null>;
export declare function listCourses(query: CourseListQuery): Promise<PageResult<Course>>;
export declare function listCoursesBySemester(query: CoursesBySemesterQuery): Promise<PageResult<Course>>;
