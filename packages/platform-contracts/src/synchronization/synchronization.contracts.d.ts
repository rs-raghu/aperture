import type { PlatformOwnerId } from "../platform.types.js";
import type {
  SynchronizationEvent,
  SynchronizationEventQuery,
  SynchronizationRequest,
  SynchronizationScope,
  SynchronizationStatus
} from "./synchronization.types.js";

export declare function getSynchronizationStatus(
  ownerId: PlatformOwnerId,
  scope: SynchronizationScope
): Promise<SynchronizationStatus>;
export declare function requestSynchronization(
  input: SynchronizationRequest
): Promise<SynchronizationStatus>;
export declare function recordSynchronizationSuccess(
  input: SynchronizationRequest
): Promise<SynchronizationEvent>;
export declare function recordSynchronizationFailure(
  input: SynchronizationRequest,
  errorCode: string
): Promise<SynchronizationEvent>;
export declare function listSynchronizationEvents(
  query: SynchronizationEventQuery
): Promise<readonly SynchronizationEvent[]>;
