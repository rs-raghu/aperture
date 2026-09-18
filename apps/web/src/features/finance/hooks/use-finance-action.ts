"use client";

import { useCallback, useRef, useState } from "react";
import { useFinance } from "../providers/finance-provider";
import { normalizeFinanceUiError, type FinanceUiError } from "../view-models/finance-error";

export function useFinanceAction() {
  const { refresh } = useFinance();
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FinanceUiError | null>(null);
  const execute = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | undefined> => {
    if (pendingRef.current) return undefined;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await operation();
      refresh();
      return result;
    } catch (caught) {
      setError(normalizeFinanceUiError(caught));
      return undefined;
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [refresh]);
  return { execute, pending, error, clearError: () => setError(null) };
}
