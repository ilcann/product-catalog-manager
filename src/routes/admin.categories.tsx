import { useCallback, useMemo, useState } from "react";
import {
  SortableTh,
  dateValue,
  useSortedRows,
  useTableSort,
} from "@/components/catalog/sortable-table";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/catalog/admin-shell";
import { useCatalog } from "@/lib/catalog/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryFormDialog, emptyCategory } from "@/components/catalog/category-form";
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/catalog/types";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Kategoriler — Nordveka Üretici Paneli" },
      {
        name: "description",
        content:
          "Ürün kategorilerini oluşturun, düzenleyin ve ürünlerin hangi kategoriye ait olduğunu yönetin.",
      },
      { property: "og:title", content: "Kategoriler — Nordveka Üretici Paneli" },
      {
        property: "og:description",
        content: "Kategori CRUD, ürün sayıları ve güvenli silme akışı.",
      },
    ],
  }),
  component: AdminCategories,
});

type StatusFilter = "all" | "active" | "passive";
type SortKey = "name" | "products" | "created";
type ColumnSortKey =
  | "name"
  | "slug"
  | "products"
  | "status"
  | "createdAt"
  | "updatedAt";

function AdminCategories() {
  const { data, productCount, removeCategory } = useCatalog();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const { sort: columnSort, toggle } = useTableSort<ColumnSortKey>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.categories
      .filter(
        (c) =>
          (!q || c.name.toLowerCase().includes(q) || c.slug.includes(q)) &&
          (status === "all" ||
            (status === "active" ? c.isActive : !c.isActive)),
      )
      .sort((a, b) => {
        if (sort === "products") return productCount(b.id) - productCount(a.id);
        if (sort === "created") return b.createdAt.localeCompare(a.createdAt);
        return a.name.localeCompare(b.name, "tr");
      });
  }, [data.categories, query, status, sort, productCount]);

  const accessor = useCallback(
    (c: Category, key: ColumnSortKey) => {
      if (key === "name") return c.name;
      if (key === "slug") return c.slug;
      if (key === "products") return productCount(c.id);
      if (key === "status") return c.isActive ? "Aktif" : "Pasif";
      if (key === "createdAt") return dateValue(c.createdAt);
      return dateValue(c.updatedAt);
    },
    [productCount],
  );

  const rows = useSortedRows(filtered, columnSort, accessor);

  const parentName = (c: Category) =>
    data.categories.find((p) => p.id === c.parentId)?.name;


  return (
    <AdminShell
      title="Kategoriler"
      description="Ürün kategorilerini yönetin ve ürünlerin hangi kategoriye ait olduğunu belirleyin."
      actions={
        <Button size="sm" onClick={() => setEditing(emptyCategory())}>
          <Plus className="size-4" /> Yeni Kategori
        </Button>
      }
    >
      {data.categories.length === 0 ? (
        <div className="border border-dashed border-border bg-card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold tracking-tight">
            Henüz kategori oluşturulmadı
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ürünlerinizi düzenlemek için önce bir kategori oluşturun.
          </p>
          <Button className="mt-5" onClick={() => setEditing(emptyCategory())}>
            <Plus className="size-4" /> Yeni Kategori
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kategori ara…"
                className="rounded-none pl-9"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="w-[150px] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="passive">Pasif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[180px] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">İsme göre</SelectItem>
                <SelectItem value="products">Ürün sayısına göre</SelectItem>
                <SelectItem value="created">Oluşturulma tarihine göre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <SortableTh
                    label="Kategori"
                    sortKey="name"
                    sort={columnSort}
                    onToggle={toggle}
                  />
                  <SortableTh
                    label="Slug"
                    sortKey="slug"
                    sort={columnSort}
                    onToggle={toggle}
                  />
                  <SortableTh
                    label="Ürün"
                    sortKey="products"
                    sort={columnSort}
                    onToggle={toggle}
                  />
                  <SortableTh
                    label="Durum"
                    sortKey="status"
                    sort={columnSort}
                    onToggle={toggle}
                  />
                  <SortableTh
                    label="Oluşturulma"
                    sortKey="createdAt"
                    sort={columnSort}
                    onToggle={toggle}
                  />
                  <SortableTh
                    label="Güncellenme"
                    sortKey="updatedAt"
                    sort={columnSort}
                    onToggle={toggle}
                  />
                  <SortableTh label="" sort={columnSort} onToggle={toggle} align="right" />

                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      {parentName(c) ? (
                        <div className="text-xs text-muted-foreground">
                          Üst: {parentName(c)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3">{productCount(c.id)}</td>
                    <td className="px-4 py-3">
                      <span className="border border-border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                        {c.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {c.updatedAt
                        ? new Date(c.updatedAt).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                        <Pencil className="size-4" /> Düzenle
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(c)}>
                        <Trash2 className="size-4" /> Sil
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Kategori bulunamadı.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing ? (
        <CategoryFormDialog
          open
          onOpenChange={(v) => !v && setEditing(null)}
          category={editing}
          onSaved={() => toast.success("Kategori kaydedildi")}
        />
      ) : null}

      {deleting ? (
        <DeleteCategoryDialog
          category={deleting}
          count={productCount(deleting.id)}
          categories={data.categories.filter((c) => c.id !== deleting.id)}
          onClose={() => setDeleting(null)}
          onConfirm={(moveTo) => {
            removeCategory(deleting.id, moveTo);
            setDeleting(null);
            toast.success("Kategori silindi");
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function DeleteCategoryDialog({
  category,
  count,
  categories,
  onClose,
  onConfirm,
}: {
  category: Category;
  count: number;
  categories: Category[];
  onClose: () => void;
  onConfirm: (moveToCategoryId: string | null) => void;
}) {
  const [target, setTarget] = useState<string>("");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle>Kategoriyi sil</DialogTitle>
          <DialogDescription>
            {category.name} kategorisi kalıcı olarak silinecek.
          </DialogDescription>
        </DialogHeader>

        {count > 0 ? (
          <div className="space-y-3">
            <p className="flex items-start gap-2 border border-border bg-surface p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                Bu kategoriye bağlı {count} ürün bulunuyor. Kategoriyi silmeden önce
                ürünleri başka bir kategoriye taşımalısınız.
              </span>
            </p>
            <div className="space-y-1.5">
              <span className="tech-label">Ürünleri taşı</span>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Hedef kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bu kategoriye bağlı ürün bulunmuyor, güvenle silebilirsiniz.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            disabled={count > 0 && !target}
            onClick={() => onConfirm(count > 0 ? target : null)}
          >
            {count > 0 ? "Ürünleri taşı ve sil" : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
