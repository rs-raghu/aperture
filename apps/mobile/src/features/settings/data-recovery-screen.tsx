import { BACKUP_PRIVACY_WARNING, type RecoveryRestoreReview, type RecoveryDeletionReview } from "@aperture/backup";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apertureTheme } from "../../theme/foundation";
import { useBackup } from "./backup-provider";

export function DataRecoveryScreen() {
  const runtime = useBackup();
  const [source, setSource] = useState(""); const [status, setStatus] = useState(""); const [error, setError] = useState("");
  const [busy, setBusy] = useState(false); const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>(() => runtime.service.featureIds());
  const [review, setReview] = useState<RecoveryRestoreReview | null>(null); const [deletion, setDeletion] = useState<RecoveryDeletionReview | null>(null);
  const [confirmation, setConfirmation] = useState(""); const [deleteConfirmation, setDeleteConfirmation] = useState("");
  useEffect(() => { let active = true; if (runtime.recovery !== undefined && runtime.canMutate) void runtime.recovery.status().then((value) => { if (active) setEnabled(value.enabled); }).catch(() => { if (active) setError("Recovery status is unavailable. Reopen this screen to retry."); }); return () => { active = false; }; }, [runtime]);
  const changeSource = (value: string) => { setSource(value); setReview(null); setConfirmation(""); };
  async function perform(work: () => Promise<void>) {
    setBusy(true); setError(""); setStatus("");
    try { await work(); } catch (failure) { setError(failure instanceof Error ? failure.message : "Recovery failed."); } finally { setBusy(false); }
  }
  const generate = () => perform(async () => { const archive = await runtime.service.export(runtime.ownerId, selected); changeSource(runtime.service.serialize(archive)); setStatus(`Generated ${archive.recordCount} records · checksum ${archive.integrity.digest}`); });
  const validate = () => perform(async () => {
    setConfirmation("");
    const value = enabled && runtime.recovery !== undefined ? await runtime.recovery.previewRestore(source, "replace") : await runtime.service.dryRunRestore(runtime.ownerId, source, "replace").then((preview) => ({ ...preview, issues: preview.issues.map(({ message }) => message), conflicts: preview.conflicts.length }));
    setReview(value); setStatus(value.valid ? `Ready for reviewed restore · ${value.additions} additions · ${value.deletions} deletions · confirmation ${value.confirmation}` : `Restore blocked · ${value.issues.join(" ")}`);
  });
  const button = (label: string, disabled: boolean, work: () => Promise<void>) => <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy }} disabled={disabled || busy} onPress={() => void work()} style={[styles.button, disabled || busy ? { opacity: 0.5 } : null]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.screen}>
    <View style={styles.header}><Text style={styles.eyebrow}>DATA & RECOVERY</Text><Text style={styles.title}>Keep a recovery copy</Text><Text style={styles.copy}>Export a versioned archive and review every replacement before data changes.</Text></View>
    <View style={styles.warning}><Text style={styles.warningText}>{BACKUP_PRIVACY_WARNING}</Text></View>
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}{status ? <Text accessibilityRole="summary" style={styles.status}>{status}</Text> : null}{busy ? <ActivityIndicator color={apertureTheme.colors.focus} /> : null}
    <View style={styles.card}><Text style={styles.cardTitle}>Feature selection</Text><Text style={styles.copy}>Choose the features to export or delete.</Text>{runtime.service.featureIds().map((featureId) => <Pressable key={featureId} accessibilityRole="checkbox" accessibilityLabel={`Select ${featureId}`} accessibilityState={{ checked: selected.includes(featureId), disabled: busy }} disabled={busy} style={{ minHeight: 48, justifyContent: "center" }} onPress={() => { setSelected((current) => current.includes(featureId) ? current.filter((id) => id !== featureId) : [...current, featureId]); setDeletion(null); setDeleteConfirmation(""); }}><Text>{selected.includes(featureId) ? "☑" : "☐"} {featureId}</Text></Pressable>)}</View>
    <View style={styles.card}><Text style={styles.cardTitle}>Backup JSON</Text><Text style={styles.copy}>Generate an archive, then copy this text into secure storage. Replacement restores every feature contained in the archive.</Text>{button("Generate full backup", selected.length === 0, generate)}<TextInput accessibilityLabel="Backup JSON" editable={!busy} multiline selectTextOnFocus style={styles.input} value={source} onChangeText={changeSource} />{button("Validate replacement", source.trim().length === 0, validate)}
      {enabled && review?.valid ? <><Text style={styles.copy}>Required confirmation: {review.confirmation}</Text><TextInput accessibilityLabel="Restore confirmation" editable={!busy} style={[styles.input, { minHeight: 48 }]} value={confirmation} onChangeText={setConfirmation} autoCapitalize="none" autoCorrect={false} />{button("Apply reviewed restore", confirmation !== review.confirmation, () => perform(async () => { await runtime.recovery!.restore(source, review, confirmation); setReview(null); setConfirmation(""); setStatus("Archive restored. Reopen affected screens to refresh their data."); }))}</> : null}
    </View>
    <View style={styles.card}><Text style={styles.cardTitle}>Delete personal data</Text><Text style={styles.copy}>Create and verify a backup before deletion. Deletion affects the selected features and requires the exact confirmation from your server.</Text>{enabled ? <>{button("Preview selected deletion", selected.length === 0, () => perform(async () => { setDeleteConfirmation(""); setDeletion(await runtime.recovery!.previewDeletion(selected)); }))}{deletion === null ? null : <><Text style={styles.copy}>Delete {deletion.recordCount} records from {deletion.featureIds.join(", ")}. Required confirmation: {deletion.confirmation}</Text><TextInput accessibilityLabel="Deletion confirmation" editable={!busy} style={[styles.input, { minHeight: 48 }]} value={deleteConfirmation} onChangeText={setDeleteConfirmation} autoCapitalize="none" autoCorrect={false} />{button("Delete reviewed data", deleteConfirmation !== deletion.confirmation, () => perform(async () => { await runtime.recovery!.deleteData(deletion, deleteConfirmation); setDeletion(null); setDeleteConfirmation(""); setStatus("Selected data deleted. Reopen affected screens to refresh their data."); }))}</>}</> : <Text style={styles.copy}>Configure recovery on your owned HTTPS web server to restore or delete data here.</Text>}</View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: apertureTheme.colors.canvas }, screen: { padding: 20, paddingBottom: 70, gap: 16 }, header: { gap: 8 }, eyebrow: { color: "#4d6470", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }, title: { color: apertureTheme.colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900" }, copy: { color: apertureTheme.colors.muted, lineHeight: 21 }, warning: { backgroundColor: "#fff3d6", borderColor: "#d7a93e", borderWidth: 1, borderRadius: 14, padding: 14 }, warningText: { color: "#614611", fontWeight: "700", lineHeight: 20 }, card: { gap: 12, backgroundColor: "#fff", borderColor: "#ccd8d5", borderWidth: 1, borderRadius: 18, padding: 18 }, cardTitle: { color: apertureTheme.colors.ink, fontSize: 20, fontWeight: "900" }, input: { minHeight: 180, borderColor: "#aebfbb", borderWidth: 1, borderRadius: 12, padding: 12, color: apertureTheme.colors.ink, textAlignVertical: "top" }, button: { minHeight: 48, backgroundColor: apertureTheme.colors.ink, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }, buttonText: { color: "#fff", fontWeight: "900" }, status: { color: apertureTheme.colors.ink, lineHeight: 20 },
});
