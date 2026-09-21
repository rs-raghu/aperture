import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { createFinanceMobileRuntime, FINANCE_DEVELOPMENT_MOBILE_OWNER_ID, type FinanceMobileRuntime } from "../adapters/finance-runtime";

export interface SavedMobileScenario {
  readonly id: string;
  readonly calculatorId: string;
  readonly name: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly output: unknown;
}

export interface FinanceContextValue extends FinanceMobileRuntime {
  readonly revision: number;
  readonly refresh: () => void;
  readonly favorites: ReadonlySet<string>;
  readonly recentCalculatorIds: readonly string[];
  readonly savedScenarios: readonly SavedMobileScenario[];
  readonly toggleFavorite: (calculatorId: string) => void;
  readonly recordCalculatorUse: (calculatorId: string) => void;
  readonly rememberScenario: (scenario: Omit<SavedMobileScenario, "id">) => SavedMobileScenario;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (typeof value === "object" && value !== null) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
  return value;
}

function cloneRecord(value: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
}

export interface FinanceProviderProps {
  readonly children: ReactNode;
  readonly ownerId?: string;
  readonly createRuntime?: (ownerId: string) => FinanceMobileRuntime;
}

export function FinanceProvider({ children, ownerId = FINANCE_DEVELOPMENT_MOBILE_OWNER_ID, createRuntime = createFinanceMobileRuntime }: FinanceProviderProps) {
  const [runtime] = useState(() => createRuntime(ownerId));
  const [revision, setRevision] = useState(0);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set());
  const [recentCalculatorIds, setRecentCalculatorIds] = useState<readonly string[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<readonly SavedMobileScenario[]>([]);
  const scenarioSequence = useRef(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const toggleFavorite = useCallback((calculatorId: string) => setFavorites((current) => {
    const next = new Set(current);
    if (next.has(calculatorId)) next.delete(calculatorId); else next.add(calculatorId);
    return next;
  }), []);
  const recordCalculatorUse = useCallback((calculatorId: string) => setRecentCalculatorIds((current) => [calculatorId, ...current.filter((id) => id !== calculatorId)].slice(0, 6)), []);
  const rememberScenario = useCallback((scenario: Omit<SavedMobileScenario, "id">) => {
    scenarioSequence.current += 1;
    const saved = Object.freeze({ ...scenario, id: `mobile-scenario-${scenarioSequence.current}`, input: cloneRecord(scenario.input), output: cloneValue(scenario.output) });
    setSavedScenarios((current) => [...current, saved]);
    return saved;
  }, []);
  const value = useMemo(() => ({ ...runtime, revision, refresh, favorites, recentCalculatorIds, savedScenarios, toggleFavorite, recordCalculatorUse, rememberScenario }), [runtime, revision, refresh, favorites, recentCalculatorIds, savedScenarios, toggleFavorite, recordCalculatorUse, rememberScenario]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const value = useContext(FinanceContext);
  if (value === null) throw new Error("Finance mobile components must be rendered inside FinanceProvider.");
  return value;
}
