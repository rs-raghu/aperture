import { describe, expect, it } from "vitest";

import { createWebDataComposition } from "@/lib/data/web-data-provider";
import { PortfolioDataContribution } from "@/features/portfolio/data-contribution";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("web data composition", () => {
  it("includes private portfolio drafts in recovery without restoring publication", async () => {
    const composition = createWebDataComposition({ mode: "memory", ownerId: OWNER });
    const contribution = composition.featureContributions.find((value) => value instanceof PortfolioDataContribution);
    if (contribution === undefined) throw new Error("Portfolio contribution is missing.");
    const draft = await contribution.runtime.service.getDraft(OWNER);
    await contribution.runtime.service.saveDraft(OWNER, draft.content, 0);
    const archive = await composition.backup.service.export(OWNER, ["portfolio"]); expect(archive.features[0]?.collections[0]?.records).toHaveLength(1); expect(archive.features[0]?.collections[0]?.records[0]?.publication).toBeNull();
  });
  it("selects isolated memory only for the explicit preview mode", () => {
    const composition = createWebDataComposition({ mode: "memory", ownerId: OWNER });
    expect(composition.mode).toBe("memory");
    expect(composition.education.context.ownerId).toBe(OWNER);
    expect(composition.health.context.ownerId).toBe(OWNER);
    expect(composition.finance.context.ownerId).toBe(OWNER);
    expect(composition.planner.context.ownerId).toBe(OWNER);
    expect(composition.settings.ownerId).toBe(OWNER);
    expect(composition.today.ownerId).toBe(OWNER);
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
