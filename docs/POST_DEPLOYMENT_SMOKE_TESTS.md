# Deployment and smoke-test checklist

Use synthetic data on a verified staging target first. Record target identity and actual results privately; local fixture results are not hosted verification.

Before release:

- Match the selected hosting/database/EAS identities, canonical HTTPS domain, owner UUID/email, and migration history to the operator record.
- Review unresolved audit findings and keep development/build servers inaccessible to untrusted clients.
- Validate both production environments, owner-only signup/redirect settings, publishable/server key separation, TLS, pool budgets, edge/provider limits, and rollback backups.
- Build the same commit and lockfile. Verify bypass flags are false, optional integrations/publication are off, and native identifiers/signing choices belong to the owner.

After deploying the web app:

1. Confirm HTTPS liveness returns only `status` and `service`. Anonymous private pages and readiness must redirect to sign-in; recovery must return 401 without a session.
2. Reject an unknown account. Sign in as the owner, verify authenticated readiness, and confirm private responses cannot be cached or framed.
3. Create Education relationships/assignment, Health hydration with units, Finance account/category/transaction with exact decimal money, and a saved calculator scenario.
4. Confirm Today aggregation, create a Planner item, and verify settings after reload and on the second client.
5. Export and validate the synthetic records. Review a replacement restore on staging, reject a wrong/stale confirmation, restore transactionally, and verify every feature/count. Test confirmed deletion only on synthetic staging records.
6. Curate a private Portfolio draft and confirm `/portfolio` remains 404 while the publication flag is off. Backups must exclude snapshots, tokens, ciphertext, and account credentials.
7. Sign out; private pages, recovery, and readiness must deny access. Refresh/expired-session paths must not display stale private records.
8. Inspect browser console, network failures, labels/focus, narrow layouts, and standalone manifest/icon behavior. Installation must not promise offline data access.

On actual Android/iOS devices, verify safe areas, keyboard reachability, back navigation, secure session persistence/logout, `aperture://auth/callback`, VoiceOver/TalkBack labels, touch targets, date/time entry, restored data, and network-loss feedback. Both platforms must point at the same verified Supabase project. An export or simulator bundle is not a device pass.

Optional live Strava requires owner registration, credentials, webhook subscription, scope review, and explicit testing of consent/callback, refresh, rate backoff, idempotent imports, duplicate webhook deliveries, and disconnect. Public Portfolio requires explicit operator configuration and a curated publication confirmation. Neither is a default smoke-test side effect.
