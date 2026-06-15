import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { mockCustomers } from "@/lib/mock/fase1";

export type CustomerOption = { id: string; name: string };

export function CustomerAutocomplete({
  value,
  onChange,
  placeholder = "Selecionar cliente…",
}: {
  value: CustomerOption | null;
  onChange: (c: CustomerOption | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value?.name ?? placeholder}
          </span>
          <ChevronsUpDown size={16} strokeWidth={1.5} className="ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cliente…" />
          <CommandList>
            <CommandEmpty>Nenhum cliente.</CommandEmpty>
            <CommandGroup>
              {mockCustomers.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.phone}`}
                  onSelect={() => {
                    onChange({ id: c.id, name: c.name });
                    setOpen(false);
                  }}
                >
                  <Check
                    size={16}
                    strokeWidth={1.5}
                    className={cn("mr-2", value?.id === c.id ? "opacity-100" : "opacity-0")}
                  />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}