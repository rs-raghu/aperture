# Optional Strava integration — Phase 36

Strava is a separate plug-in, hidden by default until enabled in Settings. `APERTURE_STRAVA_MODE=disabled` is the server default. Neither installation nor missing Strava configuration prevents the other dashboard features from working. Web and mobile expose `/strava`; the feature manifest owns its routes, permissions, entry points, and migration.

## Server configuration

Apply the normal discovered migration chain, including `20261007000000_strava.sql`. It adds six private, owner-scoped tables, encrypted credentials, one-use authorization state, source receipts, a durable webhook queue, and a separate short queue lock. Client roles have no schema/table grants. Sanitized status is projected into `platform.integration_connections` for Settings.

Live mode requires server-only `APERTURE_STRAVA_MODE=live`, `APERTURE_OWNER_ID`, `DATABASE_URL`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`, `STRAVA_TOKEN_ENCRYPTION_KEY`, and `STRAVA_WEBHOOK_VERIFY_TOKEN`. Register the callback `/api/integrations/strava/callback` with Strava. Set `APERTURE_WEB_ORIGIN` to the fixed application origin; by default the callback URI supplies that origin. Use an owner UUID matching the authenticated Supabase account. The database role must access the private Strava schema and the normal Health/platform tables; its connection string never goes to either client. Remote PostgreSQL connections verify TLS certificates and use a bounded pool.

The encryption key is exactly 32 random bytes encoded as canonical base64. Provision it in the deployment secret manager. AES-256-GCM uses independent random nonces and owner-bound authenticated data. Versioned envelopes contain both access and refresh tokens. Key replacement requires reconnecting existing accounts; no key material is placed in migrations, status, archives, or mobile configuration.

Register a webhook subscription for `/api/integrations/strava/webhook`, with the server verification token. Set `STRAVA_WEBHOOK_SUBSCRIPTION_ID` to the assigned positive integer before accepting deliveries. Subscription registration is an external operator step, not an automatic account mutation.

Mobile additionally needs the public, non-secret `EXPO_PUBLIC_APERTURE_WEB_URL`, containing only the owned HTTPS server origin. It sends its short-lived Supabase bearer session to that server; the server validates the user with Supabase and applies the owner allowlist. Integration tokens never reach the device. HTTP localhost/Android emulator loopback is allowed only with the explicitly guarded development authentication bypass. The OAuth browser callback consumes owner-bound state without relying on a web cookie and redirects to a fixed public completion page with dashboard/mobile return links. Foregrounding mobile refreshes the status.

## Authorization and privacy

The requested scope is `activity:read`. Activities visible to Everyone or Followers are available; private activities, GPS geometry, profile details, photos, and social fields are excluded. Only Run, TrailRun, and VirtualRun map to Health. OAuth state has 256 random bits, expires after ten minutes, is hashed at rest, and is consumed before code exchange even if exchange fails. The documented Strava authorization flow does not provide PKCE parameters; state is validated server-side. The client secret stays in server POST bodies or the revoke authorization header.

Cookie-authenticated mutations require the configured application Origin. Native bearer requests have no ambient cookies. API handlers enforce owner authentication themselves; only their exact paths are delegated by the web session proxy. OAuth callbacks use their one-use state proof; webhook verification uses constant-time token comparison. Responses disable caching and referrers. Next development request logging excludes Strava API paths. Deployment ingress/access logs must also redact callback query strings and webhook verification tokens.

Strava does not document a POST webhook signature. Deliveries must match the configured subscription, known connected athlete, and a bounded event-time window. Event bodies are limited to 16 KiB. The handler stores a deduplicated job and acknowledges it before processing through Next's `after` hook. Processing re-fetches the authoritative activity: an untrusted delete event cannot delete a readable run. A 404 removes the imported Health record; deauthorization removes imported data only after the athlete API or token refresh confirms 401. Queue capacity is serialized separately from long Health import transactions. Manual sync drains pending jobs too, so queued work survives server restarts and interrupted background execution.

## Import and synchronization

Mappings validate explicit meters/seconds and timestamps through Health input schemas. Every create/update/complete/delete uses the real Health service and the same transaction as the source receipt. There are no direct integration writes into Health tables. Unsupported activity types are skipped; invalid supported data fails and rolls back the batch. Receipts are scoped by owner, athlete, and activity ID. An intentional local deletion retains its receipt, preventing resurrection during ordinary synchronization. Health records additionally carry immutable, non-secret `sourceReference` identifiers; restored archives retain them, so reconnecting after a restore remains idempotent even though private integration state is excluded.

Refresh tokens rotate server-side near expiration. The encrypted rotation commits before importing activities, so an import rollback cannot restore an invalid refresh token. Each sync imports at most five pages of 100 activities and persists a continuation cursor. Completed pagination advances the captured sync watermark; subsequent syncs overlap five minutes for duplicate-safe reconciliation. Rate-limit errors persist a retry time, respect explicit Retry-After information, and fall back to UTC quarter-hour/daily resets. Backoff does not consume webhook retry attempts. Other failed jobs stop after three attempts. Concurrent workers check pending state again under the owner transaction lock.

Disconnect uses Strava's documented `/oauth/revoke` endpoint and always deletes local tokens, OAuth state, and queued events. Remote revoke failure remains visible as `strava-remote-revoke-failed`. Imported Health records are retained by default. Deleting imports requires the exact `DELETE STRAVA IMPORTS <owner UUID>` confirmation. Settings replacement/deletion cascades to all private Strava records. Full recovery archives exclude credentials; restored integration statuses require reconnecting.

## Development and verification

`APERTURE_STRAVA_MODE=mock` uses synthetic activities and an isolated temporary server store. It is rejected in production. Mock imports do not appear in the separate dashboard memory Health store; both screens disclose this limitation. The real Strava and Health services still validate and execute all mocked workflows. Tests inject time, IDs, transport failures, and transaction faults. The server-only package subpath isolates Node crypto, PostgreSQL, and credentials from the client-safe public import.

Focused suites cover OAuth replay/expiry/scopes, encryption/tamper/owner binding, minimal-scope requests, provider error sanitization, rate resets, refresh rotation with rollback, pagination, concurrent duplicate prevention, confirmation, queue capacity/retry/backoff, authoritative deletion/revocation, schema permissions, archive restore provenance, public imports, and web/mobile controls. No live Strava account, remote database, registered subscription, or native device was exercised. Live verification requires operator-owned app registration and credentials; local implementation and synthetic tests do not require them.

## Official references

- [Strava authentication](https://developers.strava.com/docs/authentication/) — scope, authorization, token rotation, and revoke endpoint.
- [Strava webhooks](https://developers.strava.com/docs/webhooks/) — challenge verification, delivery metadata, deletion, and deauthorization.
- [Strava rate limits](https://developers.strava.com/docs/rate-limits/) — 15-minute/daily limits and response headers.

These references were reviewed on 2026-10-07. External app registration, subscription creation, and secret provisioning remain operator steps.
