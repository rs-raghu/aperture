"use client";

import { useEffect, useState } from "react";
import { useFinance } from "../providers/finance-provider";
import { normalizeFinanceUiError, type FinanceUiError } from "../view-models/finance-error";

export function useFinanceQuery<T>(load: () => Promise<T>) {
  const { revision } = useFinance();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FinanceUiError | null>(null);
  useEffect(() => {
    let active = true;
    void load().then((value) => { if (active) { setData(value); setError(null); } })
      .catch((caught: unknown) => { if (active) setError(normalizeFinanceUiError(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision, load]);
  return { data, loading, error };
}
