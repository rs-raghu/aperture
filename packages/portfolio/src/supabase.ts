import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "@aperture/validation";
import { portfolioDraftSchema, type PortfolioRepository } from "./portfolio.types.js";
export function createSupabasePortfolioRepository(client: SupabaseClient): PortfolioRepository {
  return {
    async find(ownerId) {
      const result = await client.schema("portfolio").from("drafts").select("payload").eq("owner_id", ownerId).is("deleted_at", null).maybeSingle();
      if (result.error !== null) throw new Error("Portfolio could not be loaded. Check your session and server connection.");
      if (result.data === null) return null;
      const row = z.object({ payload: portfolioDraftSchema }).parse(result.data); if (row.payload.ownerId !== ownerId) throw new Error("Portfolio owner mismatch."); return row.payload;
    },
    async save(value, expectedRevision) {
      const record = portfolioDraftSchema.parse(value);
      const result = await client.schema("portfolio").rpc("save_draft", { candidate: record, expected_revision: expectedRevision });
      if (result.error !== null) throw new Error("Portfolio could not be saved. Check your session and server connection.");
      return z.boolean().parse(result.data);
    },
  };
}
