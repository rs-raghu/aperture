# Future deployment plan

This is a target inventory, not a readiness statement. Aperture v2 cannot be deployed as an application in Phase 4.

## Vercel

The future Next.js application is intended for Vercel. A later phase must add executable routes, validated configuration, server/client boundaries, security headers, build verification, and deployment settings before deployment.

## Supabase

Supabase is intended to provide PostgreSQL and Auth. Database work begins no earlier than Phase 26 and must include reviewed migrations, disabled public signup, owner-based Row Level Security for all personal-data tables, policy tests, backup planning, and separation of publishable and server-only keys.

## Expo and EAS

The future React Native application is intended for Expo/EAS. A later phase must finalize application identifiers, configure secure hosted values, add executable routes, verify device behavior, and introduce EAS tooling only when builds are approved.

## Not performed

Phase 4 does not create deployment projects, connect accounts, upload secrets, run a production build, publish artifacts, migrate a database, launch an application, or claim deployment readiness.
