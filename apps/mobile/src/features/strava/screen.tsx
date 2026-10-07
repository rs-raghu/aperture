import { useEffect, useMemo, useState } from "react";
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StravaClient, StravaClientStatus } from "@aperture/strava";
import { useMobileAuth } from "../../lib/auth/mobile-auth-provider";
import { createMobileStravaClient, validateStravaAuthorizationUrl } from "./client";

export function StravaScreen({ client: injected }: { readonly client?: StravaClient }) {
  const auth = useMobileAuth();
  const runtime = useMemo(() => { try { return { client: injected ?? createMobileStravaClient(auth), error: null }; } catch (failure) { return { client: null, error: failure instanceof Error ? failure.message : "Strava is unavailable." }; } }, [auth, injected]);
  const [snapshot, setSnapshot] = useState<StravaClientStatus | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [message, setMessage] = useState<string | null>(null); const [deleteImported, setDeleteImported] = useState(false); const [confirmation, setConfirmation] = useState("");
  useEffect(() => {
    let active = true;
    const load = () => { if (runtime.client !== null) void runtime.client.status().then((value) => { if (active) { setSnapshot(value); setError(null); } }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "Status could not be loaded."); }); };
    load(); const subscription = AppState.addEventListener("change", (state) => { if (state === "active") load(); });
    return () => { active = false; subscription.remove(); };
  }, [runtime]);
  async function perform(work: (client: StravaClient) => Promise<void>) {
    if (runtime.client === null) return;
    setBusy(true); setError(null); setMessage(null);
    try { await work(runtime.client); setSnapshot(await runtime.client.status()); } catch (failure) { setError(failure instanceof Error ? failure.message : "The Strava operation failed."); } finally { setBusy(false); }
  }
  const status = snapshot?.status;
  const button = (label: string, disabled: boolean, work: (client: StravaClient) => Promise<void>) => <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy }} disabled={disabled || busy} style={[styles.button, disabled || busy ? styles.disabled : null]} onPress={() => void perform(work)}><Text style={styles.buttonText}>{label}</Text></Pressable>;
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen}><Text style={styles.eyebrow}>OPTIONAL INTEGRATION</Text><Text style={styles.title}>Strava runs</Text><Text style={styles.copy}>Import running activities visible to Everyone or Followers. Private activities and GPS routes are excluded.</Text>
    {runtime.error || error ? <Text accessibilityRole="alert" style={styles.error}>{runtime.error ?? error}</Text> : null}{message ? <Text accessibilityRole="summary">{message}</Text> : null}
    <View style={styles.card}><Text style={styles.heading}>Connection</Text><Text>Status: {status?.status ?? (runtime.client === null ? "unavailable" : "loading")}</Text>
      {snapshot?.mode === "disabled" ? <Text style={styles.copy}>Strava is disabled on this server. Your other features remain available.</Text> : null}
      {snapshot?.mode === "mock" ? <Text style={styles.copy}>Synthetic development mode. Imports use an isolated temporary demo store and do not appear in your dashboard Health records.</Text> : null}
      <Text style={styles.copy}>Last success: {status?.lastSuccessAt ?? "No successful synchronization yet"}</Text>
      {status?.lastErrorCode ? <Text style={styles.copy}>Last error: {status.lastErrorCode}</Text> : null}{status?.retryAt ? <Text>Retry after: {status.retryAt}</Text> : null}
      {status?.nextPage ? <Text>Sync again to continue importing more activities.</Text> : null}
      {button("Refresh status", runtime.client === null, async (client) => { setSnapshot(await client.status()); })}
      {button("Connect Strava", snapshot === null || snapshot.mode === "disabled", async (client) => { const url = validateStravaAuthorizationUrl(await client.connect(), process.env.EXPO_PUBLIC_APERTURE_WEB_URL ?? "https://example.invalid"); await Linking.openURL(url); })}
      {button("Sync runs", snapshot?.mode === "disabled" || status?.athleteId === undefined, async (client) => { setMessage(`${await client.sync()} new runs imported.`); })}
    </View>
    <View style={styles.card}><Text style={styles.heading}>Disconnect & privacy</Text><Text style={styles.copy}>Disconnect removes saved server tokens. Imported runs remain unless you choose to delete them.</Text>
      <View style={styles.toggle}><Text style={styles.copy}>Delete imported runs</Text><Switch accessibilityLabel="Delete imported runs" value={deleteImported} onValueChange={setDeleteImported} /></View>
      {deleteImported ? <><Text style={styles.copy}>Type DELETE STRAVA IMPORTS {status?.ownerId}</Text><TextInput accessibilityLabel="Deletion confirmation" style={styles.input} autoCapitalize="none" value={confirmation} onChangeText={setConfirmation} /></> : null}
      {button("Disconnect Strava", snapshot?.mode === "disabled" || status?.athleteId === undefined, async (client) => { await client.disconnect(deleteImported, confirmation); setConfirmation(""); setMessage("Strava disconnected."); })}
    </View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#f3f5f2" }, screen: { padding: 20, paddingBottom: 70, gap: 16 }, eyebrow: { color: "#a13d14", fontWeight: "800", letterSpacing: 1 }, title: { fontSize: 30, fontWeight: "900", color: "#183a35" }, copy: { color: "#52645f", lineHeight: 22 }, card: { padding: 18, borderRadius: 18, backgroundColor: "#fff", gap: 14 }, heading: { fontSize: 20, fontWeight: "800", color: "#183a35" }, error: { color: "#8a2929", fontWeight: "700" }, button: { minHeight: 48, padding: 14, backgroundColor: "#183a35", borderRadius: 12, justifyContent: "center" }, buttonText: { color: "#fff", fontWeight: "800" }, disabled: { opacity: 0.5 }, toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, input: { borderColor: "#aebfbb", borderWidth: 1, borderRadius: 12, minHeight: 48, padding: 12 } });
