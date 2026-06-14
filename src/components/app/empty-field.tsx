export function EmptyField({ label = "Em breve" }: { label?: string }) {
  return (
    <span className="text-xs text-muted-foreground opacity-50">{label}</span>
  );
}