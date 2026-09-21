import { signInAction } from "./actions";

const errorMessages: Readonly<Record<string, string>> = {
  "invalid-input": "Enter the owner email and password.",
  "sign-in-failed": "Sign-in failed. Check the owner account and try again.",
  configuration: "Authentication is not configured for this environment.",
  unauthorized: "This account is not allowed to access Aperture.",
};

export default async function SignInPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string }>;
}) {
  const error = (await searchParams).error;
  return (
    <main style={{ maxWidth: 440, margin: "10vh auto", padding: 24, fontFamily: "system-ui" }}>
      <p style={{ color: "#315c4b", fontWeight: 700, letterSpacing: 1 }}>APERTURE</p>
      <h1>Private sign in</h1>
      <p>This personal workspace accepts its configured owner account only.</p>
      {error === undefined ? null : (
        <p role="alert" style={{ color: "#9d2f2f" }}>{errorMessages[error] ?? errorMessages["sign-in-failed"]}</p>
      )}
      <form action={signInAction} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email
          <input name="email" type="email" autoComplete="username" required style={{ padding: 12 }} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input name="password" type="password" autoComplete="current-password" required style={{ padding: 12 }} />
        </label>
        <button type="submit" style={{ padding: 12, fontWeight: 700 }}>Sign in</button>
      </form>
    </main>
  );
}
