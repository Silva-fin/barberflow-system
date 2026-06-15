import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Warehouse, Percent, Package, Boxes, Tags, HeartHandshake, Star,
  ListOrdered, Bot, Link2,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { MODULE_LABELS, MODULE_DESCRIPTIONS, type ModuleName } from "@/lib/constants";
import { mockModules, MODULE_DEPENDENCIES, type ModuleActivation } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/configuracoes/modulos")({
  head: () => ({ meta: [{ title: "Módulos — Paladino" }] }),
  component: ModulesPage,
});

const MODULE_ICONS: Record<ModuleName, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  ESTOQUE: Warehouse, COMISSOES: Percent, PACOTES: Package, ASSINATURAS: Boxes,
  PROMOCOES: Tags, CRM: HeartHandshake, NPS: Star, FILA: ListOrdered,
  BOT_WHATSAPP: Bot, LINK_PUBLICO: Link2,
};

function ModulesPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [items, setItems] = useState<ModuleActivation[]>(mockModules);

  async function toggle(m: ModuleActivation, next: boolean) {
    const prev = items;
    setItems((xs) => xs.map((x) => x.module_name === m.module_name ? { ...x, is_active: next } : x));
    try {
      await new Promise((r) => setTimeout(r, 250));
      toast.success(`${MODULE_LABELS[m.module_name]} ${next ? "ativado" : "desativado"}`);
    } catch {
      setItems(prev);
      toast.error("Não foi possível atualizar");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Módulos"
        description="Ative funcionalidades adicionais conforme sua operação cresce."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((m) => {
          const Icon = MODULE_ICONS[m.module_name];
          const dep = MODULE_DEPENDENCIES[m.module_name];
          return (
            <Card key={m.activation_id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md border border-border bg-card p-2 text-muted-foreground">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-display text-lg leading-tight tracking-wide">{MODULE_LABELS[m.module_name]}</p>
                      <p className="text-xs text-muted-foreground">{m.is_active ? "Ativo" : "Inativo"}</p>
                    </div>
                  </div>
                  <Switch checked={m.is_active} onCheckedChange={(v) => toggle(m, v)} />
                </div>
                <p className="text-sm text-muted-foreground">{MODULE_DESCRIPTIONS[m.module_name]}</p>
                {dep && <p className="mt-auto text-xs italic text-muted-foreground">↳ {dep}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}