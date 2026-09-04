import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/catalog/admin-shell";
import { UploadDocButton } from "@/components/catalog/upload-button";
import { useCatalog } from "@/lib/catalog/store";
import { uid, slugify, type Product } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySelect } from "@/components/catalog/category-select";
import { HotspotEditor } from "@/components/catalog/hotspot-editor";
import { SpecEditor } from "@/components/catalog/component-editor";
import { toast } from "sonner";
import { imageOr, PLACEHOLDER_IMAGE } from "@/lib/catalog/placeholder";
import { ImagePlus, Plus, X } from "lucide-react";
import {
  STEPS,
  Field,
  ComponentsStep,
  DocumentEditor,
  PreviewStep,
} from "./admin.products.$productId";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({
    meta: [
      { title: "Yeni Ürün — Nordveka Üretici Paneli" },
      {
        name: "description",
        content: "Yeni ürünü adım adım oluşturun: temel bilgiler, görseller, özellikler, parçalar ve belgeler.",
      },
      { property: "og:title", content: "Yeni Ürün — Nordveka" },
      {
        property: "og:description",
        content: "Temel Bilgiler → Görseller → Teknik Özellikler → Parçalar → Belgeler → Önizleme.",
      },
    ],
  }),
  component: NewProduct,
});

function blankProduct(manufacturerId: string): Product {
  const id = uid();
  const now = new Date().toISOString();
  return {
    id,
    slug: `urun-${id}`,
    name: "",
    code: "",
    categoryId: null,
    summary: "",
    heroImage: "",
    gallery: [],
    status: "draft",
    specs: [],
    components: [],
    documents: [],
    manufacturerId,
    createdAt: now,
    updatedAt: now,
  };
}

function NewProduct() {
  const { data, addProduct, upsertComponent, categoryName } = useCatalog();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Product>(() => blankProduct(data.manufacturer.id));
  const [galleryUrl, setGalleryUrl] = useState("");

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Ürün adı zorunludur");
      return;
    }
    if (!draft.categoryId) {
      toast.error("Kategori seçimi zorunludur");
      return;
    }
    const finalProduct: Product = {
      ...draft,
      name: draft.name.trim(),
      slug: draft.slug.trim() || slugify(draft.name) || `urun-${draft.id}`,
      heroImage: imageOr(draft.heroImage),
      updatedAt: new Date().toISOString(),
    };
    addProduct(finalProduct);
    if (!draft.heroImage?.trim()) {
      toast.info("Görsel bulunmadığı için yer tutucu görsel eklendi");
    }
    toast.success("Ürün oluşturuldu");
    navigate({ to: "/admin/products/$productId", params: { productId: finalProduct.id } });
  };

  return (
    <AdminShell
      title={draft.name || "Yeni Ürün"}
      description={`${draft.code || "Kodsuz"} · ${categoryName(draft.categoryId)}`}
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
          <Button size="sm" onClick={save}>
            Oluştur
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="basic">
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
              <Input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ürün adı"
                autoFocus
              />
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
              <Field label="Ana görsel (hero)">
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
                          set("gallery", draft.gallery.filter((_, j) => j !== i))
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
