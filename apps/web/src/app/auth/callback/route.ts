import { createSupabaseAuthenticationService } from "@aperture/auth";
import { NextResponse, type NextRequest } from "next/server";

import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";
import { createWebServerSupabaseClient } from "@/lib/auth/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const configuration = readWebAuthenticationConfiguration();
    if (configuration.mode === "supabase") {
      const client = await createWebServerSupabaseClient();
      await createSupabaseAuthenticationService(client, configuration).handleAuthenticationCallback({ callbackUrl: request.url });
    }
    return NextResponse.redirect(new URL("/education", request.url));
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=sign-in-failed", request.url));
  }
}
