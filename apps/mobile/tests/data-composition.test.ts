import { createClient } from "@supabase/supabase-js";

import { createMobileDataComposition } from "../src/lib/data/mobile-data-provider";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("mobile data composition", () => {
  it("keeps memory mode explicit and owner-scoped", () => {
    const composition = createMobileDataComposition(OWNER, "development-bypass", null);
    expect(composition.mode).toBe("memory");
    expect(composition.education.context.ownerId).toBe(OWNER);
    expect(composition.health.context.ownerId).toBe(OWNER);
    expect(composition.finance.context.ownerId).toBe(OWNER);
    expect(composition.snapshots()).toEqual([]);
  });

  it("selects one observable Supabase repository set for authenticated mobile features", () => {
    const client = createClient("https://example.supabase.co", "synthetic-public-key", { auth: { persistSession: false } });
    const composition = createMobileDataComposition(OWNER, "supabase", client);
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
