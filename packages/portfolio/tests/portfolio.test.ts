import { describe, expect, it } from "vitest";
import { createPortfolioService, createPortfolioMemoryRepository, emptyPortfolioContent, portfolioContentSchema, portfolioDraftSchema, safePortfolioLink, readPortfolioPublicationConfiguration } from "../src/index.js";
import { OWNER_A, OWNER_B, content } from "./fixtures.js";
function fixture() { let sequence = 0; const repository = createPortfolioMemoryRepository(); const service = createPortfolioService({ repository, clock: { now: () => "2040-01-01T09:00:00.000Z" }, idGenerator: { generate: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}` } }); return { service, repository }; }
describe("curated portfolio service", () => {
  it("requires explicit publication and a valid owner/canonical origin", () => {
    expect(readPortfolioPublicationConfiguration({})).toEqual({ enabled: false });
    expect(() => readPortfolioPublicationConfiguration({ APERTURE_PORTFOLIO_PUBLIC: "true", APERTURE_OWNER_ID: OWNER_A, NEXT_PUBLIC_APP_ORIGIN: "http://example.invalid" })).toThrow();
    expect(readPortfolioPublicationConfiguration({ APERTURE_PORTFOLIO_PUBLIC: "true", APERTURE_OWNER_ID: OWNER_A, NEXT_PUBLIC_APP_ORIGIN: "https://example.invalid" })).toEqual({ enabled: true, ownerId: OWNER_A, origin: "https://example.invalid" });
  });
  it("starts private and empty without copying any dashboard fields", async () => {
    const f = fixture(); const draft = await f.service.getDraft(OWNER_A);
    expect(draft.content).toEqual(emptyPortfolioContent()); expect(draft.publication).toBeNull(); expect(draft.revision).toBe(0);
    expect(await f.service.readPublic(OWNER_A, false)).toBeNull(); expect(await f.service.readPublic(OWNER_A, true)).toBeNull();
    expect(() => portfolioContentSchema.parse({ ...content(), health: { private: "value" } })).toThrow();
    expect(() => portfolioContentSchema.parse({ ...content(), ownerEmail: "owner@example.invalid" })).toThrow();
  });
  it("keeps prepared snapshots independent of later draft edits and requires the configuration gate", async () => {
    const f = fixture(); const draft = await f.service.saveDraft(OWNER_A, content(), 0);
    await expect(f.service.preparePublication(OWNER_A, draft.revision, "wrong")).rejects.toThrow(/confirmation/);
    const prepared = await f.service.preparePublication(OWNER_A, draft.revision, `PUBLISH PORTFOLIO ${OWNER_A}`);
    expect(await f.service.readPublic(OWNER_A, false)).toBeNull();
    expect(await f.service.readPublic(OWNER_A, true)).toEqual({ content: content(), publishedAt: "2040-01-01T09:00:00.000Z" });
    const modified = { ...content(), profile: { ...content().profile, biography: "Private new draft" } };
    const edited = await f.service.saveDraft(OWNER_A, modified, prepared.revision);
    expect((await f.service.readPublic(OWNER_A, true))?.content.profile.biography).not.toContain("Private new draft");
    await f.service.unpublish(OWNER_A, edited.revision); expect(await f.service.readPublic(OWNER_A, true)).toBeNull();
  });
  it("rejects stale concurrent saves and isolates owners and factory stores", async () => {
    const f = fixture(); const results = await Promise.allSettled([f.service.saveDraft(OWNER_A, content(), 0), f.service.saveDraft(OWNER_A, content(), 0)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect((await f.service.getDraft(OWNER_B)).content).toEqual(emptyPortfolioContent()); expect(await fixture().repository.find(OWNER_A)).toBeNull();
    await expect(f.service.saveDraft(OWNER_A, content(), 0)).rejects.toThrow(/another device/);
  });
  it("validates links, explicit email choices, duplicate IDs, and publication completeness", async () => {
    expect(safePortfolioLink("javascript:alert(1)", true)).toBe(false); expect(safePortfolioLink("https://user:secret@example.invalid")).toBe(false);
    expect(safePortfolioLink("mailto:chosen@example.invalid", true)).toBe(true); expect(safePortfolioLink("mailto:chosen@example.invalid")).toBe(false);
    expect(() => portfolioContentSchema.parse({ ...content(), projects: [...content().projects, ...content().projects] })).toThrow();
    const f = fixture(); await expect(f.service.preparePublication(OWNER_A, 0, `PUBLISH PORTFOLIO ${OWNER_A}`)).rejects.toThrow(/name, headline/);
    const valid = await f.service.saveDraft(OWNER_A, content(), 0);
    expect(() => portfolioDraftSchema.parse({ ...valid, updatedAt: "2039-01-01T00:00:00.000Z" })).toThrow();
  });
});
