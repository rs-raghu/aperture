"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createStravaClient, type StravaClient, type StravaClientStatus } from "@aperture/strava";

export function StravaScreen({ client: injected }: { readonly client?: StravaClient }) {
  const client = useMemo(() => injected ?? createStravaClient({}), [injected]);
  const [snapshot, setSnapshot] = useState<StravaClientStatus | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [message, setMessage] = useState<string | null>(null);
  const [deleteImported, setDeleteImported] = useState(false); const [confirmation, setConfirmation] = useState("");
  const refresh = useCallback(async () => { setSnapshot(await client.status()); }, [client]);
  useEffect(() => { let active = true; void client.status().then((result) => { if (active) setSnapshot(result); }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "The integration status is unavailable."); }); return () => { active = false; }; }, [client]);
  async function perform(work: () => Promise<void>) { setBusy(true); setError(null); setMessage(null); try { await work(); await refresh(); } catch (failure) { setError(failure instanceof Error ? failure.message : "The operation failed."); } finally { setBusy(false); } }
  const status = snapshot?.status;
  return <main className="settings-main"><header className="page-header"><div><p className="eyebrow">Optional integration</p><h1>Strava runs, in your workspace</h1><p>Import running activities visible to Everyone or Followers. Private activities and GPS routes are excluded.</p></div></header>
    {error === null ? null : <p className="error-banner" role="alert">{error}</p>}{message === null ? null : <p role="status">{message}</p>}
    <section className="panel settings-card"><h2>Connection</h2>{snapshot === null ? <p role="status">Loading integration status…</p> : <>
      <p>Status: <strong>{status?.status}</strong></p>
      {snapshot.mode === "disabled" ? <p>Strava is disabled on this server. Your other features remain available.</p> : null}
      {snapshot.mode === "mock" ? <p role="status">Synthetic development mode. Imports live in an isolated temporary demo store and do not appear in your dashboard Health records.</p> : null}
      {status?.lastSuccessAt === undefined ? <p>No successful synchronization yet.</p> : <p>Last success: {status.lastSuccessAt}</p>}
      {status?.lastErrorCode === undefined ? null : <p>Last error: {status.lastErrorCode}</p>}{status?.retryAt === undefined ? null : <p>Retry after: {status.retryAt}</p>}
      {status?.nextPage === undefined ? null : <p>More activities are available. Sync again to continue importing.</p>}
    </>}
    <div className="settings-fields"><button disabled={busy} onClick={() => void perform(refresh)}>Refresh status</button>
      <button disabled={busy || snapshot === null || snapshot.mode === "disabled"} onClick={() => void perform(async () => { const url = await client.connect(); window.location.assign(url); })}>Connect Strava</button>
      <button disabled={busy || snapshot?.mode === "disabled" || status?.athleteId === undefined} onClick={() => void perform(async () => { const count = await client.sync(); setMessage(`${count} new runs imported.`); })}>Sync runs</button>
    </div></section>
    <section className="panel settings-card"><h2>Disconnect & privacy</h2><p>Disconnect removes the server’s saved tokens. Existing imported runs are kept unless you choose to delete them.</p>
      <label className="settings-toggle"><span>Delete imported runs when disconnecting</span><input type="checkbox" checked={deleteImported} onChange={(event) => setDeleteImported(event.target.checked)} /></label>
      {deleteImported ? <label className="field"><span>Type DELETE STRAVA IMPORTS {status?.ownerId}</span><input aria-label="Deletion confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label> : null}
      <button disabled={busy || snapshot?.mode === "disabled" || status?.athleteId === undefined} onClick={() => void perform(async () => { await client.disconnect(deleteImported, confirmation); setConfirmation(""); setMessage("Strava disconnected."); })}>Disconnect Strava</button>
    </section></main>;
}
