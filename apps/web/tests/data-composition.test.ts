import { describe, expect, it } from "vitest";

import { createWebDataComposition } from "@/lib/data/web-data-provider";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("web data composition", () => {
  it("selects isolated memory only for the explicit preview mode", () => {
    const composition = createWebDataComposition({ mode: "memory", ownerId: OWNER });
    expect(composition.mode).toBe("memory");
    expect(composition.education.context.ownerId).toBe(OWNER);
    expect(composition.health.context.ownerId).toBe(OWNER);
    expect(composition.finance.context.ownerId).toBe(OWNER);
    expect(composition.snapshots()).toEqual([]);
  });

  it("selects one observable Supabase repository set for authenticated web features", () => {
    const composition = createWebDataComposition({
      mode: "supabase",
      ownerId: OWNER,
      supabaseUrl: "https://example.supabase.co",
      supabasePublishableKey: "synthetic-public-key",
    });
    expect(composition.mode).toBe("supabase");
    expect(composition.education.context.ownerId).toBe(OWNER);
    expect(composition.health.context.ownerId).toBe(OWNER);
    expect(composition.finance.context.ownerId).toBe(OWNER);
    expect(composition.snapshots()).toEqual([
      expect.objectContaining({ scope: "education", state: "idle" }),
      expect.objectContaining({ scope: "health", state: "idle" }),
      expect.objectContaining({ scope: "finance", state: "idle" }),
    ]);
  });
});
