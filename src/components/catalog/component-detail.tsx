import { useState } from "react";
import { COMPONENT_TYPES, type ResolvedComponent } from "@/lib/catalog/types";
import { SpecGroups, DocumentList } from "./spec-display";
import { cn } from "@/lib/utils";
import { imageOr } from "@/lib/catalog/placeholder";

export function ComponentDetail({ item }: { item: ResolvedComponent }) {
  const [variantId, setVariantId] = useState<string | null>(
    item.ref.defaultVariantId ?? null,
  );
  const typeLabel = COMPONENT_TYPES.find((t) => t.id === item.def.type)?.label ?? "Diğer";
  const variant = item.def.variants.find((v) => v.id === variantId);
  const specs = variant ? mergeSpecs(item.specs, variant.specs) : item.specs;
  const image = imageOr(variant?.image || item.def.images[0]);


  return (
    <div className="space-y-8">
      <header>
        <span className="tech-label">{typeLabel}</span>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">{item.name}</h3>
        <p className="font-mono text-xs tracking-wider text-muted-foreground">
          {item.def.code}
          {variant ? ` / ${variant.code}` : ""}
        </p>
        {item.description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        {image ? (
          <img
            src={image}
            alt={`${item.name}${variant ? ` — ${variant.name}` : ""} görseli`}
            loading="lazy"
            className="mt-4 aspect-[4/3] w-full border border-border object-cover"
          />
        ) : null}
      </header>


      {item.def.variants.length > 0 ? (
        <section>
          <div className="tech-rule pb-2">
            <span className="tech-label">Varyantlar · {item.def.variants.length}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.def.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id === variantId ? null : v.id)}
                className={cn(
                  "flex items-center gap-2 border px-3 py-2 text-xs font-medium transition-colors",
                  v.id === variantId
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-card hover:border-foreground/30",
                )}
              >
                {v.swatch ? (
                  <span
                    className="size-3.5 rounded-full border border-border"
                    style={{ backgroundColor: v.swatch }}
                  />
                ) : null}
                <span>{v.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{v.code}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SpecGroups specs={specs} highlightKeys={item.overriddenKeys} />
      </section>

      {item.def.documents.length > 0 ? (
        <section>
          <div className="tech-rule pb-2">
            <span className="tech-label">Belgeler & Sertifikalar</span>
          </div>
          <div className="mt-3">
            <DocumentList documents={item.def.documents} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function mergeSpecs(
  base: ResolvedComponent["specs"],
  overrides: ResolvedComponent["specs"],
) {
  const merged = base.map((s) => {
    const o = overrides.find(
      (x) => x.key.toLowerCase() === s.key.toLowerCase() && x.group === s.group,
    );
    return o ? { ...s, value: o.value, unit: o.unit } : s;
  });
  const added = overrides.filter(
    (o) =>
      !base.some((s) => s.key.toLowerCase() === o.key.toLowerCase() && s.group === o.group),
  );
  return [...merged, ...added];
}
