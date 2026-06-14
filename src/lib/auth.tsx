import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/api/types";

const STORAGE_KEY = "paladino_auth";
const ROLE_STORAGE_KEY = "dev_role";

export type Role =
  | "OWNER"
  | "ADMIN"
  | "OPERATOR"
  | "PROFESSIONAL"
  | "PLATFORM_OWNER";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
  PROFESSIONAL: "Profissional",
  PLATFORM_OWNER: "Plataforma",
};

const MOCK_USER: AuthUser = {
  id: "u-1",
  name: "Zeca Almeida",
  email: "zeca@barbeariadozeca.com.br",
  barbershopId: "shop-1",
};

export interface AuthState {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: Role;
  setRole: (role: Role) => void;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRoleState] = useState<Role>("OWNER");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
      const r = localStorage.getItem(ROLE_STORAGE_KEY) as Role | null;
      if (r && ["OWNER","ADMIN","OPERATOR","PROFESSIONAL","PLATFORM_OWNER"].includes(r)) {
        setRoleState(r);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try { localStorage.setItem(ROLE_STORAGE_KEY, r); } catch {}
  };

  const value: AuthState = {
    hydrated,
    isAuthenticated: !!user,
    user,
    role,
    setRole,
    async login(email, _password, asRole) {
      await new Promise((r) => setTimeout(r, 250));
      const u = { ...MOCK_USER, email };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
      setUser(u);
      if (asRole) setRole(asRole);
    },
    logout() {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
