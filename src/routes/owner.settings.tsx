import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { ErrorState } from "@/components/app/error-state";
import { EmptyState } from "@/components/app/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonEditorDialog } from "@/components/owner/json-editor-dialog";
import { getSettings, setSetting } from "@/lib/owner/api";
import type { SettingValue, SettingsDict } from "@/lib/owner/types";

export const Route = createFileRoute("/owner/settings")({
  head: () => ({ meta: [{ title: "Configurações — Plataforma" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsDict>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ key: string; value: SettingValue } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try { setSettings(await getSettings()); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save(value: unknown) {
    if (!editing) return;
    setBusy(true);
    try {
      const updated = await setSetting(editing.key, value as SettingValue);
      setSettings(updated);
      setEditing(null);
    } finally { setBusy(false); }
  }

  const entries = Object.entries(settings);

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações da plataforma" description="Dicionário livre de configurações globais." />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : entries.length === 0 ? (
        <EmptyState title="Nenhuma configuração" />
      ) : (
        <Card className="divide-y divide-border">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm">{key}</p>
                <pre className="mt-1 max-w-2xl overflow-x-auto rounded bg-muted/40 p-2 text-xs text-muted-foreground">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing({ key, value: value as SettingValue })}>Editar</Button>
            </div>
          ))}
        </Card>
      )}

      <JsonEditorDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Editar ${editing.key}` : ""}
        field={editing?.key ?? ""}
        initialValue={editing?.value ?? null}
        busy={busy}
        onSave={save}
      />
    </div>
  );
}
