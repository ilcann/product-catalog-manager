import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeftRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SideSwitch } from "@/components/catalog/side-switch";
import { Package, FolderTree, Boxes, Building2 } from "lucide-react";

const nav = [
  { to: "/admin", label: "Ürünler", exact: true, Icon: Package },
  { to: "/admin/categories", label: "Kategoriler", exact: false, Icon: FolderTree },
  { to: "/admin/components", label: "Parçalar", exact: false, Icon: Boxes },
  { to: "/admin/manufacturer", label: "Firma & Sertifikalar", exact: false, Icon: Building2 },
] as const;

/**
 * Two-tier admin header matching the public SiteHeader layout:
 * top tier holds centered admin nav + a "Vitrin" button on the right;
 * bottom tier holds the centered "Nordveka / Admin" wordmark.
 * Below `md` the nav collapses into a hamburger sheet.
 */
function MenuBody({
  Close,
  menuActions,
}: {
  Close: typeof SheetClose;
  menuActions?: ReactNode;
}) {
  return (
    <>
      <SideSwitch side="admin" Close={Close} />
      <nav className="flex flex-col p-2">
        {nav.map(({ to, label, exact, Icon }) => (
          <Close asChild key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {label}
            </Link>
          </Close>
        ))}
      </nav>
      {menuActions ? (
        <div className="mt-2 border-t border-border p-4">{menuActions}</div>
      ) : null}
    </>
  );
}

export function AdminShell({
  title,
  description,
  actions,
  menuActions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  menuActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="shrink-0 border-b border-border bg-background">
        {/* Top tier — nav + vitrin */}
        <div className="flex h-12 items-center justify-between gap-4 border-b border-border/60 px-4 sm:px-6">
          {/* Left spacer */}
          <div className="hidden flex-1 md:block" aria-hidden />

          {/* Center — admin nav (desktop) */}
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{
                  className: "text-muted-foreground hover:text-foreground",
                }}
                className="text-[11px] font-medium uppercase tracking-[0.2em] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right — vitrin button + mobile menu */}
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/">
                <ArrowLeftRight className="size-4" />
                <span>Showroom</span>
              </Link>
            </Button>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menü">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] max-w-[85vw] p-0">
                  <SheetHeader className="border-b border-border px-5 py-4 text-left">
                    <SheetTitle className="font-mono text-xs tracking-[0.2em] uppercase">
                      Admin Menü
                    </SheetTitle>
                  </SheetHeader>
                  <MenuBody Close={SheetClose} menuActions={menuActions} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Bottom tier — centered brand wordmark */}
        <div className="flex h-16 items-center justify-center px-4">
          <Link
            to="/admin"
            className="text-2xl font-black uppercase tracking-[0.15em] text-foreground"
          >
            Nordveka <span className="text-accent">/ Admin</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
