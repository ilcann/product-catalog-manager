import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/catalog/admin-shell";
import { useCatalog } from "@/lib/catalog/store";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  ComponentEditorDialog,
  emptyComponent,
} from "@/components/catalog/component-editor";
import { COMPONENT_TYPES, type ComponentDef } from "@/lib/catalog/types";

export const Route = createFileRoute("/admin/components")({
  head: () => ({
    meta: [
      { title: "Parçalar — Nordveka Üretici Paneli" },
      {
        name: "description",
        content:
          "Yeniden kullanılabilir mobilya parçaları: teknik özellikler, varyantlar ve belgeler.",
      },
      { property: "og:title", content: "Parçalar — Nordveka" },
      {
        property: "og:description",
        content: "Aynı parça birden fazla üründe yeniden kullanılabilir.",
      },
    ],
  }),
  component: ComponentLibrary,
});

function ComponentLibrary() {
  const { data, upsertComponent, removeComponent } = useCatalog();
  const [editing, setEditing] = useState<ComponentDef | null>(null);

  const usage = (id: string) =>
    data.products.filter((p) => p.components.some((c) => c.componentId === id)).length;

  return (
    <AdminShell
      title="Parçalar"
      description="Parçalar üründen bağımsız tanımlanır; aynı parça birden fazla üründe kullanılabilir, ürün bazında override edilebilir."
      actions={
        <Button size="sm" onClick={() => setEditing(emptyComponent())}>
          <Plus className="size-4" /> Yeni Parça
        </Button>
      }
    >
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Parça", "Tip", "Özellik", "Varyant", "Belge", "Kullanım", ""].map((h) => (
                <th key={h} className="tech-label px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.components.map((c) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{c.code}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {COMPONENT_TYPES.find((t) => t.id === c.type)?.label}
                </td>
                <td className="px-4 py-3">{c.specs.length}</td>
                <td className="px-4 py-3">{c.variants.length}</td>
                <td className="px-4 py-3">{c.documents.length}</td>
                <td className="px-4 py-3 text-muted-foreground">{usage(c.id)} ürün</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                    <Pencil className="size-4" /> Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeComponent(c.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <ComponentEditorDialog
          open
          onOpenChange={(v) => !v && setEditing(null)}
          initial={editing}
          onSave={(c) => upsertComponent(c)}
        />
      ) : null}
    </AdminShell>
  );
}
