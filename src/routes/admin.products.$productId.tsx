import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/catalog/admin-shell";
import { UploadDocButton } from "@/components/catalog/upload-button";
import { useCatalog } from "@/lib/catalog/store";
import {
  COMPONENT_TYPES,
  resolveComponent,
  uid,
  type ComponentDef,
  type Product,
  type ProductComponentRef,
  type ResolvedComponent,
  type TechDocument,
} from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComponentEditorDialog,
  emptyComponent,
  SpecEditor,
  SectionHeader,
} from "@/components/catalog/component-editor";
import { SpecGroups, DocumentList } from "@/components/catalog/spec-display";
import { CategorySelect } from "@/components/catalog/category-select";
import { HotspotImage } from "@/components/catalog/hotspot-image";
import { HotspotEditor } from "@/components/catalog/hotspot-editor";

import { ComponentDetail } from "@/components/catalog/component-detail";
import { toast } from "sonner";
import { imageOr, PLACEHOLDER_IMAGE } from "@/lib/catalog/placeholder";
import {
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products/$productId")({
  head: () => ({
    meta: [
      { title: "Ürün Düzenle — Nordveka Üretici Paneli" },
      {
        name: "description",
        content:
          "Ürün bilgileri, teknik özellikler, parçalar ve belgeleri tek akışta yönetin.",
      },
      { property: "og:title", content: "Ürün Düzenle — Nordveka" },
      {
        property: "og:description",
        content: "Temel Bilgiler → Görseller → Teknik Özellikler → Parçalar → Belgeler → Önizleme.",
      },
    ],
  }),
  component: EditProduct,
});

export const STEPS = [
  { id: "basic", label: "Temel Bilgiler" },
  { id: "media", label: "Görseller" },
  { id: "specs", label: "Teknik Özellikler" },
  { id: "components", label: "Parçalar" },
  { id: "hotspots", label: "Parça Konumları" },
  { id: "documents", label: "Belgeler" },
  { id: "preview", label: "Önizleme" },
] as const;

function EditProduct() {
  const { productId } = Route.useParams();
  const { data, getProduct, updateProduct, upsertComponent, categoryName } = useCatalog();
  const existing = getProduct(productId);
  const [draft, setDraft] = useState<Product | null>(existing ?? null);
  const [galleryUrl, setGalleryUrl] = useState("");

  if (!existing || !draft) throw notFound();

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = () => {
    if (!draft.categoryId) {
      toast.error("Kategori seçimi zorunludur");
      return;
    }
    // category change only re-links the relation; specs & components stay intact
    const stamp = new Date().toISOString();
    updateProduct(draft.id, (p) => ({
      ...draft,
      // her ürünün mutlaka bir görseli olur; boşsa yer tutucu atanır
      heroImage: imageOr(draft.heroImage),
      createdAt: p.createdAt ?? stamp,
      updatedAt: stamp,
    }));
    if (!draft.heroImage?.trim()) {
      set("heroImage", PLACEHOLDER_IMAGE);
      toast.info("Görsel bulunmadığı için yer tutucu görsel eklendi");
    }
    toast.success("Ürün kaydedildi");
  };


  return (
    <AdminShell
      title={draft.name || "Ürün"}
      description={`${draft.code} · ${categoryName(draft.categoryId)}`}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 pr-1">
            <Switch
              checked={draft.status === "published"}
              onCheckedChange={(v) => set("status", v ? "published" : "draft")}
              aria-label="Yayın durumu"
            />
            <span className="text-sm whitespace-nowrap">
              {draft.status === "published" ? "Yayında" : "Taslak"}
            </span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/p/$slug" params={{ slug: draft.slug }}>
              <ExternalLink className="size-4" /> Public sayfa
            </Link>
          </Button>
          <Button size="sm" onClick={save}>
            Kaydet
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="components">
        <TabsList className="mb-6 h-auto flex-wrap justify-start rounded-none bg-surface p-1">
          {STEPS.map((s, i) => (
            <TabsTrigger key={s.id} value={s.id} className="rounded-none text-xs">
              <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic">
          <div className="grid max-w-3xl gap-4 border border-border bg-card p-5 sm:grid-cols-2">
            <Field label="Ürün adı">
              <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Ürün kodu">
              <Input value={draft.code} onChange={(e) => set("code", e.target.value)} />
            </Field>
            <Field label="Kategori">
              <CategorySelect
                value={draft.categoryId}
                onChange={(id) => set("categoryId", id)}
              />
            </Field>
            <Field label="Slug (QR URL)">
              <Input value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Kısa açıklama">
                <Textarea
                  rows={3}
                  value={draft.summary ?? ""}
                  onChange={(e) => set("summary", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="max-w-3xl space-y-8 border border-border bg-card p-5">
            <div className="space-y-4">
              <Field label="Ana görsel (hero) — zorunlu">
                <div className="flex items-center gap-2">
                  <Input
                    value={draft.heroImage}
                    onChange={(e) => set("heroImage", e.target.value)}
                    placeholder="https://… veya yükleyin"
                  />
                  <UploadDocButton onUploaded={(url) => set("heroImage", url)} />
                </div>
              </Field>
              {!draft.heroImage?.trim() ? (
                <p className="text-xs text-muted-foreground">
                  Görsel eklenmedi. Kaydettiğinizde varsayılan yer tutucu görsel kullanılır.
                </p>
              ) : null}
              <img
                src={imageOr(draft.heroImage)}
                alt={draft.name}
                width={1600}
                height={1104}
                loading="lazy"
                className="w-full max-w-lg border border-border object-cover"
              />

            </div>

            <div className="space-y-3 border-t border-border pt-5">
              <div className="space-y-1">
                <Label className="tech-label">Ek görseller</Label>
                <p className="text-xs text-muted-foreground">
                  Ürün sayfasında ana görselin yanında galeri olarak gösterilir.
                </p>
              </div>
              {draft.gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {draft.gallery.map((url, i) => (
                    <div key={`${url}-${i}`} className="group relative">
                      <img
                        src={url}
                        alt={`${draft.name} ek görsel ${i + 1}`}
                        width={480}
                        height={360}
                        loading="lazy"
                        className="aspect-[4/3] w-full border border-border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label="Görseli kaldır"
                        title="Görseli kaldır"
                        className="absolute right-1.5 top-1.5 size-7 opacity-90"
                        onClick={() =>
                          set(
                            "gallery",
                            draft.gallery.filter((_, j) => j !== i),
                          )
                        }
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Görsel URL'si ile ekle">
                    <Input
                      value={galleryUrl}
                      placeholder="https://… veya yüklenen dosya"
                      onChange={(e) => setGalleryUrl(e.target.value)}
                    />
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!galleryUrl.trim()}
                  onClick={() => {
                    const url = galleryUrl.trim();
                    if (!url) return;
                    set("gallery", [...draft.gallery, url]);
                    setGalleryUrl("");
                  }}
                >
                  <Plus className="size-4" /> Ekle
                </Button>
                <UploadDocButton
                  onUploaded={(url, name) => {
                    set("gallery", [...draft.gallery, url]);
                    toast.success("Görsel galeriye eklendi", { description: name });
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                <ImagePlus className="mr-1 inline size-3.5" />
                Yükleme butonuyla cihazınızdan da görsel ekleyebilirsiniz (en fazla 2 MB).
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs">
          <div className="max-w-4xl border border-border bg-card p-5">
            <SpecEditor
              title="Ürün Teknik Özellikleri"
              specs={draft.specs}
              onChange={(specs) => set("specs", specs)}
            />
          </div>
        </TabsContent>

        <TabsContent value="components">
          <ComponentsStep
            draft={draft}
            components={data.components}
            onChange={(refs) => set("components", refs)}
            onCreateComponent={(c) => upsertComponent(c)}
          />
        </TabsContent>

        <TabsContent value="hotspots">
          <HotspotEditor
            images={[
              { key: draft.heroImage || "hero", src: imageOr(draft.heroImage), label: "Ana görsel" },
              ...draft.gallery.map((g, i) => ({
                key: g,
                src: imageOr(g),
                label: `Görsel ${i + 2}`,
              })),
            ]}
            refs={[...draft.components].sort((a, b) => a.order - b.order)}
            components={data.components}
            onChange={(refs) => set("components", refs)}
          />
        </TabsContent>

        <TabsContent value="documents">
          <div className="max-w-4xl border border-border bg-card p-5">
            <DocumentEditor
              documents={draft.documents}
              onChange={(docs) => set("documents", docs)}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <PreviewStep draft={draft} components={data.components} />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="tech-label">{label}</Label>
      {children}
    </div>
  );
}

export function ComponentsStep({
  draft,
  components,
  onChange,
  onCreateComponent,
}: {
  draft: Product;
  components: ComponentDef[];
  onChange: (refs: ProductComponentRef[]) => void;
  onCreateComponent: (c: ComponentDef) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pick, setPick] = useState<string>("");

  const refs = [...draft.components].sort((a, b) => a.order - b.order);
  const reindex = (list: ProductComponentRef[]) =>
    onChange(list.map((r, i) => ({ ...r, order: i })));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= refs.length) return;
    const list = [...refs];
    const [item] = list.splice(from, 1);
    if (item) list.splice(to, 0, item);
    reindex(list);
  };

  const addExisting = (componentId: string) => {
    reindex([
      ...refs,
      {
        id: uid(),
        componentId,
        order: refs.length,
        active: true,
        hotspot: { x: 0.5, y: 0.5 },
      },
    ]);
    setPick("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 border border-border bg-card p-4">

        <Select value={pick} onValueChange={addExisting}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Kütüphaneden parça ekle" />
          </SelectTrigger>
          <SelectContent>
            {components.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} · {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Yeni parça oluştur
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          Sürükle-bırak veya oklarla sırala
        </span>
      </div>

      <ul className="border border-border bg-card">
        {refs.length === 0 ? (
          <li className="p-6 text-sm text-muted-foreground">Henüz parça eklenmemiş.</li>
        ) : null}
        {refs.map((ref, i) => {
          const def = components.find((c) => c.id === ref.componentId);
          if (!def) return null;
          const resolved = resolveComponent(ref, def);
          const isOpen = expanded === ref.id;
          const update = (patch: Partial<ProductComponentRef>) =>
            onChange(refs.map((r) => (r.id === ref.id ? { ...r, ...patch } : r)));

          return (
            <li
              key={ref.id}
              draggable
              onDragStart={() => setDragId(ref.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragId || dragId === ref.id) return;
                const from = refs.findIndex((r) => r.id === dragId);
                move(from, i);
                setDragId(null);
              }}
              className={cn(
                "border-b border-border/60 last:border-0",
                dragId === ref.id && "opacity-50",
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(isOpen ? null : ref.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(isOpen ? null : ref.id);
                  }
                }}
                className="grid grid-cols-[auto_auto_minmax(0,1fr)] cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/60 sm:flex sm:items-center"
              >
                <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 sm:flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{resolved.name}</span>
                    {ref.overrides ? (
                      <span className="hidden border border-accent/40 px-1.5 font-mono text-[10px] tracking-wider text-accent uppercase sm:inline-block">
                        override
                      </span>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {COMPONENT_TYPES.find((t) => t.id === def.type)?.label} · {def.code} ·{" "}
                    {resolved.specs.length} özellik · {def.variants.length} varyant ·{" "}
                    {def.documents.length} belge
                  </div>
                </div>
                <div
                  className="col-span-3 flex items-center gap-1 sm:col-span-1 sm:justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => move(i, i - 1)}>
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => move(i, i + 1)}>
                    <ChevronDown className="size-4" />
                  </Button>
                  <Switch
                    checked={ref.active}
                    onCheckedChange={(v) => update({ active: v })}
                    aria-label="Aktif"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => reindex(refs.filter((r) => r.id !== ref.id))}
                    aria-label="Parçayı sil"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {isOpen ? (
                <div className="space-y-5 border-t border-border bg-surface/60 px-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Ürüne özel ad (override)">
                      <Input
                        value={ref.overrides?.name ?? ""}
                        placeholder={def.name}
                        onChange={(e) =>
                          update({
                            overrides: { ...ref.overrides, name: e.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Varsayılan varyant">
                      <Select
                        value={ref.defaultVariantId ?? "none"}
                        onValueChange={(v) =>
                          update({ defaultVariantId: v === "none" ? undefined : v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {def.variants.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <SpecEditor
                    title="Ürüne özel teknik özellik override'ları"
                    compact
                    specs={ref.overrides?.specs ?? []}
                    onChange={(specs) =>
                      update({ overrides: { ...ref.overrides, specs } })
                    }
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {creating ? (
        <ComponentEditorDialog
          open
          onOpenChange={(v) => !v && setCreating(false)}
          initial={emptyComponent()}
          onSave={(c) => {
            onCreateComponent(c);
            addExisting(c.id);
          }}
        />
      ) : null}
    </div>
  );
}

export function DocumentEditor({
  documents,
  onChange,
}: {
  documents: TechDocument[];
  onChange: (d: TechDocument[]) => void;
}) {
  const docKinds: { id: TechDocument["kind"]; label: string }[] = [
    { id: "datasheet", label: "Teknik föy" },
    { id: "manual", label: "Kullanım kılavuzu" },
    { id: "warranty", label: "Garanti" },
    { id: "test-report", label: "Test raporu" },
    { id: "certificate", label: "Sertifika" },
  ];
  return (
    <div>
      <SectionHeader
        title={`Ürün Belgeleri (${documents.length})`}
        onAdd={() =>
          onChange([...documents, { id: uid(), title: "", kind: "datasheet" }])
        }
      />
      <div className="mt-3 space-y-3">
        {documents.map((d, i) => (
          <div
            key={d.id}
            className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border border-border bg-surface/50 p-3 sm:grid-cols-[minmax(0,1fr)_11rem_10rem_auto] sm:items-center sm:gap-3 sm:bg-transparent sm:p-0"
          >
            <Input
              value={d.title}
              placeholder="Belge adı"
              onChange={(e) =>
                onChange(
                  documents.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                )
              }
            />
            <Select
              value={d.kind}
              onValueChange={(v) =>
                onChange(
                  documents.map((x, j) =>
                    j === i ? { ...x, kind: v as TechDocument["kind"] } : x,
                  ),
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {docKinds.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={d.issuer ?? ""}
              placeholder="Kurum"
              onChange={(e) =>
                onChange(
                  documents.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)),
                )
              }
            />
            <div className="flex items-center gap-1">
              <UploadDocButton
                onUploaded={(url, fileName) =>
                  onChange(
                    documents.map((x, j) =>
                      j === i
                        ? { ...x, url, title: x.title.trim() ? x.title : fileName }
                        : x,
                    ),
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(documents.filter((_, j) => j !== i))}
                aria-label="Belgeyi sil"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewStep({
  draft,
  components,
}: {
  draft: Product;
  components: ComponentDef[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = useMemo<ResolvedComponent[]>(
    () =>
      [...draft.components]
        .filter((c) => c.active)
        .sort((a, b) => a.order - b.order)
        .map((ref) => {
          const def = components.find((c) => c.id === ref.componentId);
          return def ? resolveComponent(ref, def) : null;
        })
        .filter((x): x is ResolvedComponent => x !== null),
    [draft, components],
  );
  const active = items.find((i) => i.ref.id === activeId) ?? items[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <HotspotImage
          image={imageOr(draft.heroImage)}
          alt={draft.name}
          items={items}
          activeId={active?.ref.id ?? null}
          onSelect={setActiveId}
        />
        <div className="border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Ürün Teknik Bilgileri</h3>
          <SpecGroups specs={draft.specs} />
        </div>
        <div className="border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Ürün Belgeleri</h3>
          <DocumentList documents={draft.documents} />
        </div>
      </div>
      <div className="border border-border bg-card p-5">
        {active ? (
          <ComponentDetail key={active.ref.id} item={active} />
        ) : (
          <p className="text-sm text-muted-foreground">Parça seçin.</p>
        )}
      </div>
    </div>
  );
}
