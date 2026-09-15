# Health web routes

These thin App Router files compose the feature-owned Health preview from `src/features/health`. The Health layout mounts one stable provider so navigation preserves the isolated memory runtime; a full refresh resets it.

The preview uses a synthetic owner for local testing. It is not authentication, does not persist data, and must not be used for personal health information.
