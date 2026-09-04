import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { SiteHeader } from "@/components/catalog/site-header";
import { SiteFooter } from "@/components/catalog/site-footer";
import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/catalog/reveal";
import { useCatalog } from "@/lib/catalog/store";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

/** Sol rail animasyonu oturumda yalnızca bir kez oynasın — kategori
 *  geçişlerinde sayfa yeniden mount olsa bile rail yerinde kalsın. */
let railRevealedOnce = false;

const railItem =
  "flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60";

function CategoryRail({
  query,
  setQuery,
  categories,
  active,
  total,
  countFor,
}: {
  query: string;
  setQuery: (v: string) => void;
  categories: Category[];
  active: Category | undefined;
  total: number;
  countFor: (id: string) => number;
}) {
  const [animate] = useState(!railRevealedOnce);
  useEffect(() => {
    railRevealedOnce = true;
  }, []);

  const [sheetOpen, setSheetOpen] = useState(false);

  const SearchBox = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ürün ara…"
        aria-label="Ürünlerde ara"
        className="h-10 w-full border border-border bg-background pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Aramayı temizle"
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );

  const CategoryList = (
    <>
      <Link
        to="/products"
        onClick={() => setSheetOpen(false)}
        className={cn(
          railItem,
          !active && "bg-secondary font-medium",
        )}
      >
        Tüm Ürünler
        <span className="font-mono text-[11px] text-muted-foreground">
          {total}
        </span>
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to="/products/$categorySlug"
          params={{ categorySlug: c.slug }}
          onClick={() => setSheetOpen(false)}
          className={cn(
            railItem,
            active?.id === c.id && "bg-secondary font-medium",
          )}
        >
          {c.name}
          <span className="font-mono text-[11px] text-muted-foreground">
            {countFor(c.id)}
          </span>
        </Link>
      ))}
    </>
  );

  const body = (
    <>
      {/* Desktop sidebar */}
      <div className="hidden px-4 pt-4 sm:px-6 lg:block lg:px-4">
        {SearchBox}
        <div className="mt-4">
          <span className="tech-label">Kategoriler</span>
        </div>
      </div>
      <nav className="hidden lg:mt-2 lg:flex lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
        {CategoryList}
      </nav>

      {/* Mobile / tablet: sticky bar + Sheet drawer */}
      <div className="border-b border-border px-4 py-3 sm:px-6 lg:hidden">
        {SearchBox}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-3 flex w-full items-center justify-between border border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <span className="font-medium">
              {active ? active.name : "Tüm Ürünler"}
            </span>
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-[11px]">{active ? countFor(active.id) : total}</span>
            <ChevronRight className="size-4" />
          </span>
        </button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="flex w-[280px] flex-col gap-0 p-0 sm:max-w-[320px]">
          <SheetHeader className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold tracking-tight">
                Kategoriler
              </SheetTitle>
              <SheetClose className="rounded-sm opacity-70 transition-opacity hover:opacity-100" />
            </div>
          </SheetHeader>
          <div className="border-b border-border px-4 py-3">
            {SearchBox}
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto">
            {CategoryList}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );

  const railClass =
    "shrink-0 border-b border-border lg:h-[calc(100vh-4rem)] lg:w-[260px] lg:overflow-y-auto lg:border-b-0 lg:border-r";

  // İlk girişte animasyonla gel; kategori geçişlerinde animasyonsuz, sabit kalsın.
  if (!animate) {
    return <div className={railClass}>{body}</div>;
  }
  return (
    <Reveal from="up" className={railClass}>
      {body}
    </Reveal>
  );
}

/** Sayfa başına ürün sayısı */
const PAGE_SIZE = 12;

/** Public, category-filtered product catalog. */
export function CatalogBrowser({ activeSlug }: { activeSlug: string | null }) {
  const { data } = useCatalog();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const mainRef = useRef<HTMLElement>(null);

  const categories = data.categories.filter((c) => c.isActive);
  const active = data.categories.find((c) => c.slug === activeSlug);
  const q = query.trim().toLocaleLowerCase("tr");
  const products = (active
    ? data.products.filter((p) => p.categoryId === active.id)
    : data.products
  ).filter((p) => {
    if (!q) return true;
    const categoryName =
      data.categories.find((c) => c.id === p.categoryId)?.name ?? "";
    return [p.name, p.code, categoryName].some((v) =>
      v.toLocaleLowerCase("tr").includes(q),
    );
  });

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Filtre/kategori değişince ilk sayfaya dön.
  useEffect(() => {
    setPage(1);
  }, [q, active?.id]);

  const goToPage = (n: number) => {
    const next = Math.min(Math.max(1, n), pageCount);
    if (next === currentPage) return;
    setPage(next);
    // Masaüstünde içerik kendi scroll alanında; mobilde sayfa başına dön.
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Category rail */}
        <CategoryRail
          query={query}
          setQuery={setQuery}
          categories={categories}
          active={active}
          total={data.products.length}
          countFor={(id) =>
            data.products.filter((p) => p.categoryId === id).length
          }
        />

        {/* Product grid */}
        <main
          ref={mainRef}
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto"
        >
          {active?.description ? (
            <p className="mb-5 max-w-2xl border-l-2 border-accent pl-3 text-sm text-muted-foreground">
              {active.description}
            </p>
          ) : null}

          {products.length === 0 ? (
            <p className="border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
              {q
                ? `“${query.trim()}” için sonuç bulunamadı.`
                : "Bu kategoride henüz ürün bulunmuyor."}
            </p>
          ) : (
            <>
              <div
                key={`${active?.id ?? "all"}-${currentPage}`}
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {pageProducts.map((p, i) => (
                  <Reveal key={p.id} from="up" delay={i * 70} className="h-full">
                    <ProductCard
                      slug={p.slug}
                      name={p.name}
                      code={p.code}
                      heroImage={p.heroImage}
                      categoryLabel={
                        data.categories.find((c) => c.id === p.categoryId)
                          ?.name ?? "Kategorisiz"
                      }
                    />
                  </Reveal>
                ))}
              </div>

              {pageCount > 1 ? (
                <nav
                  aria-label="Sayfalama"
                  className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6"
                >
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Sayfa {currentPage} / {pageCount} · {products.length} ürün
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      aria-label="İlk sayfa"
                      className="flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronsLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Önceki sayfa"
                      className="flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => goToPage(n)}
                          aria-label={`Sayfa ${n}`}
                          aria-current={n === currentPage ? "page" : undefined}
                          className={cn(
                            "flex size-9 items-center justify-center border text-sm transition-colors",
                            n === currentPage
                              ? "border-foreground bg-foreground font-medium text-background"
                              : "border-border hover:bg-secondary",
                          )}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      aria-label="Sonraki sayfa"
                      className="flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(pageCount)}
                      disabled={currentPage === pageCount}
                      aria-label="Son sayfa"
                      className="flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronsRight className="size-4" />
                    </button>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
