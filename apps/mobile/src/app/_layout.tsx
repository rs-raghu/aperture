import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { MobileAuthProvider, useMobileAuth } from "../lib/auth/mobile-auth-provider";

function AuthenticatedNavigator() {
  const authentication = useMobileAuth();
  const router = useRouter();
  const segments = useSegments();
  const inAuthenticationRoute = (segments as readonly string[])[0] === "(auth)";

  useEffect(() => {
    if (authentication.loading) return;
    if (authentication.user === null && !inAuthenticationRoute) router.replace("/sign-in" as never);
    if (authentication.user !== null && inAuthenticationRoute) router.replace("/education");
  }, [authentication.loading, authentication.user, inAuthenticationRoute, router]);

  if (authentication.loading) return null;
  if (authentication.user === null && !inAuthenticationRoute && segments.length > 0) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <MobileAuthProvider>
      <AuthenticatedNavigator />
    </MobileAuthProvider>
  );
}
