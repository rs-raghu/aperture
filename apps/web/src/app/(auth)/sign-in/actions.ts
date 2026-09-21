"use server";

import { createSupabaseAuthenticationService } from "@aperture/auth";
import { redirect } from "next/navigation";

import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";
import { createWebServerSupabaseClient } from "@/lib/auth/supabase-server";

export async function signInAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || password.length === 0) {
    redirect("/sign-in?error=invalid-input");
  }
  let configuration;
  try {
    configuration = readWebAuthenticationConfiguration();
  } catch {
    redirect("/sign-in?error=configuration");
  }
  if (configuration.mode === "development-bypass") redirect("/education");
  try {
    const client = await createWebServerSupabaseClient();
    await createSupabaseAuthenticationService(client, configuration).signIn({ email, password });
  } catch {
    redirect("/sign-in?error=sign-in-failed");
  }
  redirect("/education");
}

export async function signOutAction(): Promise<void> {
  try {
    const configuration = readWebAuthenticationConfiguration();
    if (configuration.mode === "supabase") {
      const client = await createWebServerSupabaseClient();
      await createSupabaseAuthenticationService(client, configuration).signOut();
    }
  } finally {
    redirect("/sign-in");
  }
}
