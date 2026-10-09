"use client";

import { BACKUP_PRIVACY_WARNING, type RecoveryRestoreReview, type RecoveryDeletionReview } from "@aperture/backup";
import { featureRegistry } from "@aperture/feature-registry";
import { useEffect, useMemo, useState } from "react";
import { useBackup } from "./backup-provider";

function downloadJson(contents: string, filename: string): void {
  if (typeof URL.createObjectURL !== "function" || navigator.userAgent.includes("jsdom")) return;
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export function DataRecoveryScreen() {
  const runtime = useBackup();
  const backupFeatures = useMemo(() => runtime.service.featureIds(), [runtime.service]);
  const [selected, setSelected] = useState<readonly string[]>(backupFeatures);
  const [exportStatus, setExportStatus] = useState("");
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [preview, setPreview] = useState<RecoveryRestoreReview | null>(null);
  const [deletion, setDeletion] = useState<RecoveryDeletionReview | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [inspectionError, setInspectionError] = useState("");
  const [busy, setBusy] = useState(false);
  const names = useMemo(() => new Map(featureRegistry.listFeatures().map((feature) => [feature.id, feature.displayName])), []);
  useEffect(() => { let active = true; if (runtime.recovery !== undefined && runtime.canMutate) void runtime.recovery.status().then((value) => { if (active) setEnabled(value.enabled); }).catch(() => { if (active) setInspectionError("Recovery status is unavailable. Reload to retry."); }); return () => { active = false; }; }, [runtime]);
  const changeSource = (value: string) => { setSource(value); setPreview(null); setConfirmation(""); };

  const generate = async () => {
    setBusy(true);
    try {
      const backup = await runtime.service.export(runtime.ownerId, selected.length === backupFeatures.length ? undefined : selected);
      const contents = runtime.service.serialize(backup);
      changeSource(contents);
      downloadJson(contents, `aperture-backup-${backup.exportedAt.slice(0, 10)}.json`);
      setExportStatus(`Generated ${backup.recordCount} records · checksum ${backup.integrity.digest}`);
    } catch (error) { setExportStatus(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(false); }
  };

  const inspect = async () => {
    setBusy(true);
    setInspectionError("");
    setConfirmation("");
    try {
      if (enabled && runtime.recovery !== undefined) setPreview(await runtime.recovery.previewRestore(source, mode));
      else { const value = await runtime.service.dryRunRestore(runtime.ownerId, source, mode); setPreview({ ...value, issues: value.issues.map(({ message }) => message), conflicts: value.conflicts.length }); }
    }
    catch (error) { setPreview(null); setInspectionError(error instanceof Error ? error.message : "Backup inspection failed."); }
    finally { setBusy(false); }
  };

  async function mutate(work: () => Promise<void>, success: string) {
    setBusy(true); setInspectionError("");
    try { await work(); setPreview(null); setDeletion(null); setConfirmation(""); setDeleteConfirmation(""); setExportStatus(success); }
    catch (failure) { setInspectionError(failure instanceof Error ? failure.message : "Recovery failed."); }
    finally { setBusy(false); }
  }
  async function previewDeletion() {
    if (runtime.recovery === undefined) return;
    setBusy(true); setInspectionError(""); setDeleteConfirmation("");
    try { setDeletion(await runtime.recovery.previewDeletion(selected)); }
    catch (failure) { setDeletion(null); setInspectionError(failure instanceof Error ? failure.message : "Deletion preview failed."); }
    finally { setBusy(false); }
  }

  return <main className="settings-main">
    <header className="page-header"><div><p className="eyebrow">Settings · Data & recovery</p><h1>Keep a recovery copy</h1><p>Export a versioned archive, validate it before import, and review every conflict or replacement before data changes.</p></div><a className="secondary-link" href="/settings">Back to settings</a></header>
    <div className="error-banner" role="note"><strong>Plaintext export.</strong> {BACKUP_PRIVACY_WARNING.replace("Privacy warning: ", "")}</div>
    <section className="settings-grid">
      <article className="panel settings-card"><div className="panel-heading"><h2>Export</h2><p>Choose every workspace for a full archive or select individual features.</p></div>
        <div className="settings-fields">{backupFeatures.map((featureId) => <label className="settings-toggle" key={featureId}><span>{names.get(featureId) ?? featureId}</span><input aria-label={`Export ${names.get(featureId) ?? featureId}`} type="checkbox" disabled={busy} checked={selected.includes(featureId)} onChange={(event) => { setDeletion(null); setDeleteConfirmation(""); setSelected((current) => event.target.checked ? [...current, featureId] : current.filter((id) => id !== featureId)); }} /></label>)}</div>
        <button type="button" disabled={busy || selected.length === 0} onClick={() => { void generate(); }}>Download JSON backup</button>
        {exportStatus.length > 0 ? <p role="status">{exportStatus}</p> : null}
      </article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Validate and dry-run</h2><p>No records change while Aperture checks the owner, checksum, versions, domain schemas, and conflicts.</p></div>
        <label className="field"><span>Load backup file</span><input aria-label="Load backup file" type="file" accept="application/json,.json" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file === undefined) return; if (file.size > 8 * 1024 * 1024) { setInspectionError("This archive exceeds the recovery limit."); return; } void file.text().then(changeSource).catch(() => setInspectionError("The backup file could not be read.")); }} /></label>
        <label className="field"><span>Backup JSON</span><textarea aria-label="Backup JSON" rows={10} disabled={busy} value={source} onChange={(event) => changeSource(event.target.value)} /></label>
        <label className="field"><span>Import mode</span><select aria-label="Import mode" disabled={busy} value={mode} onChange={(event) => { setMode(event.target.value === "replace" ? "replace" : "merge"); setPreview(null); setConfirmation(""); }}><option value="merge">merge</option><option value="replace">replace</option></select></label>
        <button type="button" disabled={busy || source.trim().length === 0} onClick={() => { void inspect(); }}>Validate and preview</button>
        {inspectionError.length > 0 ? <p role="alert">{inspectionError}</p> : null}
        {preview === null ? null : <div role="status"><strong>{preview.valid ? "Ready for reviewed restore" : "Restore blocked"}</strong><p>{preview.additions} additions · {preview.replacements} replacements · {preview.deletions} deletions · {preview.conflicts} conflicts</p>{preview.issues.map((issue, index) => <p key={index}>{issue}</p>)}{preview.confirmation.length > 0 ? <p>Required confirmation: <code>{preview.confirmation}</code></p> : null}{!enabled && preview.valid ? <p>Apply this reviewed archive through the configured transactional recovery service.</p> : null}</div>}
        {enabled && preview?.valid ? <><label className="field"><span>Restore confirmation</span><input aria-label="Restore confirmation" disabled={busy} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label><button disabled={busy || confirmation !== preview.confirmation} onClick={() => void mutate(() => runtime.recovery!.restore(source, preview, confirmation), "Archive restored. Reload workspace to refresh open views.")}>Apply reviewed restore</button></> : null}
      </article>
    </section>
    <section className="panel settings-card"><div className="panel-heading"><h2>Delete personal data</h2><p>Create and verify a backup before deleting records. The feature selection above also controls this deletion preview.</p></div>{enabled ? <><button disabled={busy || selected.length === 0} onClick={() => void previewDeletion()}>Preview selected deletion</button>{deletion === null ? null : <><p role="status">Delete {deletion.recordCount} records from {deletion.featureIds.join(", ")}.</p><p>Required confirmation: <code>{deletion.confirmation}</code></p><label className="field"><span>Deletion confirmation</span><input aria-label="Deletion confirmation" disabled={busy} value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label><button disabled={busy || deleteConfirmation !== deletion.confirmation} onClick={() => void mutate(() => runtime.recovery!.deleteData(deletion, deleteConfirmation), "Selected data deleted. Reload workspace to refresh open views.")}>Delete reviewed data</button></>}</> : <p>Transactional recovery must be configured on your web server before data can be restored or deleted here.</p>}<p><a href="/today">Reload workspace</a></p></section>
  </main>;
}
