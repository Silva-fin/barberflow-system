import { useEffect, type ReactNode } from "react";

export interface Branding {
  primary: string;
  accent: string;
  logoText: string;
  fontDisplay: string;
}

export const DEFAULT_BRANDING: Branding = {
  primary: "#16242c",
  accent: "#c79a5a",
  logoText: "PALADINO",
  fontDisplay: "Cormorant Garamond",
};

/**
 * Provider client-only que injeta cores do tenant como CSS vars.
 * Não bloqueia render — aplica via useEffect.
 * Fase 1: trocar mock por GET /tenant/branding.
 */
export function BrandingProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", DEFAULT_BRANDING.primary);
    root.style.setProperty("--brand-accent", DEFAULT_BRANDING.accent);
  }, []);

  return <>{children}</>;
}

export function useBranding(): Branding {
  return DEFAULT_BRANDING;
}