import { cn } from "@/lib/utils";

type Tone = "success" | "neutral" | "warning" | "danger" | "primary";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  neutral: "bg-muted text-muted-foreground border-border",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  primary: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function appointmentTone(
  status: "agendado" | "concluido" | "cancelado" | "no-show",
): Tone {
  if (status === "agendado") return "primary";
  if (status === "concluido") return "success";
  if (status === "cancelado") return "neutral";
  return "danger";
}

export function subscriptionTone(
  status: "ativa" | "pausada" | "cancelada",
): Tone {
  if (status === "ativa") return "success";
  if (status === "pausada") return "warning";
  return "neutral";
}

export function quotaTone(status: "ativa" | "encerrada" | "expirada"): Tone {
  if (status === "ativa") return "success";
  if (status === "encerrada") return "neutral";
  return "danger";
}