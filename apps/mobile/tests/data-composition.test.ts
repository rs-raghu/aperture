import { createClient } from "@supabase/supabase-js";

import { createMobileDataComposition } from "../src/lib/data/mobile-data-provider";
import { PortfolioDataContribution } from "../src/features/portfolio/data-contribution";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("mobile data composition", () => {
  it("includes private portfolio drafts in owner-scoped recovery", async () => {
    const composition = createMobileDataComposition(OWNER, "development-bypass", null);
    const contribution = composition.featureContributions.find((value) => value instanceof PortfolioDataContribution);
    if (contribution === undefined) throw new Error("Portfolio contribution is missing.");
    const draft = await contribution.runtime.service.getDraft(OWNER);
    await contribution.runtime.service.saveDraft(OWNER, draft.content, 0);
    const archive = await composition.backup.service.export(OWNER, ["portfolio"]); expect(archive.features[0]?.collections[0]?.records).toHaveLength(1); expect(archive.features[0]?.collections[0]?.records[0]?.publication).toBeNull();
  });
  it("keeps memory mode explicit and owner-scoped", () => {
    const composition = createMobileDataComposition(OWNER, "development-bypass", null);
    expect(composition.mode).toBe("memory");
    expect(composition.education.context.ownerId).toBe(OWNER);
    expect(composition.health.context.ownerId).toBe(OWNER);
    expect(composition.finance.context.ownerId).toBe(OWNER);
    expect(composition.planner.context.ownerId).toBe(OWNER);
    expect(composition.settings.ownerId).toBe(OWNER);
    expect(composition.today.ownerId).toBe(OWNER);
    expect(composition.snapshots()).toEqual([]);
  });

  it("selects one observable Supabase repository set for authenticated mobile features", () => {
    const client = createClient("https://example.supabase.co", "synthetic-public-key", { auth: { persistSession: false } });
    const composition = createMobileDataComposition(OWNER, "supabase", client);
    expect(composition.mode).toBe("supabase");
    expect(composition.education.context.ownerId).toBe(OWNER);
    expect(composition.health.context.ownerId).toBe(OWNER);
    expect(composition.finance.context.ownerId).toBe(OWNER);
    expect(composition.planner.context.ownerId).toBe(OWNER);
    expect(composition.settings.ownerId).toBe(OWNER);
    expect(composition.today.ownerId).toBe(OWNER);
    expect(composition.snapshots()).toEqual([
      expect.objectContaining({ scope: "education", state: "idle" }),
      expect.objectContaining({ scope: "health", state: "idle" }),
      expect.objectContaining({ scope: "finance", state: "idle" }),
      expect.objectContaining({ scope: "planner", state: "idle" }),
      expect.objectContaining({ scope: "platform", state: "idle" }),
    ]);
  });
});
