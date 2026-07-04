import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ESTABLISHMENTS, type Establishment } from "./mock";

export type CompanySelection = "all" | string;

interface Ctx {
  selected: CompanySelection;
  setSelected: (s: CompanySelection) => void;
  companies: Establishment[];
  selectedCompany: Establishment | null;
}

const CompanyCtx = createContext<Ctx | null>(null);

export function CompanyFilterProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CompanySelection>("all");
  const value = useMemo<Ctx>(
    () => ({
      selected,
      setSelected,
      companies: ESTABLISHMENTS,
      selectedCompany:
        selected === "all"
          ? null
          : ESTABLISHMENTS.find((e) => e.id === selected) ?? null,
    }),
    [selected],
  );
  return <CompanyCtx.Provider value={value}>{children}</CompanyCtx.Provider>;
}

export function useCompanyFilter(): Ctx {
  const c = useContext(CompanyCtx);
  if (!c)
    throw new Error("useCompanyFilter must be used inside CompanyFilterProvider");
  return c;
}

export function matchesCompany(
  selected: CompanySelection,
  establishmentId: string,
): boolean {
  return selected === "all" || selected === establishmentId;
}