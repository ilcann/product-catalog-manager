import { useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/catalog/admin-shell";
import { useCatalog } from "@/lib/catalog/store";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  SortableTh,
  dateValue,
  useSortedRows,
  useTableSort,
} from "@/components/catalog/sortable-table";
import type { Product } from "@/lib/catalog/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Ürünler — Nordveka Üretici Paneli" },
      {
        name: "description",
        content: "Ürünleri, parçalarını ve teknik belgelerini yönetin.",
      },
      { property: "og:title", content: "Ürünler — Nordveka Üretici Paneli" },
      {
        property: "og:description",
        content: "Ürünleri, parçalarını ve teknik belgelerini yönetin.",
      },
    ],
  }),
  component: AdminProducts,
});

type ProductSortKey =
  | "name"
  | "code"
  | "category"
  | "components"
  | "documents"
  | "status"
  | "createdAt"
  | "updatedAt";

function AdminProducts() {
  const { data, reset, categoryName, productCount, removeProduct } = useCatalog();
  const navigate = useNavigate();
  const { sort, toggle } = useTableSort<ProductSortKey>(null);
  const accessor = useCallback(
    (p: Product, key: ProductSortKey) => {
      if (key === "name") return p.name;
      if (key === "code") return p.code;
      if (key === "category") return p.categoryId ? categoryName(p.categoryId) : null;
      if (key === "components") return p.components.length;
      if (key === "documents") return p.documents.length;
      if (key === "status") return p.status;
      if (key === "createdAt") return dateValue(p.createdAt);
      return dateValue(p.updatedAt);
    },
    [categoryName],
  );
  const products = useSortedRows(data.products, sort, accessor);

  const publishedProducts = data.products.filter((p) => p.status === "published");
  const topCategory = [...data.categories].sort(
    (a, b) => productCount(b.id) - productCount(a.id),
  )[0];
  const stats = [
    { label: "Toplam Ürün", value: String(data.products.length) },
    { label: "Yayında Olan Ürünler", value: String(publishedProducts.length) },
    {
      label: "En Çok Ürüne Sahip Kategori",
      value: topCategory
        ? `${topCategory.name} — ${productCount(topCategory.id)} ürün`
        : "—",
    },
  ];

  const handleNew = () => {
    navigate({ to: "/admin/products/new" });
  };

  const handleDelete = (p: Product) => {
    if (!confirm(`"${p.name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    removeProduct(p.id);
    toast.success("Ürün silindi");
  };

  return (
    <AdminShell
      title="Ürünler"
      description="Her ürün; parçaları, teknik özellikleri, varyantları ve belgeleriyle birlikte dijital kimliğe sahiptir."
      actions={
        <Button size="sm" onClick={handleNew}>
          <Plus className="size-4" /> Yeni Ürün
        </Button>
      }
      menuActions={
        <div className="flex w-full flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={reset}>
            <RotateCcw className="size-4" /> Demo veriyi sıfırla
          </Button>
        </div>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-card p-4">
            <span className="tech-label">{s.label}</span>
            <p className="mt-2 text-xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <SortableTh label="Ürün" sortKey="name" sort={sort} onToggle={toggle} />
              <SortableTh label="Kod" sortKey="code" sort={sort} onToggle={toggle} />
              <SortableTh label="Kategori" sortKey="category" sort={sort} onToggle={toggle} />
              <SortableTh label="Parça" sortKey="components" sort={sort} onToggle={toggle} />
              <SortableTh label="Belge" sortKey="documents" sort={sort} onToggle={toggle} />
              <SortableTh label="Durum" sortKey="status" sort={sort} onToggle={toggle} />
              <SortableTh
                label="Oluşturulma"
                sortKey="createdAt"
                sort={sort}
                onToggle={toggle}
              />
              <SortableTh
                label="Güncellenme"
                sortKey="updatedAt"
                sort={sort}
                onToggle={toggle}
              />
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon" className="size-8">
                      <Link to="/admin/products/$productId" params={{ productId: p.id }}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Link
                      to="/p/$slug"
                      params={{ slug: p.slug }}
                      className="font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {p.code || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {categoryName(p.categoryId)}
                </td>
                <td className="px-4 py-3">{p.components.length}</td>
                <td className="px-4 py-3">{p.documents.length}</td>
                <td className="px-4 py-3">
                  <span className="border border-border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                    {p.status === "published" ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`${p.name} ürününü sil`}
                    onClick={() => handleDelete(p)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
