import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/api/types";

const STORAGE_KEY = "barbershop_auth";

const MOCK_USER: AuthUser = {
  id: "u-1",
  name: "Zeca Almeida",
  email: "zeca@barbeariadozeca.com.br",
  barbershopId: "shop-1",
};

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const value: AuthState = {
    isAuthenticated: !!user,
    user,
    async login(email: string, _password: string) {
      await new Promise(r => setTimeout(r, 400));
      const u = { ...MOCK_USER, email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
    },
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    },
  };

  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
