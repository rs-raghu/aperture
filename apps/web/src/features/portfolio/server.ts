import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { portfolioDraftSchema, readPortfolioPublicationConfiguration, publicPortfolioSchema, type PublicPortfolio } from "@aperture/portfolio";
import { reportOperationalEvent } from "@/lib/operations/reporter";

export const readPublicPortfolio = cache(async (): Promise<{ readonly snapshot: PublicPortfolio; readonly origin: string } | null> => {
  try {
    const configuration = readPortfolioPublicationConfiguration(process.env);
    if (!configuration.enabled) return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) } });
    const result = await client.schema("portfolio").from("drafts").select("payload").eq("owner_id", configuration.ownerId).is("deleted_at", null).maybeSingle();
    if (result.error !== null || result.data === null) return null;
    const draft = portfolioDraftSchema.safeParse(result.data.payload);
    if (!draft.success || draft.data.ownerId !== configuration.ownerId || draft.data.publication === null) return null;
    return { origin: configuration.origin, snapshot: publicPortfolioSchema.parse(draft.data.publication) };
  } catch { reportOperationalEvent("portfolio-unavailable"); return null; }
});
