import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useCatalog } from "@/lib/catalog/store";
import { UploadDocButton } from "@/components/catalog/upload-button";
import { slugify, uid, type Category } from "@/lib/catalog/types";

export function emptyCategory(): Category {
  const now = new Date().toISOString();
  return {
    id: `cat-${uid()}`,
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    parentId: null,
    specTemplates: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category;
  onSaved?: (category: Category) => void;
}) {
  const { data, upsertCategory, productCount } = useCatalog();
  const [draft, setDraft] = useState<Category>(category);
  const [slugTouched, setSlugTouched] = useState(Boolean(category.slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(category);
      setSlugTouched(Boolean(category.slug));
      setError(null);
    }
  }, [open, category]);

  const isNew = !data.categories.some((c) => c.id === draft.id);
  const linked = isNew ? 0 : productCount(draft.id);

  const set = <K extends keyof Category>(k: K, v: Category[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    const name = draft.name.trim();
    const slug = slugify(draft.slug || name);
    if (!name) return setError("Kategori adı zorunludur.");
    if (!slug) return setError("Slug zorunludur.");
    if (data.categories.some((c) => c.slug === slug && c.id !== draft.id))
      return setError("Bu slug başka bir kategoride kullanılıyor.");

    const next: Category = {
      ...draft,
      name,
      slug,
      updatedAt: new Date().toISOString(),
    };
    upsertCategory(next);
    onSaved?.(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>{isNew ? "Yeni Kategori" : "Kategoriyi Düzenle"}</DialogTitle>
          <DialogDescription>
            Kategori bilgileri hem üretici panelinde hem public katalogda kullanılır.
          </DialogDescription>
        </DialogHeader>

        {!isNew && linked > 0 ? (
          <p className="flex items-start gap-2 border border-border bg-surface p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
            Bu kategoriye bağlı {linked} ürün bulunuyor. Ad veya slug değişikliği bu
            ürünlerin public kategori bağlantısını da etkiler.
          </p>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="tech-label">Kategori adı</Label>
            <Input
              value={draft.name}
              placeholder="Koltuk"
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({
                  ...d,
                  name,
                  slug: slugTouched ? d.slug : slugify(name),
                }));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="tech-label">Slug (public URL)</Label>
            <Input
              value={draft.slug}
              placeholder="koltuk"
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
            <p className="font-mono text-[11px] text-muted-foreground">
              /products/{draft.slug || "kategori"}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="tech-label">Açıklama</Label>
            <Textarea
              rows={3}
              value={draft.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="tech-label">Kapak görseli</Label>
            <div className="flex gap-2">
              <Input
                value={draft.image ?? ""}
                placeholder="https://… veya dosya yükleyin"
                onChange={(e) => set("image", e.target.value)}
              />
              <UploadDocButton onUploaded={(url) => set("image", url)} />
            </div>
            {draft.image ? (
              <div className="mt-2 flex items-start gap-2">
                <img
                  src={draft.image}
                  alt="Kapak önizleme"
                  className="h-20 w-32 border border-border object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => set("image", "")}
                  className="cursor-pointer"
                >
                  Kaldır
                </Button>
              </div>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label className="tech-label">Üst kategori</Label>
            <Select
              value={draft.parentId ?? "none"}
              onValueChange={(v) => set("parentId", v === "none" ? null : v)}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok (ana kategori)</SelectItem>
                {data.categories
                  .filter((c) => c.id !== draft.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={draft.isActive}
              onCheckedChange={(v) => set("isActive", v)}
            />
            <span className="text-sm">{draft.isActive ? "Aktif" : "Pasif"}</span>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button onClick={save}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
