import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { imageOr } from "@/lib/catalog/placeholder";
import type { Category } from "@/lib/catalog/types";

type Props = {
  categories: Category[];
  productCount: (id: string) => number;
};

export function CategoryRail({ categories, productCount }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 1 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  if (categories.length === 0) {
    return (
      <p className="mt-6 border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Henüz kategori eklenmemiş.
      </p>
    );
  }

  return (
    <div className="category-rail-wrap mt-5">
      <div className="category-rail" ref={railRef}>
        <div className="flex w-max gap-px bg-border">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products/$categorySlug"
              params={{ categorySlug: c.slug }}
              data-card
              className="group flex w-[240px] shrink-0 flex-col bg-background p-4 transition-colors hover:bg-surface sm:w-[300px]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-xs font-medium tracking-wider uppercase">
                  {c.name}
                </p>
                <span className="shrink-0 font-mono text-[11px] tracking-wider text-accent uppercase">
                  {productCount(c.id)} ürün
                </span>
              </div>
              <div className="mt-4 aspect-[3/4] overflow-hidden bg-secondary/40">
                <img
                  src={imageOr(c.image)}
                  alt={c.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation arrows — yalnızca ince pointer (fare) cihazlarda;
          dar pencerede de görünür, dokunmatik cihazda gizlenir. */}
      <button
        type="button"
        aria-label="Önceki kategoriler"
        onClick={() => scrollByCards(-1)}
        disabled={!canPrev}
        className="absolute top-1/2 left-1 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all hover:bg-surface disabled:pointer-events-none disabled:opacity-0 pointer-fine:flex"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Sonraki kategoriler"
        onClick={() => scrollByCards(1)}
        disabled={!canNext}
        className="absolute top-1/2 right-1 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all hover:bg-surface disabled:pointer-events-none disabled:opacity-0 pointer-fine:flex"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
