export type CloudSynchronizationScope = "education" | "health" | "finance" | "planner";
export type CloudSynchronizationState = "idle" | "synchronizing" | "synchronized" | "failed";

export interface CloudSynchronizationSnapshot {
  readonly scope: CloudSynchronizationScope;
  readonly state: CloudSynchronizationState;
  readonly inFlight: number;
  readonly attempt: number;
  readonly lastSucceededAt?: string;
  readonly lastFailedAt?: string;
  readonly errorCode?: string | undefined;
}

export type CloudSynchronizationListener = (snapshot: CloudSynchronizationSnapshot) => void;

const scopes = ["education", "health", "finance", "planner"] as const;

function initial(scope: CloudSynchronizationScope): CloudSynchronizationSnapshot {
  return Object.freeze({ scope, state: "idle", inFlight: 0, attempt: 0 });
}

export class CloudSynchronizationMonitor {
  readonly #snapshots = new Map<CloudSynchronizationScope, CloudSynchronizationSnapshot>(
    scopes.map((scope) => [scope, initial(scope)]),
  );
  readonly #listeners = new Set<CloudSynchronizationListener>();
  readonly #now: () => Date;
  #allSnapshots: readonly CloudSynchronizationSnapshot[];

  public constructor(now: () => Date = () => new Date()) {
    this.#now = now;
    this.#allSnapshots = Object.freeze(scopes.map((scope) => this.getSnapshot(scope)));
  }

  public getSnapshot(scope: CloudSynchronizationScope): CloudSynchronizationSnapshot {
    return this.#snapshots.get(scope)!;
  }

  public getAllSnapshots(): readonly CloudSynchronizationSnapshot[] {
    return this.#allSnapshots;
  }

  public subscribe(listener: CloudSynchronizationListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  public begin(scope: CloudSynchronizationScope): void {
    const current = this.getSnapshot(scope);
    this.publish({ ...current, state: "synchronizing", inFlight: current.inFlight + 1, attempt: 1, errorCode: undefined });
  }

  public retry(scope: CloudSynchronizationScope, attempt: number): void {
    const current = this.getSnapshot(scope);
    this.publish({ ...current, state: "synchronizing", attempt });
  }

  public succeed(scope: CloudSynchronizationScope): void {
    const current = this.getSnapshot(scope);
    const inFlight = Math.max(0, current.inFlight - 1);
    this.publish({
      ...current,
      state: inFlight === 0 ? "synchronized" : "synchronizing",
      inFlight,
      lastSucceededAt: this.#now().toISOString(),
      errorCode: undefined,
    });
  }

  public fail(scope: CloudSynchronizationScope, errorCode: string): void {
    const current = this.getSnapshot(scope);
    this.publish({
      ...current,
      state: "failed",
      inFlight: Math.max(0, current.inFlight - 1),
      lastFailedAt: this.#now().toISOString(),
      errorCode,
    });
  }

  private publish(snapshot: CloudSynchronizationSnapshot): void {
    const frozen = Object.freeze(snapshot);
    this.#snapshots.set(snapshot.scope, frozen);
    this.#allSnapshots = Object.freeze(scopes.map((scope) => this.getSnapshot(scope)));
    for (const listener of this.#listeners) listener(frozen);
  }
}
