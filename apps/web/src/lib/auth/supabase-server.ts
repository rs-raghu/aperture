import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { readWebAuthenticationConfiguration } from "./configuration";

export async function createWebServerSupabaseClient() {
  const configuration = readWebAuthenticationConfiguration();
  if (configuration.mode !== "supabase") throw new Error("Supabase authentication is disabled in development bypass mode.");
  const cookieStore = await cookies();
  return createServerClient(configuration.supabaseUrl!, configuration.supabasePublishableKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        for (const { name, value, options } of values) cookieStore.set(name, value, options);
      },
    },
  });
}
