import type { OwnerId, PageResult } from "../education.types.js";
import type { Course, CourseId, CourseListQuery, CoursesBySemesterQuery, CreateCourseInput, UpdateCourseInput } from "./course.types.js";
export type { CourseListQuery, CoursesBySemesterQuery, CreateCourseInput, UpdateCourseInput } from "./course.types.js";
export declare function createCourse(input: CreateCourseInput): Promise<Course>;
export declare function updateCourse(id: CourseId, ownerId: OwnerId, input: UpdateCourseInput): Promise<Course>;
export declare function archiveCourse(id: CourseId, ownerId: OwnerId): Promise<Course>;
export declare function getCourse(id: CourseId, ownerId: OwnerId): Promise<Course | null>;
export declare function listCourses(query: CourseListQuery): Promise<PageResult<Course>>;
export declare function listCoursesBySemester(query: CoursesBySemesterQuery): Promise<PageResult<Course>>;
