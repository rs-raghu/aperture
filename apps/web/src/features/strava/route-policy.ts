// API handlers authenticate cookie/bearer sessions themselves. Callback and webhook handlers verify their own proofs.
export function delegatesStravaAuthentication(pathname: string): boolean {
  return ["/api/integrations/strava", "/api/integrations/strava/callback", "/api/integrations/strava/webhook", "/strava/complete"].includes(pathname);
}
