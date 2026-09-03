"use client";

import { useCallback, useRef, useState } from "react";
import { useEducation } from "../providers/education-provider";
import { normalizeEducationUiError, type EducationUiError } from "../view-models/education-error";

export function useEducationAction() {
  const { refresh } = useEducation();
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<EducationUiError | null>(null);

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
      setError(normalizeEducationUiError(caught));
      return undefined;
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [refresh]);

  return { execute, pending, error, clearError: () => setError(null) };
}
