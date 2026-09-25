# Settings and privacy

Phase 34 introduces `@aperture/settings` as the framework-neutral owner of personal preferences. One owner-scoped aggregate stores portable presentation, regional, unit, planning, calculator, feature, widget, and privacy choices. The service creates conservative defaults on first read and serializes mutations so several rapid controls cannot overwrite one another.

## Preference boundaries

Portable preferences include theme, locale, timezone, ISO currency, date format, units, week start, fiscal-year start, GPA scale, and calculator assumptions. Feature visibility and Today widget visibility are manifest-keyed maps. Turning either off changes presentation only; the service never calls a feature repository or deletes feature data.

Platform preferences are nested under explicit `web` and `mobile` keys. Web currently owns compact navigation and reduced motion. Mobile owns haptics and reduced motion. Platform update methods can mutate only their selected platform record.

All optional privacy collection defaults to off:

- usage analytics;
- crash reports;
- personalized insights;
- integration data sharing.

Today and Settings are protected manifest features. The settings service rejects attempts to disable any manifest marked as non-disableable and rejects unknown feature or widget identifiers.

## Durability and client safety

The memory repository is reserved for explicit preview and test composition. PostgreSQL and Supabase composition persist the same aggregate in `platform.user_preferences`, protected by the existing owner RLS policy. `20260922002000_settings.sql` adds structured JSON columns and object constraints without replacing or deleting existing preference data.

Integration status is projected from `platform.integration_connections`. The public repository has no method for `platform.integration_credentials`, the Phase 34 migration revokes every authenticated-client privilege on that table, and the client snapshot contains only provider ID, connection state, timestamps, and a non-secret error code. Ciphertext and credential metadata remain outside client-facing types and queries.

Web and mobile settings interfaces edit the same portable record, expose their own platform controls, show sanitized connection health, and save changes automatically. The dashboard shells and Today screens consume those persisted preferences so changes survive navigation and synchronize through Supabase.
