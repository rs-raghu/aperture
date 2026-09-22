# Dashboard routes

The dashboard layout enforces the authenticated owner boundary and owns the Phase 31 web data composition. Education, Health, Finance, and Calculator routes share one owner-scoped Supabase repository set and observable synchronization state. The explicit local development bypass uses isolated memory repositories.

Phase 32 wraps the route group in the generated responsive dashboard shell. Primary navigation, command search, feature visibility, theme accents, loading, and error states come from `@aperture/feature-registry`; feature route groups contribute only their local workspace presentation.
