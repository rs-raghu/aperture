import type { CrudRepository } from "../repositories/repository.types.js";
import type { ScheduleStudySessionInput, StudySessionListQuery, UpdateStudySessionInput } from "./study-session.contracts.js";
import type { StudySession, StudySessionId } from "./study-session.types.js";

export interface StudySessionRepository
  extends CrudRepository<StudySession, StudySessionId, ScheduleStudySessionInput, UpdateStudySessionInput, StudySessionListQuery> {
  start(id: StudySessionId, ownerId: string, startedAt: string): Promise<StudySession>;
  complete(id: StudySessionId, ownerId: string, completedAt: string): Promise<StudySession>;
  cancel(id: StudySessionId, ownerId: string): Promise<StudySession>;
}
