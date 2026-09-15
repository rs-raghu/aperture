import { useEffect, useState } from "react";
import { useHealth } from "../providers/health-provider";
import { normalizeHealthMobileError, type HealthMobileError } from "../view-models/health-error";

export function useHealthQuery<T>(load: () => Promise<T>) {
  const { revision } = useHealth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HealthMobileError | null>(null);
  useEffect(() => {
    let active = true;
    void load().then((value) => { if (active) { setData(value); setError(null); } })
      .catch((caught: unknown) => { if (active) setError(normalizeHealthMobileError(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision, load]);
  return { data, loading, error };
}
