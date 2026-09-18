"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createFinanceWebRuntime, FINANCE_DEVELOPMENT_OWNER_ID, type FinanceWebRuntime } from "../adapters/finance-runtime";

export interface SavedWebScenario {
  readonly id: string;
  readonly calculatorId: string;
  readonly name: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly output: unknown;
}

interface FinanceContextValue extends FinanceWebRuntime {
  readonly revision: number;
  readonly refresh: () => void;
  readonly favorites: ReadonlySet<string>;
  readonly recentCalculatorIds: readonly string[];
  readonly savedScenarios: readonly SavedWebScenario[];
  readonly toggleFavorite: (calculatorId: string) => void;
  readonly recordCalculatorUse: (calculatorId: string) => void;
  readonly rememberScenario: (scenario: Omit<SavedWebScenario, "id">) => SavedWebScenario;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export interface FinanceProviderProps {
  readonly children: ReactNode;
  readonly ownerId?: string;
  readonly createRuntime?: (ownerId: string) => FinanceWebRuntime;
}

export function FinanceProvider({ children, ownerId = FINANCE_DEVELOPMENT_OWNER_ID, createRuntime = createFinanceWebRuntime }: FinanceProviderProps) {
  const [runtime] = useState(() => createRuntime(ownerId));
  const [revision, setRevision] = useState(0);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set());
  const [recentCalculatorIds, setRecentCalculatorIds] = useState<readonly string[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<readonly SavedWebScenario[]>([]);
  const [scenarioSequence, setScenarioSequence] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const toggleFavorite = useCallback((calculatorId: string) => setFavorites((current) => {
    const next = new Set(current);
    if (next.has(calculatorId)) next.delete(calculatorId); else next.add(calculatorId);
    return next;
  }), []);
  const recordCalculatorUse = useCallback((calculatorId: string) => setRecentCalculatorIds((current) => [calculatorId, ...current.filter((id) => id !== calculatorId)].slice(0, 6)), []);
  const rememberScenario = useCallback((scenario: Omit<SavedWebScenario, "id">) => {
    const id = `web-scenario-${scenarioSequence + 1}`;
    const saved = Object.freeze({ ...scenario, id, input: structuredClone(scenario.input), output: structuredClone(scenario.output) });
    setScenarioSequence((value) => value + 1);
    setSavedScenarios((current) => [...current, saved]);
    return saved;
  }, [scenarioSequence]);
  const value = useMemo(() => ({ ...runtime, revision, refresh, favorites, recentCalculatorIds, savedScenarios, toggleFavorite, recordCalculatorUse, rememberScenario }), [runtime, revision, refresh, favorites, recentCalculatorIds, savedScenarios, toggleFavorite, recordCalculatorUse, rememberScenario]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const value = useContext(FinanceContext);
  if (value === null) throw new Error("Finance components must be rendered inside FinanceProvider.");
  return value;
}
