# Finance dashboard routes

The route files in this directory stay thin and render screens from `src/features/finance`. The shared dashboard layout owns the stable `FinanceProvider`; this nested layout contributes the Finance shell and navigation.

The dashboard composition root supplies the authenticated owner and shared Supabase repository to the Finance application services. Tests and the explicit local development bypass use isolated memory storage. The application must never collect bank passwords, PINs, OTPs, or raw banking credentials.
