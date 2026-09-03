"use client";

import { useEffect, useState } from "react";
import { useEducation } from "../providers/education-provider";
import { normalizeEducationUiError, type EducationUiError } from "../view-models/education-error";

export function useEducationQuery<T>(load: () => Promise<T>) {
  const { revision } = useEducation();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EducationUiError | null>(null);

  useEffect(() => {
    let active = true;
    void load().then((value) => {
      if (active) { setData(value); setError(null); }
    }).catch((caught) => {
      if (active) setError(normalizeEducationUiError(caught));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision, load]);

  return { data, loading, error };
}
