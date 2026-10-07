import { z } from "@aperture/validation";
export function readPortfolioPublicationConfiguration(environment: Readonly<Record<string, string | undefined>>): { readonly enabled: false } | { readonly enabled: true; readonly ownerId: string; readonly origin: string } {
  if (environment.APERTURE_PORTFOLIO_PUBLIC !== "true") return { enabled: false };
  const ownerId = z.string().uuid().parse(environment.APERTURE_OWNER_ID);
  const url = new URL(environment.NEXT_PUBLIC_APP_ORIGIN ?? "");
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Public portfolio configuration requires an owned HTTPS origin.");
  return { enabled: true, ownerId, origin: url.origin };
}
