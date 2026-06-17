import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { JsonEditorDialog } from "@/components/owner/json-editor-dialog";
import { getFlags, getTenant, setFlag } from "@/lib/owner/api";
import type { FlagsDict, FlagValue, TenantSummary } from "@/lib/owner/types";

export const Route = createFileRoute("/owner/tenants/$id/flags")({
  head: () => ({ meta: [{ title: "Feature flags — Plataforma" }] }),
  component: FlagsPage,
});

function FlagsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantSummary | null>(null);
  const [flags, setFlags] = useState<FlagsDict>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleErr, setToggleErr] = useState<{ key: string; msg: string } | null>(null);
  const [editing, setEditing] = useState<{ key: string; value: FlagValue } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try {
      const [t, f] = await Promise.all([getTenant(id), getFlags(id)]);
      setTenant(t); setFlags(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function toggle(key: string, next: boolean) {
    setToggleErr(null);
    const prev = flags;
    setFlags({ ...flags, [key]: next });
    try {
      const updated = await setFlag(id, key, next);
      setFlags(updated);
    } catch (e) {
      setFlags(prev);
      setToggleErr({ key, msg: e instanceof Error ? e.message : "Falha ao atualizar" });
    }
  }

  async function saveJson(value: unknown) {
    if (!editing) return;
    setBusy(true);
    try {
      const updated = await setFlag(id, editing.key, value as FlagValue);
      setFlags(updated);
      setEditing(null);
    } finally { setBusy(false); }
  }

  const entries = Object.entries(flags);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate({ to: "/owner/tenants/$id", params: { id } })}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Voltar ao tenant
      </button>

      <PageHeader
        title="Feature flags"
        eyebrow={tenant?.name ?? "—"}
        description="Dicionário livre de flags configuradas para este tenant."
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={load} title="Config não encontrada" description="Não foi possível carregar as flags deste tenant." />
      ) : entries.length === 0 ? (
        <EmptyState title="Nenhuma flag configurada" description="Este tenant não possui flags definidas." />
      ) : (
        <Card className="divide-y divide-border">
          {entries.map(([key, value]) => {
            const isBool = typeof value === "boolean";
            return (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm">{key}</p>
                  {!isBool && (
                    <pre className="mt-1 max-w-xl overflow-x-auto rounded bg-muted/40 p-2 text-xs text-muted-foreground">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                  {toggleErr?.key === key && (
                    <p className="mt-1 text-xs text-destructive">{toggleErr.msg}</p>
                  )}
                </div>
                {isBool ? (
                  <Switch checked={value as boolean} onCheckedChange={(v) => toggle(key, v)} />
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing({ key, value: value as FlagValue })}>
                    Editar
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}

      <JsonEditorDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Editar ${editing.key}` : ""}
        field={editing?.key ?? ""}
        initialValue={editing?.value ?? null}
        busy={busy}
        onSave={saveJson}
      />
    </div>
  );
}
