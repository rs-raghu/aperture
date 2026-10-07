import { z } from "@aperture/validation";
import type { createHealthService } from "@aperture/health";

export const STRAVA_SCOPE = "activity:read";
export const stravaActivitySchema = z.object({
  id: z.number().int().positive().safe(), name: z.string().trim().min(1).max(500),
  sport_type: z.string().min(1), start_date: z.string().datetime({ offset: true }),
  distance: z.number().finite().nonnegative(), moving_time: z.number().int().nonnegative().safe(),
  elapsed_time: z.number().int().nonnegative().safe(), athlete: z.object({ id: z.number().int().positive().safe() }).optional(),
});
export type StravaActivity = z.infer<typeof stravaActivitySchema>;
export const webhookEventSchema = z.object({
  object_type: z.enum(["activity", "athlete"]), aspect_type: z.enum(["create", "update", "delete"]),
  object_id: z.number().int().positive().safe(), owner_id: z.number().int().positive().safe(),
  subscription_id: z.number().int().positive().safe(), event_time: z.number().int().positive().safe(),
  updates: z.record(z.string(), z.string()).default({}),
});
export type StravaWebhookEvent = z.infer<typeof webhookEventSchema>;

export interface StravaTokens { readonly accessToken: string; readonly refreshToken: string; readonly expiresAt: number; readonly athleteId: string; }
export interface StravaStatus {
  readonly integrationId: "strava"; readonly ownerId: string;
  readonly status: "disconnected" | "connecting" | "connected" | "error";
  readonly athleteId?: string; readonly connectedAt?: string; readonly lastSuccessAt?: string;
  readonly lastErrorCode?: string; readonly retryAt?: string; readonly nextPage?: number;
  readonly syncAfter?: number; readonly syncStartedAt?: string;
}
export interface StoredStravaConnection { readonly status: StravaStatus; readonly encryptedTokens?: string; }
export interface StravaImportReceipt { readonly ownerId: string; readonly athleteId: string; readonly activityId: string; readonly healthRecordId: string; }
export interface StravaQueueEvent { readonly id: string; readonly ownerId: string; readonly event: StravaWebhookEvent; readonly attempts: number; }

export interface StravaRepository {
  connection(ownerId: string): Promise<StoredStravaConnection | null>;
  saveConnection(value: StoredStravaConnection): Promise<void>;
  saveState(ownerId: string, digest: string, expiresAt: string): Promise<void>;
  consumeState(ownerId: string, digest: string, now: string): Promise<boolean>;
  receipt(ownerId: string, athleteId: string, activityId: string): Promise<StravaImportReceipt | null>;
  saveReceipt(value: StravaImportReceipt): Promise<void>;
  receipts(ownerId: string, athleteId: string): Promise<readonly StravaImportReceipt[]>;
  deleteReceipt(value: StravaImportReceipt): Promise<void>;
  enqueue(value: StravaQueueEvent, since: string, maxPending: number): Promise<boolean>;
  pending(ownerId: string, limit: number): Promise<readonly StravaQueueEvent[]>;
  finishEvent(ownerId: string, id: string, retry: boolean): Promise<void>;
  clearPrivateState(ownerId: string): Promise<void>;
}
export interface StravaTransaction {
  readonly repository: StravaRepository;
  readonly health: Pick<ReturnType<typeof createHealthService>, "createRunningActivity" | "updateRunningActivity" | "completeRunningActivity" | "getRunningActivity" | "deleteRunningActivity">;
}
export interface StravaUnitOfWork {
  run<T>(ownerId: string, work: (transaction: StravaTransaction) => Promise<T>): Promise<T>;
}
export interface StravaTransport {
  authorizationUrl(state: string): string;
  exchange(code: string): Promise<StravaTokens>;
  refresh(tokens: StravaTokens): Promise<StravaTokens>;
  revoke(tokens: StravaTokens): Promise<void>;
  activities(tokens: StravaTokens, after: number, page: number): Promise<readonly StravaActivity[]>;
  activity(tokens: StravaTokens, id: number): Promise<StravaActivity>;
  verifyAthlete(tokens: StravaTokens): Promise<void>;
}
export interface StravaCipher {
  encrypt(ownerId: string, tokens: StravaTokens): Promise<string>;
  decrypt(ownerId: string, ciphertext: string): Promise<StravaTokens>;
  digest(value: string): string;
  equals(left: string, right: string): boolean;
}
export interface StravaDependencies {
  readonly ownerId: string; readonly repository: StravaRepository; readonly unitOfWork: StravaUnitOfWork;
  readonly transport: StravaTransport; readonly cipher: StravaCipher;
  readonly queueTransaction?: { run<T>(ownerId: string, work: (repository: StravaRepository) => Promise<T>): Promise<T> };
  readonly clock: { now(): string }; readonly stateGenerator: { generate(): string };
  readonly subscriptionId?: number; readonly webhookVerifyToken?: string;
}
export class StravaError extends Error {
  public readonly name = "StravaError";
  public constructor(public readonly code: string, message: string, public readonly retryAt?: string) { super(message); }
}
