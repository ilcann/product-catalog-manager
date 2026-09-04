import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog/store";
import { resolveComponent, COMPONENT_TYPES, type ResolvedComponent } from "@/lib/catalog/types";
import { HotspotImage } from "@/components/catalog/hotspot-image";
import { ComponentDetail } from "@/components/catalog/component-detail";
import { SpecGroups, DocumentList } from "@/components/catalog/spec-display";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { imageOr } from "@/lib/catalog/placeholder";

import { ShareProduct } from "@/components/catalog/share-product";
import { SiteHeader } from "@/components/catalog/site-header";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Mail,
  Phone,
  Award,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => {
    const title = `Ürün Kimliği · ${params.slug} — Nordveka`;
    const description =
      "QR ile açılan dijital ürün kimliği: parçalar, teknik özellikler, varyantlar ve sertifikalar.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PublicProduct,
});

type TabId = "overview" | "parts" | "specs" | "documents" | "certificates";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Genel Bakış" },
  { id: "parts", label: "Parçalar" },
  { id: "specs", label: "Teknik Özellikler" },
  { id: "documents", label: "Belgeler" },
  { id: "certificates", label: "Sertifikalar" },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

function PublicProduct() {
  const { slug } = Route.useParams();
  const { data, getProduct, getComponent, getCategory, categoryName } = useCatalog();
  const product = getProduct(slug);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [partSheet, setPartSheet] = useState(false);
  const isDesktop = useIsDesktop();

  // Swipe-down-to-close for the mobile bottom sheet
  const dragRef = useRef<{ startY: number; dy: number; dragging: boolean }>({
    startY: 0,
    dy: 0,
    dragging: false,
  });
  const [dragStyle, setDragStyle] = useState<React.CSSProperties>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  function handlePointerDown(e: React.PointerEvent) {
    // Only start drag from the top handle/header area, not from scrolling content
    const target = e.target as HTMLElement;
    const inScroll = scrollRef.current?.contains(target);
    if (inScroll && scrollRef.current && scrollRef.current.scrollTop > 0) return;
    dragRef.current = { startY: e.clientY, dy: 0, dragging: true };
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current.dragging) return;
    const dy = e.clientY - dragRef.current.startY;
    if (dy <= 0) {
      setDragStyle({});
      return;
    }
    // resist slightly so it feels attached
    const eased = dy * 0.6;
    dragRef.current.dy = dy;
    setDragStyle({ transform: `translateY(${eased}px)`, transition: "none" });
  }
  function handlePointerUp() {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.dy;
    dragRef.current.dragging = false;
    setDragStyle({ transition: "transform 250ms ease", transform: "translateY(0)" });
    if (dy > 90) {
      setPartSheet(false);
      // clear transform after close animation
      setTimeout(() => setDragStyle({}), 300);
    } else {
      setTimeout(() => setDragStyle({}), 250);
    }
  }

  const items = useMemo<ResolvedComponent[]>(() => {
    if (!product) return [];
    return product.components
      .filter((c) => c.active)
      .sort((a, b) => a.order - b.order)
      .map((ref) => {
        const def = getComponent(ref.componentId);
        return def ? resolveComponent(ref, def) : null;
      })
      .filter((x): x is ResolvedComponent => x !== null);
  }, [product, getComponent]);

  if (!product) throw notFound();

  const category = product.categoryId ? getCategory(product.categoryId) : undefined;
  const active = items.find((i) => i.ref.id === activeId) ?? null;
  const heroImage = viewImage ?? product.heroImage;
  const componentCerts = items.flatMap((i) =>
    i.def.documents
      .filter((d) => d.kind === "certificate" || d.kind === "test-report")
      .map((d) => ({ ...d, owner: i.name })),
  );

  function openPart(refId: string) {
    setActiveId(refId);
    if (isDesktop) setTab("parts");
    else setPartSheet(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden">
      {/* Thin header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
        <Link
          to="/products"
          className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Kataloğa dön</span>
        </Link>
        <div className="mx-1 hidden h-6 w-px shrink-0 bg-border sm:block" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">{product.name}</p>
          <p className="truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.code}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tam ekran görsel"
            onClick={() => setZoom(true)}
          >
            <Expand className="size-4" />
          </Button>
          <ShareProduct productName={product.name} productCode={product.code} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Left — visual */}
        <section className="flex h-[52vh] min-h-0 shrink-0 flex-col bg-surface sm:h-[58vh] lg:h-full lg:flex-1 lg:shrink">
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-4">
            <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
              <HotspotImage
                image={heroImage}
                alt={product.name}
                items={viewImage ? [] : items}
                activeId={activeId}
                onSelect={openPart}
                priority
              />
            </div>
          </div>
          {product.gallery && product.gallery.length > 0 ? (
            <div className="shrink-0 overflow-x-auto border-t border-border px-3 py-2 sm:px-6">
              <ul className="flex gap-2">
                {[product.heroImage, ...product.gallery].map((src, i) => {
                  const selected = (viewImage ?? product.heroImage) === src;
                  return (
                    <li key={src + i}>
                      <button
                        type="button"
                        onClick={() => setViewImage(i === 0 ? null : src)}
                        aria-label={`Görsel ${i + 1}`}
                        className={cn(
                          "block size-14 cursor-pointer overflow-hidden border transition-colors sm:size-16",
                          selected ? "border-accent" : "border-border hover:border-foreground/40",
                        )}
                      >
                        <img
                          src={imageOr(src)}
                          alt={`${product.name} görsel ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Right — info panel */}
        <aside className="flex flex-col border-t border-border lg:h-full lg:min-h-0 lg:w-[460px] lg:flex-none lg:border-l lg:border-t-0 xl:w-[500px]">
          <nav className="shrink-0 overflow-x-auto border-b border-border">
            <div className="flex min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    if (t.id !== "parts") setActiveId(null);
                  }}
                  className={cn(
                    "cursor-pointer whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors sm:text-sm",
                    tab === t.id
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="min-h-0 flex-1 px-4 py-5 sm:px-5 lg:overflow-y-auto">
            <div key={tab + (activeId ?? "")} className="animate-in fade-in duration-150">
              {tab === "overview" ? (
                <div className="space-y-5">
                  <div>
                    {category ? (
                      <Link
                        to="/products/$categorySlug"
                        params={{ categorySlug: category.slug }}
                        className="tech-label underline-offset-4 transition-colors hover:text-foreground hover:underline"
                      >
                        {categoryName(product.categoryId)}
                      </Link>
                    ) : (
                      <span className="tech-label">{categoryName(product.categoryId)}</span>
                    )}
                    <h1 className="mt-1 text-xl font-semibold tracking-tight">{product.name}</h1>
                  </div>
                  {product.summary ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.summary}
                    </p>
                  ) : null}
                  <dl>
                    <PropertyRow label="Ürün Kodu" value={product.code} mono />
                    <PropertyRow label="Kategori" value={categoryName(product.categoryId) ?? "—"} />
                    <PropertyRow label="Üretici" value={data.manufacturer.name} />
                    <PropertyRow label="Lokasyon" value={data.manufacturer.location ?? "—"} />
                    <PropertyRow label="Parça Sayısı" value={String(items.length)} />
                  </dl>
                </div>
              ) : null}

              {tab === "parts" ? (
                active && isDesktop ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveId(null)}
                      className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronLeft className="size-4" /> Tüm parçalar
                    </button>
                    <ComponentDetail key={active.ref.id} item={active} />
                  </div>
                ) : (
                  <ul className="divide-y divide-border border-b border-border">
                    {items.map((item, i) => {
                      const typeLabel =
                        COMPONENT_TYPES.find((t) => t.id === item.def.type)?.label ?? "Diğer";
                      return (
                        <li key={item.ref.id}>
                          <button
                            type="button"
                            onClick={() => openPart(item.ref.id)}
                            className="flex w-full cursor-pointer items-center gap-3 py-3 text-left transition-colors hover:bg-surface"
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {item.name}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {typeLabel} · {item.specs.length} özellik
                                {item.def.variants.length > 0
                                  ? ` · ${item.def.variants.length} varyant`
                                  : ""}
                              </span>
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : null}

              {tab === "specs" ? <SpecGroups specs={product.specs} /> : null}

              {tab === "documents" ? <DocumentList documents={product.documents} /> : null}

              {tab === "certificates" ? (
                <div className="space-y-7">
                  <div>
                    <div className="tech-rule pb-2">
                      <span className="tech-label">Parça Sertifikaları</span>
                    </div>
                    <div className="mt-3">
                      {componentCerts.length > 0 ? (
                        <ul className="divide-y divide-border border-y border-border">
                          {componentCerts.map((d) => (
                            <li key={d.id} className="flex items-center gap-3 py-3">
                              <Award
                                className="size-4 shrink-0 text-muted-foreground"
                                strokeWidth={1.5}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{d.title}</p>
                                <p className="truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                  {d.owner}
                                  {d.issuer ? ` · ${d.issuer}` : ""}
                                </p>
                              </div>
                              <a
                                href={d.url || undefined}
                                download={d.url ? true : undefined}
                                target={d.url ? "_blank" : undefined}
                                rel={d.url ? "noreferrer" : undefined}
                                aria-disabled={!d.url}
                                aria-label={`${d.title} indir`}
                                className={cn(
                                  "grid size-8 shrink-0 place-items-center rounded-md border transition-colors",
                                  d.url
                                    ? "cursor-pointer border-border text-muted-foreground hover:border-accent hover:text-accent"
                                    : "pointer-events-none border-border/50 text-muted-foreground/40",
                                )}
                              >
                                <Download className="size-4" strokeWidth={1.5} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Parça sertifikası eklenmemiş.
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="tech-rule pb-2">
                      <span className="tech-label">
                        Firma Sertifikaları · {data.manufacturer.name}
                      </span>
                    </div>
                    <div className="mt-3">
                      <DocumentList documents={data.manufacturer.certifications} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Sticky CTA footer */}
          <div className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Button asChild className="flex-1">
                <a href={`mailto:${data.manufacturer.contactEmail}?subject=${product.code}`}>
                  <Mail className="size-4" /> Teklif Al
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="Ara">
                <a href={`tel:${data.manufacturer.contactPhone}`}>
                  <Phone className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-5xl p-2">
          <img
            src={imageOr(heroImage)}
            alt={product.name}
            className="max-h-[85vh] w-full object-contain"
          />
        </DialogContent>
      </Dialog>

      {/* Mobile part detail — bottom sheet */}
      <Sheet open={partSheet} onOpenChange={setPartSheet}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0"
          onPointerDown={(e) => handlePointerDown(e)}
          onPointerMove={(e) => handlePointerMove(e)}
          onPointerUp={() => handlePointerUp()}
          onPointerCancel={() => handlePointerUp()}
          style={dragStyle}
        >
          {/* drag handle */}
          <div className="flex shrink-0 cursor-grab items-center justify-center py-2 active:cursor-grabbing">
            <span className="h-1.5 w-10 rounded-full bg-border" />
          </div>
          <SheetHeader className="shrink-0 border-b border-border px-4 py-3 text-left">
            <SheetTitle className="truncate text-sm font-semibold">
              {active?.name ?? "Parça Detayı"}
            </SheetTitle>
          </SheetHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
            ref={scrollRef}
          >
            {active ? <ComponentDetail key={active.ref.id} item={active} /> : null}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}

function PropertyRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-border/60 py-2.5">
      <dt className="tech-label">{label}</dt>
      <dd className={cn("mt-0.5 text-sm text-foreground", mono && "font-mono")}>{value}</dd>
    </div>
  );
}
