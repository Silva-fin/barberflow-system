import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ImpersonationMode } from "./types";

const STORAGE_KEY = "paladino_owner_impersonation";

export interface OwnerGrantSession {
  grantId: string;
  tenantName: string;
  mode: ImpersonationMode;
  expiresAt: string; // ISO
}

interface Ctx {
  grant: OwnerGrantSession | null;
  remainingMs: number;
  startGrant: (g: OwnerGrantSession) => void;
  endGrant: () => void;
}

const OwnerImpersonationContext = createContext<Ctx | null>(null);

export function OwnerImpersonationProvider({ children }: { children: ReactNode }) {
  const [grant, setGrant] = useState<OwnerGrantSession | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const g = JSON.parse(raw) as OwnerGrantSession;
        if (new Date(g.expiresAt).getTime() > Date.now()) setGrant(g);
        else localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!grant) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [grant]);

  useEffect(() => {
    if (!grant) return;
    if (new Date(grant.expiresAt).getTime() <= now) {
      setGrant(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }, [grant, now]);

  const startGrant = (g: OwnerGrantSession) => {
    setGrant(g);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)); } catch { /* ignore */ }
  };
  const endGrant = () => {
    setGrant(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const remainingMs = grant ? Math.max(0, new Date(grant.expiresAt).getTime() - now) : 0;

  return (
    <OwnerImpersonationContext.Provider value={{ grant, remainingMs, startGrant, endGrant }}>
      {children}
    </OwnerImpersonationContext.Provider>
  );
}

export function useOwnerImpersonation(): Ctx {
  const ctx = useContext(OwnerImpersonationContext);
  if (!ctx) throw new Error("useOwnerImpersonation must be used inside OwnerImpersonationProvider");
  return ctx;
}
