export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatPhone = (p: string) => p;

/** API devolve string decimal "38.50" → R$ 38,50 */
export const formatBRLFromDecimal = (s: string | number | null | undefined) => {
  if (s === null || s === undefined || s === "") return "—";
  const n = typeof s === "number" ? s : parseFloat(s);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const formatDateTime = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
};

export const formatRelative = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
};
