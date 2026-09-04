import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveComponent, type ComponentDef, type ProductComponentRef } from "@/lib/catalog/types";
import { imageOr } from "@/lib/catalog/placeholder";

export type HotspotImageOption = {
  /** stable key stored in ref.hotspots (hero image uses ref.hotspot) */
  key: string;
  src: string;
  label: string;
};

/**
 * Admin hotspot placement: pick an image (hero or gallery), pick a component,
 * then click (or drag a marker) on the image to set normalized 0..1 coordinates.
 */
export function HotspotEditor({
  images,
  refs,
  components,
  onChange,
}: {
  images: HotspotImageOption[];
  refs: ProductComponentRef[];
  components: ComponentDef[];
  onChange: (refs: ProductComponentRef[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(refs[0]?.id ?? null);
  const [activeKey, setActiveKey] = useState<string>(images[0]?.key ?? "");
  const [dragId, setDragId] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const activeImage = images.find((i) => i.key === activeKey) ?? images[0];
  const isHero = activeImage ? activeImage.key === images[0]?.key : true;

  const nameOf = (ref: ProductComponentRef) => {
    const def = components.find((c) => c.id === ref.componentId);
    return def ? resolveComponent(ref, def).name : "Parça";
  };

  const hotspotOf = (ref: ProductComponentRef) =>
    !activeImage
      ? undefined
      : isHero
        ? (ref.hotspot ?? ref.hotspots?.[activeImage.key])
        : ref.hotspots?.[activeImage.key];

  const setHotspot = (id: string, x: number, y: number) => {
    if (!activeImage) return;
    const point = {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
    onChange(
      refs.map((r) => {
        if (r.id !== id) return r;
        const hotspots = { ...r.hotspots, [activeImage.key]: point };
        return isHero ? { ...r, hotspot: point, hotspots } : { ...r, hotspots };
      }),
    );
  };

  const clearHotspot = (id: string) => {
    if (!activeImage) return;
    onChange(
      refs.map((r) => {
        if (r.id !== id) return r;
        const hotspots = { ...r.hotspots };
        delete hotspots[activeImage.key];
        return {
          ...r,
          hotspots: Object.keys(hotspots).length ? hotspots : undefined,
          ...(isHero ? { hotspot: undefined } : {}),
        };
      }),
    );
  };

  const pointToRatio = (clientX: number, clientY: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return null;
    return { x: (clientX - box.left) / box.width, y: (clientY - box.top) / box.height };
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = dragId ?? selectedId;
    if (!target) return;
    const p = pointToRatio(e.clientX, e.clientY);
    if (p) setHotspot(target, p.x, p.y);
  };

  return (
    <div className="border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="tech-label">Görsel üzerinde konumlandır</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Görseli ve parçayı seçin, ardından görsele tıklayın veya işareti sürükleyin
        </span>
      </div>

      {/* Image picker */}
      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto border-b border-border px-4 py-3">
          {images.map((img, i) => {
            const active = img.key === activeImage?.key;
            const placedCount = refs.filter((r) =>
              i === 0 ? (r.hotspot ?? r.hotspots?.[img.key]) : r.hotspots?.[img.key],
            ).length;
            return (
              <button
                key={img.key || i}
                type="button"
                onClick={() => setActiveKey(img.key)}
                className={cn(
                  "group w-24 shrink-0 cursor-pointer border text-left transition-colors",
                  active ? "border-accent" : "border-border hover:border-foreground/30",
                )}
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary/40">
                  <img
                    src={imageOr(img.src)}
                    alt={img.label}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="truncate font-mono text-[10px] tracking-wider uppercase">
                    {img.label}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      placedCount ? "text-accent" : "text-muted-foreground",
                    )}
                  >
                    {placedCount}/{refs.length}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Component picker */}
      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
        {refs.length === 0 ? (
          <span className="text-xs text-muted-foreground">Önce bir parça ekleyin.</span>
        ) : null}
        {refs.map((ref, i) => (
          <button
            key={ref.id}
            type="button"
            onClick={() => setSelectedId(ref.id)}
            className={cn(
              "flex items-center gap-2 border px-2.5 py-1.5 text-xs transition-colors",
              ref.id === selectedId
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border hover:border-foreground/30",
            )}
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="max-w-[10rem] truncate">{nameOf(ref)}</span>
            {!hotspotOf(ref) ? (
              <span className="font-mono text-[10px] text-muted-foreground">konumsuz</span>
            ) : null}
          </button>
        ))}
      </div>

      <div
        ref={boxRef}
        onClick={handleClick}
        onMouseMove={(e) => {
          if (!dragId) return;
          const p = pointToRatio(e.clientX, e.clientY);
          if (p) setHotspot(dragId, p.x, p.y);
        }}
        onMouseUp={() => setDragId(null)}
        onMouseLeave={() => setDragId(null)}
        className="relative cursor-crosshair overflow-hidden bg-surface select-none"
      >
        <img
          src={imageOr(activeImage?.src)}
          alt={activeImage?.label ?? "Ürün görseli"}
          loading="lazy"
          className="block w-full"
        />
        {refs.map((ref, i) => {
          const hs = hotspotOf(ref);
          if (!hs) return null;
          const active = ref.id === selectedId;
          return (
            <button
              key={ref.id}
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedId(ref.id);
                setDragId(ref.id);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ left: `${hs.x * 100}%`, top: `${hs.y * 100}%` }}
              aria-label={`${nameOf(ref)} konumu`}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border font-mono text-[10px] shadow-sm transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card/95 text-foreground",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {selectedId ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          {(() => {
            const ref = refs.find((r) => r.id === selectedId);
            if (!ref) return null;
            const hs = hotspotOf(ref);
            return (
              <>
                <span className="font-medium text-foreground">{nameOf(ref)}</span>
                <span className="font-mono">
                  {hs
                    ? `x ${(hs.x * 100).toFixed(1)}% · y ${(hs.y * 100).toFixed(1)}%`
                    : "bu görselde konum atanmadı"}
                </span>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHotspot(ref.id, 0.5, 0.5)}
                  >
                    Ortala
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hs}
                    onClick={() => clearHotspot(ref.id)}
                  >
                    Konumu kaldır
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}
