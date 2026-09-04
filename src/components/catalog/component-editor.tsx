import { useState } from "react";
import { UploadDocButton } from "@/components/catalog/upload-button";
import { imageOr } from "@/lib/catalog/placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  COMPONENT_TYPES,
  SPEC_GROUPS,
  uid,
  type ComponentDef,
  type ComponentType,
  type ComponentVariant,
  type DocumentKind,
  type SpecGroup,
  type Specification,
  type TechDocument,
} from "@/lib/catalog/types";

const DOC_KINDS: { id: DocumentKind; label: string }[] = [
  { id: "datasheet", label: "Teknik Föy" },
  { id: "manual", label: "Kılavuz" },
  { id: "warranty", label: "Garanti" },
  { id: "test-report", label: "Test Raporu" },
  { id: "certificate", label: "Sertifika" },
];

export function emptyComponent(): ComponentDef {
  return {
    id: `cmp-${uid()}`,
    name: "",
    code: "",
    type: "other",
    description: "",
    images: [],
    specs: [],
    variants: [],
    documents: [],
  };
}

export function ComponentEditorDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ComponentDef;
  onSave: (c: ComponentDef) => void;
}) {
  const [draft, setDraft] = useState<ComponentDef>(initial);
  const set = <K extends keyof ComponentDef>(k: K, v: ComponentDef[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setDraft(initial);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initial.name ? "Parça Düzenle" : "Yeni Parça"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-2">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cmp-name">Parça adı</Label>
              <Input
                id="cmp-name"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Metal Konik Ayak"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cmp-code">Parça kodu</Label>
              <Input
                id="cmp-code"
                value={draft.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="LEG-CONE"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parça tipi</Label>
              <Select
                value={draft.type}
                onValueChange={(v) => set("type", v as ComponentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENT_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cmp-img">Parça görseli</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cmp-img"
                  value={draft.images[0] ?? ""}
                  onChange={(e) => set("images", e.target.value ? [e.target.value] : [])}
                  placeholder="https://… veya yükleyin"
                />
                <UploadDocButton onUploaded={(url) => set("images", [url])} />
              </div>
              {(
                <img
                  src={imageOr(draft.images[0])}
                  alt="Parça görseli önizleme"
                  className="mt-2 h-20 w-20 border border-border object-cover"
                />
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cmp-desc">Kısa açıklama</Label>
              <Textarea
                id="cmp-desc"
                rows={2}
                value={draft.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </section>

          <SpecEditor
            title="Teknik Özellikler"
            specs={draft.specs}
            onChange={(specs) => set("specs", specs)}
          />

          <section>
            <SectionHeader
              title={`Varyantlar (${draft.variants.length})`}
              onAdd={() =>
                set("variants", [
                  ...draft.variants,
                  { id: uid(), name: "", code: "", specs: [] } as ComponentVariant,
                ])
              }
            />
            <div className="mt-3 space-y-4">
              {draft.variants.map((v, i) => (
                <div key={v.id} className="border border-border p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]">
                    <Input
                      value={v.name}
                      placeholder="Varyant adı"
                      onChange={(e) =>
                        set(
                          "variants",
                          draft.variants.map((x, j) =>
                            j === i ? { ...x, name: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <Input
                      value={v.code}
                      placeholder="Kod"
                      onChange={(e) =>
                        set(
                          "variants",
                          draft.variants.map((x, j) =>
                            j === i ? { ...x, code: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <Input
                      value={v.swatch ?? ""}
                      placeholder="#renk"
                      onChange={(e) =>
                        set(
                          "variants",
                          draft.variants.map((x, j) =>
                            j === i ? { ...x, swatch: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        set(
                          "variants",
                          draft.variants.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {v.image ? (
                      <img
                        src={v.image}
                        alt={`${v.name || "Varyant"} görseli`}
                        className="size-10 shrink-0 border border-border object-cover"
                      />
                    ) : null}
                    <Input
                      value={v.image ?? ""}
                      placeholder="Varyant görseli (URL)"
                      onChange={(e) =>
                        set(
                          "variants",
                          draft.variants.map((x, j) =>
                            j === i ? { ...x, image: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <UploadDocButton
                      onUploaded={(url) =>
                        set(
                          "variants",
                          draft.variants.map((x, j) => (j === i ? { ...x, image: url } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="mt-3">

                    <SpecEditor
                      title="Varyant özellikleri"
                      compact
                      specs={v.specs}
                      onChange={(specs) =>
                        set(
                          "variants",
                          draft.variants.map((x, j) => (j === i ? { ...x, specs } : x)),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title={`Belgeler & Sertifikalar (${draft.documents.length})`}
              onAdd={() =>
                set("documents", [
                  ...draft.documents,
                  { id: uid(), title: "", kind: "certificate" } as TechDocument,
                ])
              }
            />
            <div className="mt-3 space-y-3">
              {draft.documents.map((d, i) => (
                <div
                  key={d.id}
                  className="grid gap-3 sm:grid-cols-[1fr_10rem_1fr_auto]"
                >
                  <Input
                    value={d.title}
                    placeholder="Belge adı"
                    onChange={(e) =>
                      set(
                        "documents",
                        draft.documents.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Select
                    value={d.kind}
                    onValueChange={(v) =>
                      set(
                        "documents",
                        draft.documents.map((x, j) =>
                          j === i ? { ...x, kind: v as DocumentKind } : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_KINDS.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={d.issuer ?? ""}
                    placeholder="Kurum / referans"
                    onChange={(e) =>
                      set(
                        "documents",
                        draft.documents.map((x, j) =>
                          j === i ? { ...x, issuer: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <UploadDocButton
                    onUploaded={(url, fileName) =>
                      set(
                        "documents",
                        draft.documents.map((x, j) =>
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
                    onClick={() =>
                      set(
                        "documents",
                        draft.documents.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
            disabled={!draft.name.trim()}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="tech-rule flex items-center justify-between pb-2">
      <span className="tech-label">{title}</span>
      <Button variant="ghost" size="sm" onClick={onAdd} className="h-7 gap-1 text-xs">
        <Plus className="size-3.5" /> Ekle
      </Button>
    </div>
  );
}

export function SpecEditor({
  title,
  specs,
  onChange,
  compact = false,
}: {
  title: string;
  specs: Specification[];
  onChange: (s: Specification[]) => void;
  compact?: boolean;
}) {
  return (
    <section>
      <SectionHeader
        title={title}
        onAdd={() =>
          onChange([...specs, { id: uid(), group: "material", key: "", value: "" }])
        }
      />
      <div className="mt-3 space-y-2">
        {specs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Dinamik key-value: istediğin kadar teknik özellik ekleyebilirsin.
          </p>
        ) : null}
        {specs.map((s, i) => (
          <div
            key={s.id}
            className="grid gap-2 sm:grid-cols-[9rem_1fr_1fr_6rem_auto]"
          >
            <Select
              value={s.group}
              onValueChange={(v) =>
                onChange(
                  specs.map((x, j) => (j === i ? { ...x, group: v as SpecGroup } : x)),
                )
              }
            >
              <SelectTrigger className={compact ? "h-8" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEC_GROUPS.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.labelTr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className={compact ? "h-8" : ""}
              value={s.key}
              placeholder="Özellik"
              onChange={(e) =>
                onChange(specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))
              }
            />
            <Input
              className={compact ? "h-8" : ""}
              value={s.value}
              placeholder="Değer"
              onChange={(e) =>
                onChange(
                  specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                )
              }
            />
            <Input
              className={compact ? "h-8" : ""}
              value={s.unit ?? ""}
              placeholder="Birim"
              onChange={(e) =>
                onChange(
                  specs.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)),
                )
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className={compact ? "size-8" : ""}
              onClick={() => onChange(specs.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
