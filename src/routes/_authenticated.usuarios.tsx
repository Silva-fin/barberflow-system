import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ShieldCheck, UserMinus, Crown, X, Plus } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ActiveBadge } from "@/components/app/fsm-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth, ROLE_LABELS, type Role } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { mockUsers, mockInvitations, type UserRow, type Invitation } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Paladino" }] }),
  component: UsersPage,
});

/** UI enforça anti-escalonamento — espelha INVITE_PERMISSION do backend. */
function rolesAllowedByActor(actorRole: Role): Role[] {
  if (actorRole === "OWNER") return ["OWNER", "ADMIN", "OPERATOR", "PROFESSIONAL"];
  if (actorRole === "ADMIN") return ["OPERATOR", "PROFESSIONAL"];
  return [];
}

function UsersPage() {
  const { role: actorRole, user } = useAuth();
  if (actorRole !== "OWNER" && actorRole !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const [invs, setInvs] = useState<Invitation[]>(mockInvitations);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [deactivateUser, setDeactivateUser] = useState<UserRow | null>(null);

  const allowedRoles = rolesAllowedByActor(actorRole);
  const isLastActiveOwner = (u: UserRow) =>
    u.role === "OWNER" && u.active && users.filter((x) => x.role === "OWNER" && x.active).length === 1;

  function changeRole(u: UserRow, newRole: Role) {
    setUsers((xs) => xs.map((x) => x.id === u.id ? { ...x, role: newRole } : x));
    toast.success(`${u.name ?? u.email} agora é ${ROLE_LABELS[newRole]}`);
  }
  function deactivate(u: UserRow) {
    setUsers((xs) => xs.map((x) => x.id === u.id ? { ...x, active: false } : x));
    toast.success("Usuário desativado");
    setDeactivateUser(null);
  }
  function invite(email: string, name: string, r: Role) {
    const expires = new Date(Date.now() + 7 * 86400_000).toISOString();
    setInvs((xs) => [{
      invitation_id: `inv-${Date.now()}`, email, role: r, status: "PENDING",
      expires_at: expires, created_at: new Date().toISOString(),
      invited_by_user_id: user?.id ?? "u-?",
    }, ...xs]);
    toast.success(`Convite enviado · expira ${formatDateTime(expires)}`);
    setInviteOpen(false);
  }
  function cancelInvite(id: string) {
    setInvs((xs) => xs.filter((x) => x.invitation_id !== id));
    toast.success("Convite cancelado");
  }
  function transfer(newOwnerId: string) {
    setUsers((xs) => xs.map((x) => {
      if (x.id === user?.id) return { ...x, role: "ADMIN" as Role };
      if (x.id === newOwnerId) return { ...x, role: "OWNER" as Role };
      return x;
    }));
    toast.success("Propriedade transferida");
    setTransferOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Usuários e acessos"
        description="Quem tem acesso à plataforma e em qual papel."
        actions={
          <>
            {actorRole === "OWNER" && (
              <Button variant="outline" onClick={() => setTransferOpen(true)}>
                <Crown size={16} strokeWidth={1.5} /> Transferir propriedade
              </Button>
            )}
            <Button onClick={() => setInviteOpen(true)}>
              <Plus size={16} strokeWidth={1.5} /> Convidar usuário
            </Button>
          </>
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="invites">Convites pendentes ({invs.filter((i) => i.status === "PENDING").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-3">
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-64 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  const lastOwner = isLastActiveOwner(u);
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.name ?? <span className="text-muted-foreground italic">Sem nome</span>}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        {isSelf ? (
                          <Badge variant="outline" className="font-normal">{ROLE_LABELS[u.role]}</Badge>
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(v) => changeRole(u, v as Role)}
                            disabled={!allowedRoles.includes(u.role) && actorRole !== "OWNER"}
                          >
                            <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {allowedRoles.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell><ActiveBadge active={u.active} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground italic">Você</span>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      size="sm" variant="ghost"
                                      disabled={!u.active || lastOwner}
                                      onClick={() => setDeactivateUser(u)}
                                    >
                                      <UserMinus size={16} strokeWidth={1.5} /> Desativar
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {lastOwner && (
                                  <TooltipContent>Não é possível desativar o último Proprietário ativo.</TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="space-y-3">
          {invs.length === 0 ? (
            <EmptyState title="Sem convites" description="Você ainda não enviou convites." />
          ) : (
            <div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Convidado por</TableHead>
                    <TableHead className="w-32 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invs.map((i) => (
                    <TableRow key={i.invitation_id}>
                      <TableCell>{i.email}</TableCell>
                      <TableCell>{ROLE_LABELS[i.role]}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{i.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(i.expires_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{i.invited_by_user_id}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" disabled={i.status !== "PENDING"} onClick={() => cancelInvite(i.invitation_id)}>
                          <X size={16} strokeWidth={1.5} /> Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} allowedRoles={allowedRoles} onInvite={invite} />

      <Dialog open={!!deactivateUser} onOpenChange={(v) => !v && setDeactivateUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Desativar usuário</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deactivateUser?.name ?? deactivateUser?.email} perderá acesso imediatamente. Histórico permanece.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateUser(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deactivateUser && deactivate(deactivateUser)}>Desativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        candidates={users.filter((u) => u.active && u.id !== user?.id)}
        onTransfer={transfer}
      />
    </div>
  );
}

function InviteDialog({ open, onOpenChange, allowedRoles, onInvite }: {
  open: boolean; onOpenChange: (v: boolean) => void; allowedRoles: Role[];
  onInvite: (email: string, name: string, r: Role) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [r, setR] = useState<Role>(allowedRoles[0] ?? "PROFESSIONAL");
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) { setEmail(""); setName(""); setR(allowedRoles[0] ?? "PROFESSIONAL"); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail size={18} strokeWidth={1.5} /> Convidar usuário</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Nome (opcional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Papel</Label>
            <Select value={r} onValueChange={(v) => setR(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {allowedRoles.map((x) => <SelectItem key={x} value={x}>{ROLE_LABELS[x]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!email.trim()} onClick={() => onInvite(email.trim(), name.trim(), r)}>Enviar convite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({ open, onOpenChange, candidates, onTransfer }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  candidates: UserRow[]; onTransfer: (id: string) => void;
}) {
  const [newOwner, setNewOwner] = useState<string>("");
  const [confirm, setConfirm] = useState("");
  const ready = !!newOwner && confirm === "TRANSFERIR";
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) { setNewOwner(""); setConfirm(""); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck size={18} strokeWidth={1.5} /> Transferir propriedade</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Você deixará de ser Proprietário e se tornará <strong>Administrador</strong>. Esta ação não pode ser desfeita sem o novo Proprietário.
          </p>
          <div className="space-y-1.5">
            <Label>Novo Proprietário</Label>
            <Select value={newOwner} onValueChange={setNewOwner}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name ?? c.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Digite <span className="font-mono">TRANSFERIR</span> para confirmar</Label>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" disabled={!ready} onClick={() => onTransfer(newOwner)}>Transferir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}