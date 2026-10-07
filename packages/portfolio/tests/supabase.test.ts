import { expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createSupabasePortfolioRepository } from "../src/supabase.js";
import { createPortfolioMemoryRepository, createPortfolioService } from "../src/index.js";
import { OWNER_A, content } from "./fixtures.js";
it("uses the portfolio schema and atomic revision RPC through the real Supabase SDK", async () => {
  const service = createPortfolioService({ repository: createPortfolioMemoryRepository(), clock: { now: () => "2040-01-01T09:00:00.000Z" }, idGenerator: { generate: () => "00000000-0000-4000-8000-000000000777" } }); const draft = await service.saveDraft(OWNER_A, content(), 0);
  const send = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json([{ payload: draft }])).mockResolvedValueOnce(Response.json(true));
  const client = createClient("https://example.invalid", "synthetic-publishable-key", { global: { fetch: send }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const repository = createSupabasePortfolioRepository(client); expect(await repository.find(OWNER_A)).toEqual(draft); expect(await repository.save(draft, 0)).toBe(true);
  expect(String(send.mock.calls[0]?.[0])).toContain("/rest/v1/drafts"); expect(new Headers(send.mock.calls[0]?.[1]?.headers).get("accept-profile")).toBe("portfolio");
  expect(String(send.mock.calls[1]?.[0])).toContain("/rpc/save_draft"); expect(JSON.parse(String(send.mock.calls[1]?.[1]?.body))).toMatchObject({ expected_revision: 0, candidate: { ownerId: OWNER_A } });
  send.mockResolvedValueOnce(Response.json({ message: "a private provider error", code: "42501" }, { status: 403 })); await expect(repository.find(OWNER_A)).rejects.toThrow("Portfolio could not be loaded");
});
