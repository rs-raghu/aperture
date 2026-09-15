import { useCallback, useRef, useState } from "react";
import { useHealth } from "../providers/health-provider";
import { normalizeHealthMobileError, type HealthMobileError } from "../view-models/health-error";

export function useHealthAction() {
  const { refresh } = useHealth();
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<HealthMobileError | null>(null);
  const execute = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | undefined> => {
    if (pendingRef.current) return undefined;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try { const result = await operation(); refresh(); return result; }
    catch (caught) { setError(normalizeHealthMobileError(caught)); return undefined; }
    finally { pendingRef.current = false; setPending(false); }
  }, [refresh]);
  return { execute, pending, error };
}
