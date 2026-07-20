import { Quote } from "lucide-react";

export function TestimonialCard({
  quote, name, role,
}: {
  quote: string; name: string; role: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
      <Quote size={20} className="text-sidebar-primary" />
      <p className="mt-3 flex-1 text-sm italic text-muted-foreground">"{quote}"</p>
      <div className="mt-4 border-t border-border pt-3">
        <p className="font-display text-base">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}