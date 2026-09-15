"use client";

import { useEffect, useState } from "react";
import { useHealth } from "../providers/health-provider";
import { normalizeHealthUiError, type HealthUiError } from "../view-models/health-error";

export function useHealthQuery<T>(load: () => Promise<T>) {
  const { revision } = useHealth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HealthUiError | null>(null);

  useEffect(() => {
    let active = true;
    void load().then((value) => {
      if (active) {
        setData(value);
        setError(null);
      }
    }).catch((caught: unknown) => {
      if (active) setError(normalizeHealthUiError(caught));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [revision, load]);

  return { data, loading, error };
}
