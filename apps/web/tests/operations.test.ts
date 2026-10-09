import { describe, expect, it, vi } from "vitest";
import { readinessResponse } from "@/lib/operations/readiness";
import { createOperationalReporter, type OperationalEvent } from "@/lib/operations/events";
import { isPublicOperationalRoute } from "@/lib/operations/route-policy";
import { GET } from "@/app/api/health/route";
describe("deployment operations privacy", () => {
  it("denies unauthenticated readiness checks without probing storage", async () => {
    const probe = vi.fn(); const response = await readinessResponse({ authenticate: async () => false, probe, unavailable: vi.fn() });
    expect(response.status).toBe(401); expect(probe).not.toHaveBeenCalled(); expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("returns ready only after verified ownership and a successful probe", async () => {
    const probe = vi.fn(async () => undefined); const response = await readinessResponse({ authenticate: async () => true, probe, unavailable: vi.fn() });
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ status: "ready" }); expect(probe).toHaveBeenCalledOnce();
  });
  it("redacts provider failures from readiness responses and reporting", async () => {
    const unavailable = vi.fn(); const response = await readinessResponse({ authenticate: async () => true, probe: async () => { throw new Error("private database password and owner records"); }, unavailable });
    expect(response.status).toBe(503); expect(await response.text()).not.toContain("private"); expect(unavailable).toHaveBeenCalledWith();
  });
  it("monitor hooks receive only fixed events and failures cannot expose payloads", () => {
    const events: OperationalEvent[] = []; const monitor = vi.fn(() => { throw new Error("private monitor diagnostics"); });
    const report = createOperationalReporter({ now: () => "2040-01-01T00:00:00.000Z", id: () => "synthetic-event-id", write: (event) => events.push(event), monitor }); report("recovery-unavailable");
    expect(monitor).toHaveBeenCalledWith(events[0]); expect(events.map((event) => event.event)).toEqual(["recovery-unavailable", "monitor-unavailable"]);
    expect(Object.keys(events[0]!)).toEqual(["event", "level", "timestamp", "eventId"]); expect(JSON.stringify(events)).not.toContain("diagnostics"); expect(Object.isFrozen(events[0])).toBe(true);
  });
  it("publishes only liveness and fixed installation assets while protecting readiness", async () => {
    const response = GET(); expect(await response.json()).toEqual({ status: "ok", service: "aperture-web" });
    for (const path of ["/api/health", "/manifest.webmanifest", "/icon.svg"]) expect(isPublicOperationalRoute(path)).toBe(true);
    for (const path of ["/api/health/ready", "/api/health/private", "/icon.svg/private", "/manifest.webmanifest/edit"]) expect(isPublicOperationalRoute(path)).toBe(false);
  });
});
