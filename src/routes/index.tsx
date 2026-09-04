import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog/store";
import heroImage from "@/assets/home-hero.jpg";
import { imageOr } from "@/lib/catalog/placeholder";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/catalog/site-header";
import { ProductCard } from "@/components/catalog/product-card";
import { CategoryRail } from "@/components/catalog/category-rail";
import { Reveal } from "@/components/catalog/reveal";
import { SiteFooter } from "@/components/catalog/site-footer";
import { ArrowRight, QrCode, Layers, FileCheck2, SlidersHorizontal, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nordveka — Dijital Ürün Kimliği ve Parça Bazlı Teknik Veri" },
      {
        name: "description",
        content:
          "Mobilya üreticileri için QR ile açılan dijital ürün kimliği: parçalar, teknik özellikler, varyantlar ve sertifikalar tek yerde.",
      },
      { property: "og:title", content: "Nordveka — Dijital Ürün Kimliği" },
      {
        property: "og:description",
        content:
          "Physical Furniture → QR → Digital Product Identity → Components → Technical Data → Certifications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEATURED_LIMIT = 6;

function Home() {
  const { data, categoryName } = useCatalog();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [catSheetOpen, setCatSheetOpen] = useState(false);

  const categories = data.categories.filter((c) => c.isActive);


  const filtered = activeCategory
    ? data.products.filter((p) => p.categoryId === activeCategory)
    : data.products;
  const featured = filtered.slice(0, FEATURED_LIMIT);
  const spotlight = data.products[0];

  const activeCat = categories.find((c) => c.id === activeCategory);
  const countFor = (id: string) =>
    data.products.filter((p) => p.categoryId === id).length;
  const selectCategory = (id: string | null) => {
    setActiveCategory(id);
    setCatSheetOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Split hero: showroom visual left, brand panel right */}
      <section className="flex flex-col border-b border-border lg:h-[calc(100vh-4rem)] lg:flex-row">
        <Reveal
          from="up"
          className="relative min-h-[280px] min-w-0 flex-1 overflow-hidden bg-secondary/40 lg:h-full"
        >
          <img
            src={heroImage}
            alt="Nordveka showroom: modüler oturma grubu ve masif meşe sehpa"
            width={1600}
            height={1200}
            className="size-full object-cover"
          />
        </Reveal>

        <div className="flex shrink-0 flex-col justify-center border-t border-border p-6 sm:px-8 lg:h-full lg:w-[460px] lg:overflow-y-auto lg:border-t-0 lg:border-l xl:w-[500px]">
          <Reveal from="none">
          <span className="tech-label">Nordveka Furniture · 1998</span>
          <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Modüler oturma grupları ve masif ahşap mobilya üretimi.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Rezidans ve kontrakt projeler için tasarlıyor, kendi atölyemizde
            üretiyoruz. Her ürünün malzemesi, parçaları ve belgeleri şeffaf
            şekilde erişilebilir.
          </p>

          <dl className="mt-6 border-t border-border">
            {[
              { Icon: Layers, label: "Modüler tasarım, ölçüye göre üretim" },
              { Icon: FileCheck2, label: "Sertifikalı malzeme ve kumaşlar" },
              { Icon: QrCode, label: "QR ile dijital ürün kimliği" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 border-b border-border py-2.5"
              >
                <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button asChild className="w-full">
              <Link to="/products">
                Koleksiyonu keşfedin <ArrowRight className="size-4" />
              </Link>
            </Button>
            {spotlight ? (
              <Button asChild variant="outline" className="w-full">
                <Link to="/p/$slug" params={{ slug: spotlight.slug }}>
                  Öne çıkan: {spotlight.name}
                </Link>
              </Button>
            ) : null}
          </div>
          </Reveal>
        </div>
      </section>


      {/* Featured products */}
      <section className="border-b border-border px-4 py-10 sm:px-6">
        <Reveal>
        <div className="border-b border-border pb-3">
          <span className="tech-label mb-2 block">
            Öne çıkan ürünler · {featured.length} / {filtered.length}
          </span>
          {/* Desktop: wrap chips */}
          <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              aria-pressed={activeCategory === null}
              className={cn(
                "shrink-0 cursor-pointer border px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                activeCategory === null
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              Tümü
              <span className="ml-1.5 font-mono text-[10px] opacity-60">
                {data.products.length}
              </span>
            </button>
            {categories.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(active ? null : c.id)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 cursor-pointer border px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {c.name}
                  <span className="ml-1.5 font-mono text-[10px] opacity-60">
                    {countFor(c.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile/tablet: Sheet drawer */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setCatSheetOpen(true)}
              className="flex w-full items-center justify-between border border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <span className="font-medium">
                  {activeCat ? activeCat.name : "Tümü"}
                </span>
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-[11px]">
                  {activeCat ? countFor(activeCat.id) : data.products.length}
                </span>
                <ChevronRight className="size-4" />
              </span>
            </button>
          </div>

          <Sheet open={catSheetOpen} onOpenChange={setCatSheetOpen}>
            <SheetContent side="left" className="flex w-[280px] flex-col gap-0 p-0 sm:max-w-[320px]">
              <SheetHeader className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-sm font-semibold tracking-tight">
                    Kategoriler
                  </SheetTitle>
                  <SheetClose className="rounded-sm opacity-70 transition-opacity hover:opacity-100" />
                </div>
              </SheetHeader>
              <nav className="min-h-0 flex-1 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60",
                    !activeCategory && "bg-secondary font-medium",
                  )}
                >
                  Tümü
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {data.products.length}
                  </span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCategory(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60",
                      activeCategory === c.id && "bg-secondary font-medium",
                    )}
                  >
                    {c.name}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {countFor(c.id)}
                    </span>
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        </Reveal>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <ProductCard
                slug={p.slug}
                name={p.name}
                code={p.code}
                heroImage={p.heroImage}
                categoryLabel={categoryName(p.categoryId)}
                
              />
            </Reveal>
          ))}
        </div>

        {featured.length === 0 ? (
          <p className="mt-8 border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Bu kategoride ürün bulunmuyor.
          </p>
        ) : null}
      </section>

      {/* Categories with covers */}
      <section className="px-4 py-10 sm:px-6">
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <span className="tech-label">Koleksiyon</span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Kategoriler
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/products">
              Tüm ürünleri görüntüle <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        </Reveal>

        <Reveal delay={120}>
          <CategoryRail categories={categories} productCount={(id) => data.products.filter((p) => p.categoryId === id).length} />
        </Reveal>

        {categories.length === 0 ? (
          <p className="mt-6 border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Henüz kategori eklenmemiş.
          </p>
        ) : null}
      </section>

      <SiteFooter />
    </div>
  );
}


