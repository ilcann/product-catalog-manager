import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { AdminShell } from "@/components/catalog/admin-shell";
import { UploadDocButton } from "@/components/catalog/upload-button";
import { useCatalog } from "@/lib/catalog/store";
import {
  uid,
  type DocumentKind,
  type Manufacturer,
  type TechDocument,
} from "@/lib/catalog/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/manufacturer")({
  head: () => ({
    meta: [
      { title: "Firma & Sertifikalar — Nordveka Üretici Paneli" },
      {
        name: "description",
        content:
          "ISO gibi firma seviyesindeki sertifikalar ürün ve parça sertifikalarından ayrı tutulur.",
      },
      { property: "og:title", content: "Firma & Sertifikalar — Nordveka" },
      {
        property: "og:description",
        content: "Firma seviyesindeki sertifikalar ürün/parçadan ayrı yönetilir.",
      },
    ],
  }),
  component: ManufacturerPage,
});

const DOC_KINDS: { id: DocumentKind; label: string }[] = [
  { id: "certificate", label: "Sertifika" },
  { id: "datasheet", label: "Teknik doküman" },
  { id: "test-report", label: "Test raporu" },
  { id: "warranty", label: "Garanti" },
  { id: "manual", label: "Kılavuz" },
];

const kindLabel = (kind: DocumentKind) =>
  DOC_KINDS.find((k) => k.id === kind)?.label ?? kind;

function ManufacturerPage() {
  const { data, updateManufacturer } = useCatalog();
  const [draft, setDraft] = useState<Manufacturer>(data.manufacturer);
  const [editing, setEditing] = useState(false);

  // Dışarıdan sıfırlama (demo reset vb.) olursa formu tazele
  useEffect(() => {
    setDraft(data.manufacturer);
  }, [data.manufacturer]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(data.manufacturer),
    [draft, data.manufacturer],
  );

  const set = <K extends keyof Manufacturer>(key: K, value: Manufacturer[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setCert = (id: string, patch: Partial<TechDocument>) =>
    set(
      "certifications",
      draft.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );

  const startEdit = () => {
    setDraft(data.manufacturer);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(data.manufacturer);
    setEditing(false);
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Firma adı zorunludur.");
      return;
    }
    updateManufacturer(() => ({
      ...draft,
      name: draft.name.trim(),
      certifications: draft.certifications
        .filter((c) => c.title.trim())
        .map((c) => ({ ...c, title: c.title.trim() })),
    }));
    toast.success("Firma bilgileri kaydedildi.");
    setEditing(false);
  };

  const m = data.manufacturer;

  return (
    <AdminShell
      title="Firma & Sertifikalar"
      description="Firma seviyesindeki sertifikalar (ISO 9001, FSC CoC vb.) ürün veya parçaya ait değildir; ayrı bir katmanda tutulur."
      actions={
        editing ? (
          <Button variant="outline" onClick={cancelEdit}>
            <X className="size-4" /> Vazgeç
          </Button>
        ) : (
          <Button onClick={startEdit}>
            <Pencil className="size-4" /> Düzenle
          </Button>
        )
      }
    >
      {!editing ? (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Read-only manufacturer summary */}
          <div className="border border-border bg-card p-5">
            <span className="tech-label">Üretici Bilgileri</span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              {m.name}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {m.location ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <dd>{m.location}</dd>
                </div>
              ) : null}
              {m.contactEmail ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <dd>
                    <a
                      href={`mailto:${m.contactEmail}`}
                      className="hover:text-foreground"
                    >
                      {m.contactEmail}
                    </a>
                  </dd>
                </div>
              ) : null}
              {m.contactPhone ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <dd>
                    <a
                      href={`tel:${m.contactPhone}`}
                      className="hover:text-foreground"
                    >
                      {m.contactPhone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            {m.about ? (
              <p className="mt-4 border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
                {m.about}
              </p>
            ) : null}
          </div>

          {/* Read-only certificates */}
          <div className="border border-border bg-card p-5">
            <div className="tech-rule pb-2">
              <span className="tech-label">
                Firma Sertifikaları · {m.certifications.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {m.certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz sertifika eklenmemiş.
                </p>
              ) : (
                m.certifications.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 border border-border/60 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[
                          kindLabel(c.kind),
                          c.issuer,
                          c.reference ? `Ref: ${c.reference}` : undefined,
                          c.validUntil ? `Geçerlilik: ${c.validUntil}` : undefined,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {c.url ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={c.url} target="_blank" rel="noreferrer">
                          <FileText className="size-4" /> Belge
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="border border-border bg-card p-5">
              <span className="tech-label">Üretici Bilgileri</span>
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="m-name">Firma adı</Label>
                  <Input
                    id="m-name"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Nordveka Furniture"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-location">Lokasyon</Label>
                  <Input
                    id="m-location"
                    value={draft.location ?? ""}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="İnegöl, Bursa – Türkiye"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="m-email">E-posta</Label>
                    <Input
                      id="m-email"
                      type="email"
                      value={draft.contactEmail ?? ""}
                      onChange={(e) => set("contactEmail", e.target.value)}
                      placeholder="sales@nordveka.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-phone">Telefon</Label>
                    <Input
                      id="m-phone"
                      value={draft.contactPhone ?? ""}
                      onChange={(e) => set("contactPhone", e.target.value)}
                      placeholder="+90 224 000 00 00"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-about">Hakkında</Label>
                  <Textarea
                    id="m-about"
                    rows={4}
                    value={draft.about ?? ""}
                    onChange={(e) => set("about", e.target.value)}
                    placeholder="Firma tanıtım metni…"
                  />
                </div>
              </div>
            </div>

            <div className="border border-border bg-card p-5">
              <div className="tech-rule flex items-center justify-between gap-3 pb-2">
                <span className="tech-label">
                  Firma Sertifikaları · {draft.certifications.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    set("certifications", [
                      ...draft.certifications,
                      { id: uid(), title: "", kind: "certificate" },
                    ])
                  }
                >
                  <Plus className="size-4" /> Ekle
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {draft.certifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Henüz sertifika yok. “Ekle” ile yeni sertifika oluşturun.
                  </p>
                ) : (
                  draft.certifications.map((c) => (
                    <div
                      key={c.id}
                      className="space-y-3 border border-border/60 p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
                        <Input
                          value={c.title}
                          placeholder="Sertifika adı"
                          onChange={(e) =>
                            setCert(c.id, { title: e.target.value })
                          }
                        />
                        <Select
                          value={c.kind}
                          onValueChange={(v) =>
                            setCert(c.id, { kind: v as DocumentKind })
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
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Sertifikayı sil"
                          onClick={() =>
                            set(
                              "certifications",
                              draft.certifications.filter((x) => x.id !== c.id),
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Input
                          value={c.issuer ?? ""}
                          placeholder="Kurum (TÜV, FSC…)"
                          onChange={(e) =>
                            setCert(c.id, { issuer: e.target.value })
                          }
                        />
                        <Input
                          value={c.reference ?? ""}
                          placeholder="Referans no"
                          onChange={(e) =>
                            setCert(c.id, { reference: e.target.value })
                          }
                        />
                        <Input
                          value={c.validUntil ?? ""}
                          placeholder="Geçerlilik (ör. 2027-06)"
                          onChange={(e) =>
                            setCert(c.id, { validUntil: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={c.url?.startsWith("data:") ? "" : (c.url ?? "")}
                          placeholder={
                            c.url?.startsWith("data:")
                              ? "Yüklenen dosya bağlı"
                              : "Belge URL'si (opsiyonel)"
                          }
                          onChange={(e) => setCert(c.id, { url: e.target.value })}
                        />
                        <UploadDocButton
                          onUploaded={(url, fileName) =>
                            setCert(c.id, {
                              url,
                              title: c.title.trim() ? c.title : fileName,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-2 border border-border bg-card/95 p-3 backdrop-blur">
            <Button
              variant="outline"
              disabled={!dirty}
              onClick={() => setDraft(data.manufacturer)}
            >
              <RotateCcw className="size-4" /> Geri al
            </Button>
            <Button disabled={!dirty} onClick={save}>
              <Save className="size-4" /> Kaydet
            </Button>
          </div>
        </>
      )}
    </AdminShell>
  );
}
