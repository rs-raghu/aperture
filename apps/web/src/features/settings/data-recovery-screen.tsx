"use client";

import { BACKUP_PRIVACY_WARNING, type RestorePreview } from "@aperture/backup";
import { featureRegistry } from "@aperture/feature-registry";
import { useMemo, useState } from "react";
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
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [inspectionError, setInspectionError] = useState("");
  const [busy, setBusy] = useState(false);
  const names = useMemo(() => new Map(featureRegistry.listFeatures().map((feature) => [feature.id, feature.displayName])), []);

  const generate = async () => {
    setBusy(true);
    try {
      const backup = await runtime.service.export(runtime.ownerId, selected.length === backupFeatures.length ? undefined : selected);
      const contents = runtime.service.serialize(backup);
      downloadJson(contents, `aperture-backup-${backup.exportedAt.slice(0, 10)}.json`);
      setExportStatus(`Generated ${backup.recordCount} records · checksum ${backup.integrity.digest}`);
    } catch (error) { setExportStatus(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(false); }
  };

  const inspect = async () => {
    setBusy(true);
    setInspectionError("");
    try { setPreview(await runtime.service.dryRunRestore(runtime.ownerId, source, mode)); }
    catch (error) { setPreview(null); setInspectionError(error instanceof Error ? error.message : "Backup inspection failed."); }
    finally { setBusy(false); }
  };

  return <main className="settings-main">
    <header className="page-header"><div><p className="eyebrow">Settings · Data & recovery</p><h1>Keep a recovery copy</h1><p>Export a versioned archive, validate it before import, and review every conflict or replacement before data changes.</p></div><a className="secondary-link" href="/settings">Back to settings</a></header>
    <div className="error-banner" role="note"><strong>Plaintext export.</strong> {BACKUP_PRIVACY_WARNING.replace("Privacy warning: ", "")}</div>
    <section className="settings-grid">
      <article className="panel settings-card"><div className="panel-heading"><h2>Export</h2><p>Choose every workspace for a full archive or select individual features.</p></div>
        <div className="settings-fields">{backupFeatures.map((featureId) => <label className="settings-toggle" key={featureId}><span>{names.get(featureId) ?? featureId}</span><input aria-label={`Export ${names.get(featureId) ?? featureId}`} type="checkbox" checked={selected.includes(featureId)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, featureId] : current.filter((id) => id !== featureId))} /></label>)}</div>
        <button type="button" disabled={busy || selected.length === 0} onClick={() => { void generate(); }}>Download JSON backup</button>
        {exportStatus.length > 0 ? <p role="status">{exportStatus}</p> : null}
      </article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Validate and dry-run</h2><p>No records change while Aperture checks the owner, checksum, versions, domain schemas, and conflicts.</p></div>
        <label className="field"><span>Backup JSON</span><textarea aria-label="Backup JSON" rows={10} value={source} onChange={(event) => setSource(event.target.value)} /></label>
        <label className="field"><span>Import mode</span><select aria-label="Import mode" value={mode} onChange={(event) => setMode(event.target.value as "merge" | "replace")}><option value="merge">merge</option><option value="replace">replace</option></select></label>
        <button type="button" disabled={busy || source.trim().length === 0} onClick={() => { void inspect(); }}>Validate and preview</button>
        {inspectionError.length > 0 ? <p role="alert">{inspectionError}</p> : null}
        {preview === null ? null : <div role="status"><strong>{preview.valid ? "Ready for reviewed restore" : "Restore blocked"}</strong><p>{preview.additions} additions · {preview.replacements} replacements · {preview.deletions} deletions · {preview.conflicts.length} conflicts</p>{preview.issues.map((issue, index) => <p key={`${issue.code}-${index}`}>{issue.message}</p>)}{preview.confirmation.length > 0 ? <p>Required confirmation: <code>{preview.confirmation}</code></p> : null}{!runtime.canMutate && preview.valid ? <p>Apply this reviewed archive through the configured transactional recovery service.</p> : null}</div>}
      </article>
    </section>
    <section className="panel settings-card"><div className="panel-heading"><h2>Delete personal data</h2><p>Deletion uses the same review-first workflow and an exact owner-bound confirmation. Create and verify a backup before deleting records.</p></div><p>Run the deletion preview through the transactional recovery service to see the affected feature list and record count before confirmation.</p></section>
  </main>;
}
