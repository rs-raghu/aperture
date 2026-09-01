import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { TopicId } from "../topics/topic.types.js";
import type { Assignment, AssignmentId, AssignmentStatus } from "./assignment.types.js";

export interface CreateAssignmentInput {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
  readonly topicId?: TopicId;
  readonly title: string;
  readonly dueAt?: IsoDateTimeString;
}

export interface UpdateAssignmentInput {
  readonly topicId?: TopicId;
  readonly title?: string;
  readonly status?: AssignmentStatus;
  readonly dueAt?: IsoDateTimeString;
}

export interface AssignmentListQuery extends OwnerQuery {
  readonly courseId?: CourseId;
  readonly status?: AssignmentStatus;
}

export interface UpcomingAssignmentsQuery extends AssignmentListQuery {
  readonly dueBefore?: IsoDateTimeString;
}

export interface SubmitAssignmentInput {
  readonly assignmentId: AssignmentId;
  readonly ownerId: OwnerId;
  readonly submittedAt: IsoDateTimeString;
}

export declare function createAssignment(input: CreateAssignmentInput): Promise<Assignment>;
export declare function updateAssignment(id: AssignmentId, ownerId: OwnerId, input: UpdateAssignmentInput): Promise<Assignment>;
export declare function submitAssignment(input: SubmitAssignmentInput): Promise<Assignment>;
export declare function markAssignmentComplete(id: AssignmentId, ownerId: OwnerId): Promise<Assignment>;
export declare function getAssignment(id: AssignmentId, ownerId: OwnerId): Promise<Assignment | null>;
export declare function listAssignments(query: AssignmentListQuery): Promise<PageResult<Assignment>>;
export declare function getUpcomingAssignments(query: UpcomingAssignmentsQuery): Promise<PageResult<Assignment>>;
