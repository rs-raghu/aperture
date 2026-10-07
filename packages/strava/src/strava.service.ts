import { mapStravaActivity } from "./activity-adapter.js";
import { STRAVA_SCOPE, StravaError, webhookEventSchema, type StravaDependencies, type StravaStatus, type StravaTokens, type StravaTransaction, type StravaActivity } from "./strava.types.js";

function errorCode(error: unknown): string { return error instanceof StravaError ? error.code : "strava-operation-failed"; }

export class StravaService {
  public constructor(private readonly dependencies: StravaDependencies) {}
  private assertOwner(ownerId: string) { if (ownerId !== this.dependencies.ownerId) throw new StravaError("strava-owner-denied", "Strava access is restricted to the configured owner."); }
  public async status(ownerId: string): Promise<StravaStatus> {
    this.assertOwner(ownerId);
    return (await this.dependencies.repository.connection(ownerId))?.status ?? { integrationId: "strava", ownerId, status: "disconnected" };
  }
  public async beginConnect(ownerId: string): Promise<{ readonly authorizationUrl: string; readonly state: string }> {
    this.assertOwner(ownerId);
    const state = this.dependencies.stateGenerator.generate();
    if (state.length < 32) throw new StravaError("strava-invalid-state-generator", "OAuth state must contain at least 128 bits of random data.");
    const now = this.dependencies.clock.now();
    await this.dependencies.unitOfWork.run(ownerId, async ({ repository }) => {
      await repository.saveState(ownerId, this.dependencies.cipher.digest(state), new Date(Date.parse(now) + 600_000).toISOString());
      const previous = await repository.connection(ownerId);
      await repository.saveConnection({ ...previous, status: { ...previous?.status, integrationId: "strava", ownerId, status: "connecting" } });
    });
    return { authorizationUrl: this.dependencies.transport.authorizationUrl(state), state };
  }
  public async completeConnect(ownerId: string, state: string, code: string, acceptedScopes: string): Promise<StravaStatus> {
    this.assertOwner(ownerId);
    const now = this.dependencies.clock.now();
    // Consume in its own transaction: failed exchange must never make the state replayable.
    const consumed = await this.dependencies.unitOfWork.run(ownerId, ({ repository }) => repository.consumeState(ownerId, this.dependencies.cipher.digest(state), now));
    if (!consumed) throw new StravaError("strava-state-rejected", "The OAuth state is invalid, expired, or already used.");
    try {
      if (!acceptedScopes.split(/[, ]+/).includes(STRAVA_SCOPE) || code.length === 0) throw new StravaError("strava-scope-denied", "Activity read permission is required to connect Strava.");
      const tokens = await this.dependencies.transport.exchange(code);
      const encryptedTokens = await this.dependencies.cipher.encrypt(ownerId, tokens);
      const status: StravaStatus = { integrationId: "strava", ownerId, status: "connected", athleteId: tokens.athleteId, connectedAt: now };
      await this.dependencies.unitOfWork.run(ownerId, ({ repository }) => repository.saveConnection({ status, encryptedTokens }));
      return status;
    } catch (error) { await this.recordFailure(ownerId, error); throw error; }
  }
  private async recordFailure(ownerId: string, error: unknown): Promise<void> {
    await this.dependencies.unitOfWork.run(ownerId, async ({ repository }) => {
      const current = await repository.connection(ownerId);
      const { retryAt: _retryAt, ...status } = current?.status ?? { integrationId: "strava" as const, ownerId, status: "disconnected" as const };
      await repository.saveConnection({ ...current, status: { ...status, status: "error", lastErrorCode: errorCode(error), ...(error instanceof StravaError && error.retryAt !== undefined ? { retryAt: error.retryAt } : {}) } });
    });
  }
  private async tokens(transaction: StravaTransaction, ownerId: string): Promise<StravaTokens> {
    const current = await transaction.repository.connection(ownerId);
    if (current?.encryptedTokens === undefined) throw new StravaError("strava-not-connected", "Connect Strava before synchronizing.");
    if (current.status.retryAt !== undefined && Date.parse(current.status.retryAt) > Date.parse(this.dependencies.clock.now())) throw new StravaError("strava-rate-limited", "Strava synchronization is waiting for its rate limit to reset.", current.status.retryAt);
    let tokens = await this.dependencies.cipher.decrypt(ownerId, current.encryptedTokens);
    if (tokens.expiresAt * 1000 <= Date.parse(this.dependencies.clock.now()) + 60_000) {
      tokens = await this.dependencies.transport.refresh(tokens);
      await transaction.repository.saveConnection({ status: current.status, encryptedTokens: await this.dependencies.cipher.encrypt(ownerId, tokens) });
    }
    return tokens;
  }
  private async importActivity(transaction: StravaTransaction, ownerId: string, athleteId: string, activity: StravaActivity, update = false): Promise<boolean> {
    if (activity.athlete !== undefined && String(activity.athlete.id) !== athleteId) throw new StravaError("strava-athlete-mismatch", "The activity belongs to a different athlete.");
    const mapped = mapStravaActivity(activity);
    if (mapped === null) return false;
    const receipt = await transaction.repository.receipt(ownerId, athleteId, String(activity.id));
    const context = { ownerId };
    if (receipt !== null) {
      // A local deletion is intentional. Retain its receipt so a later sync cannot resurrect it.
      if (update && await transaction.health.getRunningActivity(context, receipt.healthRecordId) !== null) await transaction.health.updateRunningActivity(context, receipt.healthRecordId, mapped.update);
      return false;
    }
    const record = await transaction.health.createRunningActivity(context, { ...mapped.create, sourceReference: { provider: "strava", accountId: athleteId, recordId: String(activity.id) } });
    await transaction.health.updateRunningActivity(context, record.id, mapped.update);
    await transaction.health.completeRunningActivity(context, record.id, mapped.update.endedAt!);
    await transaction.repository.saveReceipt({ ownerId, athleteId, activityId: String(activity.id), healthRecordId: record.id });
    return true;
  }
  public async synchronize(ownerId: string): Promise<{ readonly imported: number; readonly status: StravaStatus }> {
    this.assertOwner(ownerId);
    let imported = 0;
    try {
      // Token rotation commits before activity import; an import rollback must not restore an invalid refresh token.
      const tokens = await this.dependencies.unitOfWork.run(ownerId, (transaction) => this.tokens(transaction, ownerId));
      return await this.dependencies.unitOfWork.run(ownerId, async (transaction) => {
        const current = await transaction.repository.connection(ownerId);
        if (current?.encryptedTokens === undefined || current.status.athleteId !== tokens.athleteId) throw new StravaError("strava-not-connected", "The connection changed before synchronization started.");
        const after = current.status.syncAfter ?? (current.status.lastSuccessAt === undefined ? 0 : Math.max(0, Math.floor(Date.parse(current.status.lastSuccessAt) / 1000) - 300));
        const startedAt = current.status.syncStartedAt ?? this.dependencies.clock.now();
        let page = current.status.nextPage ?? 1;
        let finished = false;
        for (let count = 0; count < 5; count += 1) {
          const activities = await this.dependencies.transport.activities(tokens, after, page);
          for (const activity of activities) if (await this.importActivity(transaction, ownerId, tokens.athleteId, activity)) imported += 1;
          page += 1;
          if (activities.length < 100) { finished = true; break; }
        }
        const { lastErrorCode: _error, retryAt: _retryAt, nextPage: _nextPage, syncAfter: _after, syncStartedAt: _started, ...previous } = current.status;
        const status: StravaStatus = { ...previous, status: "connected", ...(finished ? { lastSuccessAt: startedAt } : { nextPage: page, syncAfter: after, syncStartedAt: startedAt }) };
        await transaction.repository.saveConnection({ ...current, status });
        return { imported, status };
      });
    } catch (error) { await this.recordFailure(ownerId, error); throw error; }
  }
  private async purgeImports(transaction: StravaTransaction, ownerId: string, athleteId: string): Promise<void> {
    for (const receipt of await transaction.repository.receipts(ownerId, athleteId)) {
      const context = { ownerId };
      const existing = await transaction.health.getRunningActivity(context, receipt.healthRecordId);
      if (existing !== null) await transaction.health.deleteRunningActivity(context, receipt.healthRecordId);
      await transaction.repository.deleteReceipt(receipt);
    }
  }
  public async disconnect(ownerId: string, deleteImportedData = false, confirmation = ""): Promise<StravaStatus> {
    this.assertOwner(ownerId);
    if (deleteImportedData && confirmation !== `DELETE STRAVA IMPORTS ${ownerId}`) throw new StravaError("strava-deletion-confirmation", "Imported-data deletion requires the exact owner confirmation.");
    let revokeFailed = false;
    const current = await this.dependencies.repository.connection(ownerId);
    if (current?.encryptedTokens !== undefined) {
      try { await this.dependencies.transport.revoke(await this.dependencies.cipher.decrypt(ownerId, current.encryptedTokens)); }
      catch { revokeFailed = true; }
    }
    return this.dependencies.unitOfWork.run(ownerId, async (transaction) => {
      if (deleteImportedData && current?.status.athleteId !== undefined) await this.purgeImports(transaction, ownerId, current.status.athleteId);
      await transaction.repository.clearPrivateState(ownerId);
      const status: StravaStatus = { integrationId: "strava", ownerId, status: "disconnected", ...(revokeFailed ? { lastErrorCode: "strava-remote-revoke-failed" } : {}) };
      await transaction.repository.saveConnection({ status });
      return status;
    });
  }
  private async revokeLocally(transaction: StravaTransaction, ownerId: string, athleteId: string): Promise<void> {
    const current = await transaction.repository.connection(ownerId);
    if (current?.status.athleteId !== athleteId) return;
    await this.purgeImports(transaction, ownerId, athleteId);
    await transaction.repository.clearPrivateState(ownerId);
    await transaction.repository.saveConnection({ status: { integrationId: "strava", ownerId, status: "disconnected" } });
  }
  public verifyWebhook(mode: string | null, token: string | null, challenge: string | null): { readonly "hub.challenge": string } {
    const expected = this.dependencies.webhookVerifyToken;
    if (expected === undefined || mode !== "subscribe" || token === null || challenge === null || challenge.length > 1024 || !this.dependencies.cipher.equals(token, expected)) throw new StravaError("strava-webhook-rejected", "Webhook verification was rejected.");
    return { "hub.challenge": challenge };
  }
  public async enqueueWebhook(value: unknown): Promise<boolean> {
    const event = webhookEventSchema.parse(value);
    const now = this.dependencies.clock.now();
    const age = Date.parse(now) / 1000 - event.event_time;
    if (event.subscription_id !== this.dependencies.subscriptionId || age < -30 || age > 86_400) throw new StravaError("strava-webhook-rejected", "Webhook metadata is invalid.");
    const ownerId = this.dependencies.ownerId;
    const enqueue = async (repository: import("./strava.types.js").StravaRepository) => {
      const current = await repository.connection(ownerId);
      if (current?.status.athleteId !== String(event.owner_id) || current.encryptedTokens === undefined) return false;
      const id = this.dependencies.cipher.digest(JSON.stringify(event));
      return repository.enqueue({ id, ownerId, event, attempts: 0 }, new Date(Date.parse(now) - 60_000).toISOString(), 100);
    };
    return this.dependencies.queueTransaction === undefined ? this.dependencies.unitOfWork.run(ownerId, ({ repository }) => enqueue(repository)) : this.dependencies.queueTransaction.run(ownerId, enqueue);
  }
  public async processWebhooks(ownerId: string): Promise<number> {
    this.assertOwner(ownerId);
    let processed = 0;
    for (const job of await this.dependencies.repository.pending(ownerId, 20)) {
      try {
        let tokens: StravaTokens;
        try { tokens = await this.dependencies.unitOfWork.run(ownerId, (transaction) => this.tokens(transaction, ownerId)); }
        catch (error) {
          if (job.event.object_type !== "athlete" || job.event.updates.authorized !== "false" || !(error instanceof StravaError) || error.code !== "strava-unauthorized") throw error;
          await this.dependencies.unitOfWork.run(ownerId, (transaction) => this.revokeLocally(transaction, ownerId, String(job.event.owner_id)));
          processed += 1;
          continue;
        }
        await this.dependencies.unitOfWork.run(ownerId, async (transaction) => {
          const event = job.event;
          const current = await transaction.repository.connection(ownerId);
          const pending = await transaction.repository.pending(ownerId, 20);
          if (!pending.some((value) => value.id === job.id) || current?.encryptedTokens === undefined || current.status.athleteId !== tokens.athleteId) return;
          if (tokens.athleteId !== String(event.owner_id)) { await transaction.repository.finishEvent(ownerId, job.id, false); return; }
          if (event.object_type === "activity") {
            try {
              const activity = await this.dependencies.transport.activity(tokens, event.object_id);
              await this.importActivity(transaction, ownerId, tokens.athleteId, activity, true);
            } catch (error) {
              if (!(error instanceof StravaError) || error.code !== "strava-not-found") throw error;
              const receipt = await transaction.repository.receipt(ownerId, tokens.athleteId, String(event.object_id));
              if (receipt !== null) {
                if (await transaction.health.getRunningActivity({ ownerId }, receipt.healthRecordId) !== null) await transaction.health.deleteRunningActivity({ ownerId }, receipt.healthRecordId);
                await transaction.repository.deleteReceipt(receipt);
              }
            }
          } else if (event.updates.authorized === "false") {
            try { await this.dependencies.transport.verifyAthlete(tokens); }
            catch (error) {
              if (!(error instanceof StravaError) || error.code !== "strava-unauthorized") throw error;
              await this.revokeLocally(transaction, ownerId, tokens.athleteId);
            }
          }
          await transaction.repository.finishEvent(ownerId, job.id, false);
        });
        processed += 1;
      } catch (error) {
        await this.recordFailure(ownerId, error);
        // Backoff is not a failed job attempt. Keep the durable queue pending until the reset.
        if (error instanceof StravaError && error.code === "strava-rate-limited") break;
        await this.dependencies.unitOfWork.run(ownerId, ({ repository }) => repository.finishEvent(ownerId, job.id, true));
      }
    }
    return processed;
  }
}
export function createStravaService(dependencies: StravaDependencies): StravaService { return new StravaService(dependencies); }
