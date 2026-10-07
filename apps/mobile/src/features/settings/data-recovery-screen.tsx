import { BACKUP_PRIVACY_WARNING } from "@aperture/backup";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apertureTheme } from "../../theme/foundation";
import { useBackup } from "./backup-provider";

export function DataRecoveryScreen() {
  const runtime = useBackup();
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const generate = async () => {
    setBusy(true);
    try { const backup = await runtime.service.export(runtime.ownerId); setSource(runtime.service.serialize(backup)); setStatus(`Generated ${backup.recordCount} records · checksum ${backup.integrity.digest}`); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(false); }
  };
  const validate = async () => {
    setBusy(true);
    try {
      const preview = await runtime.service.dryRunRestore(runtime.ownerId, source, "replace");
      setStatus(preview.valid ? `Ready for reviewed restore · ${preview.additions} additions · ${preview.deletions} deletions · confirmation ${preview.confirmation}` : `Restore blocked · ${preview.issues.map(({ message }) => message).join(" ")}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Backup inspection failed."); }
    finally { setBusy(false); }
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.header}><Text style={styles.eyebrow}>DATA & RECOVERY</Text><Text style={styles.title}>Keep a recovery copy</Text><Text style={styles.copy}>Export a versioned archive and validate every replacement before data changes.</Text></View>
    <View style={styles.warning}><Text style={styles.warningText}>{BACKUP_PRIVACY_WARNING}</Text></View>
    <View style={styles.card}><Text style={styles.cardTitle}>Backup JSON</Text><Text style={styles.copy}>Generate a full archive, then copy this text into secure storage.</Text><Pressable accessibilityRole="button" disabled={busy} onPress={() => { void generate(); }} style={styles.button}><Text style={styles.buttonText}>Generate full backup</Text></Pressable><TextInput accessibilityLabel="Backup JSON" multiline selectTextOnFocus style={styles.input} value={source} onChangeText={setSource} /><Pressable accessibilityRole="button" disabled={busy || source.trim().length === 0} onPress={() => { void validate(); }} style={styles.button}><Text style={styles.buttonText}>Validate replacement</Text></Pressable>{busy ? <ActivityIndicator color={apertureTheme.colors.focus} /> : null}{status.length > 0 ? <Text accessibilityRole="summary" style={styles.status}>{status}</Text> : null}</View>
    <View style={styles.card}><Text style={styles.cardTitle}>Delete personal data</Text><Text style={styles.copy}>Deletion requires a reviewed record count and the exact owner-bound confirmation from the transactional recovery service.</Text></View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: apertureTheme.colors.canvas }, screen: { padding: 20, paddingBottom: 70, gap: 16 }, header: { gap: 8 }, eyebrow: { color: "#4d6470", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }, title: { color: apertureTheme.colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900" }, copy: { color: apertureTheme.colors.muted, lineHeight: 21 }, warning: { backgroundColor: "#fff3d6", borderColor: "#d7a93e", borderWidth: 1, borderRadius: 14, padding: 14 }, warningText: { color: "#614611", fontWeight: "700", lineHeight: 20 }, card: { gap: 12, backgroundColor: "#fff", borderColor: "#ccd8d5", borderWidth: 1, borderRadius: 18, padding: 18 }, cardTitle: { color: apertureTheme.colors.ink, fontSize: 20, fontWeight: "900" }, input: { minHeight: 180, borderColor: "#aebfbb", borderWidth: 1, borderRadius: 12, padding: 12, color: apertureTheme.colors.ink, textAlignVertical: "top" }, button: { minHeight: 48, backgroundColor: apertureTheme.colors.ink, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }, buttonText: { color: "#fff", fontWeight: "900" }, status: { color: apertureTheme.colors.ink, lineHeight: 20 },
});
