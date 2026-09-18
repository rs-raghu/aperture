# Finance dashboard routes

The route files in this directory stay thin and render screens from `src/features/finance`. The shared dashboard layout owns the stable `FinanceProvider`; this nested layout contributes the Finance shell and navigation.

The current preview uses an in-memory repository, a synthetic owner, and real Finance application services. It must never collect bank passwords, PINs, OTPs, or raw banking credentials.
