import { expect, it } from "vitest";
it("publishes domain and injected storage APIs separately", async () => {
  const domain = await import("@aperture/portfolio"); const storage = await import("@aperture/portfolio/storage"); const cloud = await import("@aperture/portfolio/supabase");
  expect(domain.createPortfolioService).toBeTypeOf("function"); expect(storage.createPostgresPortfolioRepository).toBeTypeOf("function"); expect(cloud.createSupabasePortfolioRepository).toBeTypeOf("function");
  expect("createSupabasePortfolioRepository" in domain).toBe(false);
});
