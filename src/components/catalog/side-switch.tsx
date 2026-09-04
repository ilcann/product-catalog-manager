import { Link } from "@tanstack/react-router";
import { Store, SlidersHorizontal, ArrowRight } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import type { PopoverClose } from "@/components/ui/popover";

/**
 * Two-sided navigation switch: public showroom <-> manufacturer panel.
 * Shown at the top of the menu surfaces so the current side is always clear.
 * `Close` matches the surrounding surface (Sheet on mobile, Popover on desktop).
 */
export function SideSwitch({
  side,
  Close = SheetClose,
}: {
  side: "public" | "admin";
  Close?: typeof SheetClose | typeof PopoverClose;
}) {
  const items = [
    {
      key: "public" as const,
      to: "/" as const,
      Icon: Store,
      label: "Showroom",
      hint: "Public katalog",
    },
    {
      key: "admin" as const,
      to: "/admin" as const,
      Icon: SlidersHorizontal,
      label: "Panel",
      hint: "Üretici yönetimi",
    },
  ];

  return (
    <div className="border-b border-border bg-surface/60 p-3">
      <span className="tech-label px-1">Görünüm</span>
      <div className="mt-2 grid grid-cols-2 gap-1 border border-border bg-background p-1">
        {items.map(({ key, to, Icon, label, hint }) => {
          const active = key === side;
          return (
            <Close asChild key={key}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col gap-1 px-3 py-2.5 transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {label}
                  {!active ? <ArrowRight className="size-3 shrink-0 opacity-60" /> : null}
                </span>
                <span
                  className={`font-mono text-[10px] tracking-wide ${
                    active ? "opacity-70" : "opacity-60"
                  }`}
                >
                  {hint}
                </span>
              </Link>
            </Close>
          );
        })}
      </div>
    </div>
  );
}
