import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/catalog/store";
import { CategoryFormDialog, emptyCategory } from "./category-form";
import type { Category } from "@/lib/catalog/types";

/** Searchable category combobox with inline "new category" creation. */
export function CategorySelect({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (categoryId: string) => void;
  className?: string;
}) {
  const { data } = useCatalog();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [blank, setBlank] = useState<Category>(() => emptyCategory());

  const selected = useMemo(
    () => data.categories.find((c) => c.id === value),
    [data.categories, value],
  );
  const path = (c: Category) => {
    const parent = data.categories.find((p) => p.id === c.parentId);
    return parent ? `${parent.name} · ` : "";
  };

  const openCreate = () => {
    setBlank(emptyCategory());
    setOpen(false);
    setCreating(true);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {data.categories.length === 0 ? (
        <div className="flex w-full flex-wrap items-center gap-3 border border-dashed border-border p-3">
          <span className="text-sm text-muted-foreground">Henüz kategori bulunmuyor.</span>
          <Button size="sm" variant="outline" onClick={openCreate}>
            <Plus className="size-4" /> Kategori Oluştur
          </Button>
        </div>
      ) : (
        <>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="min-w-0 flex-1 justify-between rounded-none font-normal"
              >
                <span className={cn("truncate", !selected && "text-muted-foreground")}>
                  {selected ? selected.name : "Kategori seç"}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] rounded-none p-0">
              <Command>
                <CommandInput placeholder="Kategori ara…" />
                <CommandList>
                  <CommandEmpty>Kategori bulunamadı.</CommandEmpty>
                  <CommandGroup>
                    {data.categories.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={`${c.name} ${c.slug}`}
                        onSelect={() => {
                          onChange(c.id);
                          setOpen(false);
                        }}
                        className="rounded-none"
                      >
                        <Check
                          className={cn(
                            "size-4",
                            c.id === value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="text-muted-foreground">{path(c)}</span>
                          {c.name}
                        </span>
                        {!c.isActive ? (
                          <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                            pasif
                          </span>
                        ) : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup>
                    <CommandItem onSelect={openCreate} className="rounded-none">
                      <Plus className="size-4" /> Yeni kategori
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" className="rounded-none" onClick={openCreate} aria-label="Yeni kategori">
            <Plus className="size-4" />
          </Button>
        </>
      )}

      <CategoryFormDialog
        open={creating}
        onOpenChange={setCreating}
        category={blank}
        onSaved={(c) => onChange(c.id)}
      />
    </div>
  );
}
