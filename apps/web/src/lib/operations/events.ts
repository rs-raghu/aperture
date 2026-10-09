export const OPERATIONAL_EVENTS = ["recovery-unavailable", "recovery-connection-unavailable", "strava-queue-unavailable", "portfolio-unavailable", "readiness-unavailable", "monitor-unavailable"] as const;
export type OperationalEventName = typeof OPERATIONAL_EVENTS[number];
export interface OperationalEvent { readonly event: OperationalEventName; readonly level: "warn"; readonly timestamp: string; readonly eventId: string; }
export function createOperationalReporter(options: {
  readonly now: () => string; readonly id: () => string;
  readonly write: (event: OperationalEvent) => void;
  readonly monitor?: (event: OperationalEvent) => void;
}): (name: OperationalEventName) => void {
  return (name) => {
    if (!OPERATIONAL_EVENTS.includes(name)) throw new Error("Unknown operational event.");
    const event: OperationalEvent = Object.freeze({ event: name, level: "warn", timestamp: options.now(), eventId: options.id() });
    options.write(event);
    try { options.monitor?.(event); }
    catch { options.write(Object.freeze({ event: "monitor-unavailable", level: "warn", timestamp: options.now(), eventId: options.id() })); }
  };
}
