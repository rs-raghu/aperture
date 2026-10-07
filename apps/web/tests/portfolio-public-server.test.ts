import { afterEach, describe, expect, it, vi } from "vitest";
import { createPortfolioMemoryRepository, createPortfolioService, emptyPortfolioContent } from "@aperture/portfolio";
const provider = vi.hoisted(() => { const maybeSingle = vi.fn(); const query = { select: vi.fn(), eq: vi.fn(), is: vi.fn(), maybeSingle }; query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.is.mockReturnValue(query); const schema = { from: vi.fn(() => query) }; return { maybeSingle, query, schema, createClient: vi.fn(() => ({ schema: vi.fn(() => schema) })) }; });
vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: provider.createClient }));
import { readPublicPortfolio } from "@/features/portfolio/server";
const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
function configuration() { vi.stubEnv("APERTURE_PORTFOLIO_PUBLIC", "true"); vi.stubEnv("APERTURE_OWNER_ID", ownerId); vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "https://example.invalid"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-server-only-key"); }
describe("public portfolio server gate", () => {
  it("does not access storage when publication is not explicitly configured", async () => { vi.stubEnv("APERTURE_PORTFOLIO_PUBLIC", "false"); expect(await readPublicPortfolio()).toBeNull(); expect(provider.createClient).not.toHaveBeenCalled(); });
  it("returns only the independently prepared snapshot and canonical origin", async () => {
    configuration(); const service = createPortfolioService({ repository: createPortfolioMemoryRepository(), clock: { now: () => "2040-01-01T09:00:00.000Z" }, idGenerator: { generate: () => "00000000-0000-4000-8000-000000000777" } });
    const saved = await service.saveDraft(ownerId, { ...emptyPortfolioContent(), profile: { displayName: "Synthetic professional", headline: "Useful work", biography: "Curated biography", location: "" } }, 0);
    const prepared = await service.preparePublication(ownerId, saved.revision, `PUBLISH PORTFOLIO ${ownerId}`);
    const draft = await service.saveDraft(ownerId, { ...prepared.content, profile: { ...prepared.content.profile, biography: "New private draft" } }, prepared.revision);
    provider.maybeSingle.mockResolvedValue({ error: null, data: { payload: draft } });
    const result = await readPublicPortfolio(); expect(result?.snapshot.content.profile.biography).toBe("Curated biography"); expect(JSON.stringify(result)).not.toContain(ownerId); expect(JSON.stringify(result)).not.toContain("New private draft"); expect(provider.schema.from).toHaveBeenCalledWith("drafts"); expect(provider.query.eq).toHaveBeenCalledWith("owner_id", ownerId);
  });
  it("fails closed for unprepared, malformed, or cross-owner records", async () => {
    configuration(); const content = { ...emptyPortfolioContent(), profile: { displayName: "Synthetic professional", headline: "Useful work", biography: "Curated biography", location: "" } };
    const record = { id: "00000000-0000-4000-8000-000000000777", ownerId, revision: 1, createdAt: "2040-01-01T09:00:00.000Z", updatedAt: "2040-01-01T09:00:00.000Z", content, publication: null };
    provider.maybeSingle.mockResolvedValue({ error: null, data: { payload: record } }); expect(await readPublicPortfolio()).toBeNull();
    provider.maybeSingle.mockResolvedValue({ error: null, data: { payload: { ...record, ownerId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", publication: { content, publishedAt: record.updatedAt } } } }); expect(await readPublicPortfolio()).toBeNull();
    provider.maybeSingle.mockResolvedValue({ error: null, data: { payload: { ownerId, health: "private" } } }); expect(await readPublicPortfolio()).toBeNull();
    provider.maybeSingle.mockResolvedValue({ error: { message: "private provider diagnostics" }, data: null }); expect(await readPublicPortfolio()).toBeNull();
  });
});
