import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  createEducationMobileRuntime,
  DEVELOPMENT_MOBILE_OWNER_ID,
  type EducationMobileRuntime,
} from "../adapters/education-runtime";

export interface EducationContextValue extends EducationMobileRuntime {
  readonly revision: number;
  readonly refresh: () => void;
}

const EducationContext = createContext<EducationContextValue | null>(null);

export interface EducationProviderProps {
  readonly children: ReactNode;
  readonly ownerId?: string;
  readonly createRuntime?: (ownerId: string) => EducationMobileRuntime;
}

export function EducationProvider({
  children,
  ownerId = DEVELOPMENT_MOBILE_OWNER_ID,
  createRuntime = createEducationMobileRuntime,
}: EducationProviderProps) {
  const [runtime] = useState(() => createRuntime(ownerId));
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  return (
    <EducationContext.Provider value={{ ...runtime, revision, refresh }}>
      {children}
    </EducationContext.Provider>
  );
}

export function useEducation(): EducationContextValue {
  const value = useContext(EducationContext);
  if (value === null) {
    throw new Error("Education mobile components must be rendered inside EducationProvider.");
  }
  return value;
}
