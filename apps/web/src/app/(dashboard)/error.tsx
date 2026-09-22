"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }: { readonly error: Error & { readonly digest?: string }; readonly reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="dashboard-state-page"><p className="eyebrow">Workspace interrupted</p><h1>This page could not be loaded</h1><p>The error boundary kept the rest of Aperture available. Try the page again.</p><button className="button button-primary" type="button" onClick={reset}>Try again</button></main>;
}
