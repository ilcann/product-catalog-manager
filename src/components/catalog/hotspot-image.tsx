import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ResolvedComponent } from "@/lib/catalog/types";
import { imageOr } from "@/lib/catalog/placeholder";

/**
 * Product hero image with component hotspots.
 * Hotspots use normalized 0..1 coordinates so real image-mapping can be
 * layered on later without changing the data model.
 *
 * The image is constrained to its centering parent's available height with a
 * concrete pixel value (not a percentage). Percentage `max-height` does not
 * resolve when the wrapping element has an automatic height, which let the
 * image overflow and clip on short viewports. Measuring the parent and setting
 * a definite `maxHeight` makes the image scale down to fit, while the
 * `inline-block` wrapper still shrinks to the rendered image so hotspot
 * coordinates stay accurate.
 */
export function HotspotImage({
  image,
  alt,
  items,
  activeId,
  onSelect,
  priority = false,
}: {
  image: string;
  alt: string;
  items: ResolvedComponent[];
  activeId?: string | null;
  onSelect: (refId: string) => void;
  priority?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const update = () => {
      const cs = getComputedStyle(parent);
      const padH =
        parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");
      setMaxH(Math.max(0, parent.clientHeight - padH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative inline-block max-h-full max-w-full overflow-hidden border border-border bg-surface"
    >
      <img
        src={imageOr(image)}
        alt={alt}
        width={1600}
        height={1104}
        {...(priority ? {} : { loading: "lazy" as const })}
        style={maxH != null ? { maxHeight: maxH } : undefined}
        className="block h-auto w-auto max-w-full object-contain"
      />
      {items.map((item, i) => {
        const hs = item.ref.hotspot;
        if (!hs) return null;
        const active = activeId === item.ref.id;
        return (
          <button
            key={item.ref.id}
            type="button"
            onClick={() => onSelect(item.ref.id)}
            style={{ left: `${hs.x * 100}%`, top: `${hs.y * 100}%` }}
            aria-label={`${item.name} parçasını görüntüle`}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          >
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full border py-1 pl-1 shadow-sm transition-colors sm:pr-2.5",
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card/95 text-foreground hover:border-accent",
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full font-mono text-[10px]",
                  active ? "bg-accent-foreground/20" : "bg-foreground/5",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hidden max-w-[9rem] truncate text-xs font-medium sm:inline">{item.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
