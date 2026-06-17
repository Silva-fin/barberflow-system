import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "paladino_portal_session";

export interface PortalSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface PortalSessionState {
  hydrated: boolean;
  session: PortalSession | null;
  setSession: (s: PortalSession | null) => void;
  updateProfile: (patch: Partial<PortalSession>) => void;
  logout: () => void;
}

const Ctx = createContext<PortalSessionState | null>(null);

const DEFAULT_SESSION: PortalSession = {
  id: "cli-001",
  name: "Marina Castro",
  email: "marina@exemplo.com",
  phone: "(11) 98123-4567",
};

export function PortalSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<PortalSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessionState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const setSession = (s: PortalSession | null) => {
    setSessionState(s);
    try {
      if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const value: PortalSessionState = {
    hydrated,
    session,
    setSession,
    updateProfile(patch) {
      setSessionState((prev) => {
        const next = { ...(prev ?? DEFAULT_SESSION), ...patch };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    logout() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setSessionState(null);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortalSession(): PortalSessionState {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("usePortalSession must be used inside PortalSessionProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Mock auth helpers (determinísticos)
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function requestMagicLink(email: string): Promise<{
  ok: boolean;
  invalid?: boolean;
}> {
  await sleep(700);
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) {
    throw new Error("E-mail inválido");
  }
  // Por regra do mock, e-mail com local-part terminando em "x" simula link inválido.
  const localPart = trimmed.split("@")[0];
  if (localPart.endsWith("x")) {
    return { ok: true, invalid: true };
  }
  return { ok: true };
}

export async function loginPassword(
  email: string,
  password: string,
): Promise<PortalSession> {
  await sleep(600);
  if (!email.includes("@")) throw new Error("E-mail inválido");
  if (password === "errada") {
    const err = new Error("E-mail ou senha incorretos");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return {
    ...DEFAULT_SESSION,
    email: email.trim().toLowerCase(),
  };
}

export async function consumeMagicToken(token: string): Promise<PortalSession> {
  await sleep(900);
  if (!token || token.endsWith("x")) {
    throw new Error("Este link expirou ou já foi utilizado.");
  }
  return DEFAULT_SESSION;
}