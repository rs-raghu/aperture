import { z } from "@aperture/validation";
import type { BackupService } from "./backup.service.js";
import type { RestorePreview } from "./backup.types.js";

const count = z.number().int().nonnegative().safe();
export const recoveryStatusSchema = z.object({ enabled: z.boolean() }).strict();
export const recoveryRestoreReviewSchema = z.object({ valid: z.boolean(), mode: z.enum(["merge", "replace"]), issues: z.array(z.string()), conflicts: count, additions: count, replacements: count, deletions: count, stateChecksum: z.string(), confirmation: z.string() }).strict();
export const recoveryDeletionReviewSchema = z.object({ ownerId: z.string().uuid(), featureIds: z.array(z.string()), recordCount: count, stateChecksum: z.string(), confirmation: z.string() }).strict();
export type RecoveryRestoreReview = z.infer<typeof recoveryRestoreReviewSchema>;
export type RecoveryDeletionReview = z.infer<typeof recoveryDeletionReviewSchema>;
export interface RecoveryClient {
  status(): Promise<{ enabled: boolean }>;
  previewRestore(source: string, mode: "merge" | "replace"): Promise<RecoveryRestoreReview>;
  restore(source: string, review: RecoveryRestoreReview, confirmation: string): Promise<void>;
  previewDeletion(featureIds: readonly string[]): Promise<RecoveryDeletionReview>;
  deleteData(review: RecoveryDeletionReview, confirmation: string): Promise<void>;
}
export function createRecoveryClient(options: { readonly endpoint: string; readonly fetch?: typeof fetch; readonly token?: () => Promise<string | null> }): RecoveryClient {
  if (options.endpoint !== "/api/recovery") {
    const url = new URL(options.endpoint);
    if (url.protocol !== "https:" || url.username !== "" || url.password !== "" || url.pathname !== "/api/recovery" || url.search !== "" || url.hash !== "") throw new Error("Recovery requires your configured HTTPS web origin.");
  }
  async function request(body?: object): Promise<unknown> {
    const token = await options.token?.();
    if (options.token !== undefined && !token) throw new Error("Sign in again before using recovery.");
    const response = await (options.fetch ?? fetch)(options.endpoint, {
      method: body === undefined ? "GET" : "POST", cache: "no-store", credentials: options.token === undefined ? "same-origin" : "omit", signal: AbortSignal.timeout(60_000),
      headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error("Sign in again before using recovery.");
      if (response.status === 409) throw new Error("The confirmation or owner data changed. Run the preview again.");
      if (response.status === 413) throw new Error("This archive exceeds the server's 8 MiB recovery limit.");
      if (response.status === 429) throw new Error("Recovery is busy. Wait a minute before trying again.");
      if (response.status === 503) throw new Error("Transactional recovery is not configured or is temporarily unavailable.");
      throw new Error("Recovery could not complete. Check the archive and try again.");
    }
    return response.json();
  }
  return {
    async status() { return recoveryStatusSchema.parse(await request()); },
    async previewRestore(source, mode) { return recoveryRestoreReviewSchema.parse(await request({ action: "preview-restore", source, mode })); },
    async restore(source, review, confirmation) { await request({ action: "restore", source, mode: review.mode, stateChecksum: review.stateChecksum, confirmation }); },
    async previewDeletion(featureIds) { return recoveryDeletionReviewSchema.parse(await request({ action: "preview-deletion", featureIds })); },
    async deleteData(review, confirmation) { await request({ action: "delete", featureIds: review.featureIds, stateChecksum: review.stateChecksum, confirmation }); },
  };
}
const restoreCommand = z.object({ action: z.enum(["preview-restore", "restore"]), source: z.string(), mode: z.enum(["merge", "replace"]), stateChecksum: z.string().optional(), confirmation: z.string().optional() }).strict();
const deleteCommand = z.object({ action: z.enum(["preview-deletion", "delete"]), featureIds: z.array(z.string()).min(1).max(100), stateChecksum: z.string().optional(), confirmation: z.string().optional() }).strict();
const commandSchema = z.union([restoreCommand, deleteCommand]);
const MAX_BYTES = 8 * 1024 * 1024;
function boundedShape(value: unknown): boolean {
  const pending = [{ value, depth: 0 }]; let nodes = 0;
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (++nodes > 250_000 || current.depth > 40) return false;
    if (typeof current.value === "object" && current.value !== null) for (const child of Object.values(current.value)) pending.push({ value: child, depth: current.depth + 1 });
  }
  return true;
}
function review(preview: RestorePreview, ownerId: string): RecoveryRestoreReview {
  return { valid: preview.valid, mode: preview.mode, issues: preview.issues.map(({ message }) => message), conflicts: preview.conflicts.length, additions: preview.additions, replacements: preview.replacements, deletions: preview.deletions, stateChecksum: preview.stateChecksum, confirmation: preview.valid && preview.backup !== undefined ? preview.confirmation || `MERGE ${ownerId} ${preview.backup.integrity.digest} ${preview.stateChecksum}` : "" };
}
export function createRecoveryHandler(options: {
  readonly ownerId: string; readonly trustedOrigin: string; readonly service: BackupService | null;
  readonly authenticate: (request: Request) => Promise<string | null>;
  readonly allowMutationRequest?: () => boolean;
  readonly onUnavailable?: () => void;
}): (request: Request) => Promise<Response> {
  const respond = (status: number, value: object) => Response.json(value, { status, headers: { "cache-control": "no-store", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" } });
  return async (request) => {
    try {
      if (await options.authenticate(request) !== options.ownerId) return respond(401, { error: "owner-denied" });
      if (request.method === "GET") return respond(200, { enabled: options.service !== null });
      if (request.method !== "POST") return respond(405, { error: "method-denied" });
      const nativeBearer = request.headers.get("authorization")?.startsWith("Bearer ") === true && !request.headers.has("cookie");
      if (!nativeBearer && request.headers.get("origin") !== options.trustedOrigin) return respond(403, { error: "origin-denied" });
      if (options.service === null) return respond(503, { error: "recovery-unconfigured" });
      if (options.allowMutationRequest?.() === false) return respond(429, { error: "recovery-rate-limited" });
      if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json" || request.body === null) return respond(415, { error: "json-required" });
      const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
      while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.byteLength; if (bytes > MAX_BYTES) { await reader.cancel(); return respond(413, { error: "archive-too-large" }); } chunks.push(next.value); }
      const data = new Uint8Array(bytes); let offset = 0; for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
      let body: unknown; try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(data)); } catch { return respond(400, { error: "invalid-json" }); }
      if (!boundedShape(body)) return respond(422, { error: "archive-too-complex" });
      const parsed = commandSchema.safeParse(body); if (!parsed.success) return respond(422, { error: "invalid-command" });
      const command = parsed.data; const service = options.service;
      if ("source" in command) {
        let archive: unknown; try { archive = JSON.parse(command.source); } catch { return respond(422, { error: "invalid-archive" }); }
        if (!boundedShape(archive)) return respond(422, { error: "archive-too-complex" });
        const preview = await service.dryRunRestore(options.ownerId, archive, command.mode); const projected = review(preview, options.ownerId);
        if (command.action === "preview-restore") return respond(200, projected);
        if (!preview.valid || command.stateChecksum !== preview.stateChecksum || command.confirmation !== projected.confirmation) return respond(409, { error: "review-changed" });
        await service.restore(options.ownerId, preview, command.confirmation); return respond(200, { applied: true });
      }
      const preview = await service.dryRunDeletion(options.ownerId, command.featureIds);
      if (command.action === "preview-deletion") return respond(200, preview);
      if (command.stateChecksum !== preview.stateChecksum || command.confirmation !== preview.confirmation) return respond(409, { error: "review-changed" });
      await service.deleteData(options.ownerId, preview, command.confirmation); return respond(200, { applied: true });
    } catch { options.onUnavailable?.(); return respond(503, { error: "recovery-unavailable" }); }
  };
}
