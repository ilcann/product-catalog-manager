import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCatalog } from "@/lib/catalog/store";
import { imageOr } from "@/lib/catalog/placeholder";
import { cn } from "@/lib/utils";

/** Global product search dialog triggered from the site header. */
export function ProductSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data } = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const published = useMemo(
    () => data.products.filter((p) => p.status === "published"),
    [data.products],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return published.slice(0, 6);
    return published
      .filter((p) => {
        const cat = data.categories.find((c) => c.id === p.categoryId)?.name ?? "";
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [query, published, data.categories]);

  function go(slug: string) {
    setQuery("");
    onOpenChange(false);
    navigate({ to: "/p/$slug", params: { slug } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Ürün ara</DialogTitle>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) go(results[0].slug);
              }}
              placeholder="Ürün adı, kod veya kategori ara…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Kapat"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {results.map((p) => {
                  const cat =
                    data.categories.find((c) => c.id === p.categoryId)?.name ??
                    "Kategorisiz";
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => go(p.slug)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/60",
                        )}
                      >
                        <img
                          src={imageOr(p.heroImage)}
                          alt=""
                          className="size-10 shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.code} · {cat}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
      </DialogContent>
    </Dialog>
  );
}
