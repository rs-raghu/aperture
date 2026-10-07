# Professional portfolio — Phase 37

Portfolio is an optional feature, hidden by default and registered through `plugins/portfolio/aperture.plugin.json`. It provides private web/mobile editing at `/portfolio/edit`, responsive public web presentation at `/portfolio`, and a mobile link to the public web page. Nothing is published during implementation or testing.

## Curated content

`@aperture/portfolio` accepts only profile, biography, skills, projects, experience, education highlights, certifications, contact links, and an optional resume HTTPS link. Section entries have injected IDs, bounded text, descriptions, periods/dates, and optional links. Text is escaped; raw HTML rendering is not supported. HTTPS links reject embedded credentials. Mailto addresses appear only when explicitly entered in the contact section. The account email is never a default contact field.

The domain imports no Education, Health, or Finance package. Academic achievements are manually curated; no dashboard record is copied automatically. The public schema contains only curated content and its publication time, excluding owner IDs, revisions, private timestamps, and account configuration.

## Explicit publication

Drafts and prepared snapshots are independent. Saving a draft does not modify the public presentation. Preparing a snapshot requires a nonempty name, headline, biography, and the exact `PUBLISH PORTFOLIO <owner UUID>` confirmation. Later edits remain private until another snapshot is prepared. Unpublish removes the snapshot.

The server separately requires `APERTURE_PORTFOLIO_PUBLIC=true`, a fixed `APERTURE_OWNER_ID`, and an owned HTTPS `NEXT_PUBLIC_APP_ORIGIN`. The committed default is false. Public reads additionally require the existing server-only Supabase service-role key and project URL. The reader queries only the configured owner's `portfolio.drafts` row, validates its strict schema, and returns only the prepared snapshot. Missing configuration, an unpublished/malformed record, owner mismatch, or provider failure returns an unavailable public page. Private drafts are never a fallback.

Only the exact `/portfolio` route bypasses private-session middleware. `/portfolio/edit` remains protected. Published pages have name/headline metadata, curated biography descriptions, canonical URLs, Open Graph metadata, accessible headings/landmarks, contact navigation, and skip navigation. Unpublished pages disable indexing and return not-found. Public reads use no-store fetches and request-local React memoization; unpublish takes effect on the next request.

## Storage

Migration `20261007001000_portfolio.sql` creates an owner-scoped table with RLS. Anonymous clients receive no schema/table/function access. Authenticated clients access only their own draft. The invoker RPC `portfolio.save_draft` checks JWT ownership and the expected revision. A stale save from another device produces a conflict requiring reload instead of silently overwriting content. Memory and SQL adapters implement the same revision contract; the injected Supabase adapter uses the revision RPC. The root domain import contains no SDK/database-client import.

The checked-in Supabase API configuration exposes the owned portfolio schema. Its managed server role receives read access when present; anonymous clients do not receive database access to published snapshots. Remote use still requires the full discovered migration chain and API configuration applied by the operator.

Memory preview mode is temporary and isolated at the dashboard composition root. Web/mobile memory stores do not synchronize. Authenticated Supabase editing shares one durable owner row across platforms. There is no offline cache or write outbox. Load/save errors remain visible and can be retried; unsaved edits are not reported as persisted.

## Recovery

`@aperture/portfolio/backup` owns the contributor. Dashboard composition registers it alongside existing adapters, and recovery selection discovers their IDs instead of maintaining another feature-name list. Exports include the curated draft with `publication: null`. Restore preserves its record/revision inside the server transaction and removes the public snapshot, even if server publication is already enabled. Recovery cannot automatically republish content.

Server composition supplies the contributor through the generic PostgreSQL recovery extension:

```ts
createPostgresBackupService(database, {
  clock,
  idGenerator,
  additionalAdapters(transaction) {
    const repository = createPostgresPortfolioRepository(transaction);
    return [createPortfolioBackupAdapter(repository, repository)];
  },
});
```

The factory receives the active transaction for mutations. Client contributors offer export/preflight; restore/deletion require the server boundary and exact confirmation. Deleting Portfolio removes its public snapshot with the draft.

## Verification and limits

Tests cover strict content/link validation, private defaults, explicit publication, snapshot independence, concurrent saves, owner isolation, anonymous denial, invoker-RPC checks, real SDK request construction, private recovery, public projection, safe rendering, route boundaries, and web/mobile workflows. The database suite applies the complete discovered migration chain.

A resume link is supported. No contact form, remote image fetch, automatic resume PDF generation, third-party analytics, or automatic dashboard import is added. Live publication, remote database verification, and native execution were not performed. Synthetic snapshot tests do not enable publication or deploy a site.
