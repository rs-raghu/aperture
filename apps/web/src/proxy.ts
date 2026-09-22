import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";

export async function proxy(request: NextRequest) {
  let configuration;
  try {
    configuration = readWebAuthenticationConfiguration();
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=configuration", request.url));
  }
  if (configuration.mode === "development-bypass") return NextResponse.next();

  let response = NextResponse.next({ request });
  const client = createServerClient(configuration.supabaseUrl!, configuration.supabasePublishableKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values) response.cookies.set(name, value, options);
      },
    },
  });
  const { data, error } = await client.auth.getUser();
  const emailAllowed = data.user?.email?.trim().toLowerCase() === configuration.ownerEmail.trim().toLowerCase();
  const idAllowed = configuration.ownerId === undefined || data.user?.id === configuration.ownerId;
  if (error !== null || data.user === null || !emailAllowed || !idAllowed) {
    if (data.user !== null) await client.auth.signOut({ scope: "local" });
    return NextResponse.redirect(new URL(emailAllowed === false ? "/sign-in?error=unauthorized" : "/sign-in", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!sign-in|auth/callback|_next/static|_next/image|favicon.ico).*)"],
};
