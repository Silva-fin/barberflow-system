import { useEffect, useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CatalogTabKey =
  | "servicos"
  | "pacotes"
  | "assinaturas"
  | "produtos"
  | "promocoes"
  | "avaliacoes";

const TABS: { key: CatalogTabKey; label: string }[] = [
  { key: "servicos", label: "Serviços" },
  { key: "pacotes", label: "Pacotes" },
  { key: "assinaturas", label: "Assinaturas" },
  { key: "produtos", label: "Produtos" },
  { key: "promocoes", label: "Promoções" },
  { key: "avaliacoes", label: "Avaliações" },
];

function readHashTab(): CatalogTabKey {
  if (typeof window === "undefined") return "servicos";
  const hash = window.location.hash.replace(/^#/, "") as CatalogTabKey;
  return TABS.some((t) => t.key === hash) ? hash : "servicos";
}

export function CatalogTabs({
  panels,
}: {
  panels: Record<CatalogTabKey, ReactNode>;
}) {
  const [value, setValue] = useState<CatalogTabKey>("servicos");

  useEffect(() => {
    setValue(readHashTab());
    const onHashChange = () => setValue(readHashTab());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleChange = (next: string) => {
    const key = next as CatalogTabKey;
    setValue(key);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${key}`);
    }
  };

  return (
    <Tabs value={value} onValueChange={handleChange} className="w-full">
      <TabsList className="flex flex-wrap h-auto">
        {TABS.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.key} value={t.key} className="mt-6">
          {panels[t.key]}
        </TabsContent>
      ))}
    </Tabs>
  );
}