import { Link } from "@tanstack/react-router";
import { imageOr } from "@/lib/catalog/placeholder";
import { ArrowRight } from "lucide-react";

/** Shared public product card in the product-detail visual language. */
export function ProductCard({
  slug,
  name,
  code,
  heroImage,
  categoryLabel,
}: {
  slug: string;
  name: string;
  code: string;
  heroImage?: string;
  categoryLabel: string;
}) {
  return (
    <Link
      to="/p/$slug"
      params={{ slug }}
      className="group flex flex-col border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-secondary/40 p-4">
        <img
          src={imageOr(heroImage)}
          alt={name}
          width={1600}
          height={1104}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col border-t border-border p-4">
        <span className="tech-label">{categoryLabel}</span>
        <h3 className="mt-1 font-medium tracking-tight">{name}</h3>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {code}
        </p>
        <div className="mt-4 flex items-center justify-end border-t border-border pt-3 text-sm">
          <span className="flex items-center gap-1 text-accent">
            İncele
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
