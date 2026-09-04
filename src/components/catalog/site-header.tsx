import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, LayoutGrid, Info, Search, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCatalog } from "@/lib/catalog/store";
import { ProductSearch } from "@/components/catalog/product-search";
import { SideSwitch } from "@/components/catalog/side-switch";

const publicNav = [
  { to: "/products", label: "Ürünlerimiz", Icon: LayoutGrid },
  { to: "/about", label: "Hakkımızda", Icon: Info },
] as const;

/**
 * Shared public-site header. Two-tier layout inspired by the reference:
 * top tier holds centered primary nav + an Admin button on the right;
 * bottom tier holds the centered brand wordmark.
 * Below `md` the nav collapses into a hamburger sheet.
 */
export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { data, productCount } = useCatalog();
  const activeCategories = data.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <ProductSearch open={searchOpen} onOpenChange={setSearchOpen} />
      {/* Top tier — nav + admin */}
      <div className="flex h-12 items-center justify-between gap-4 border-b border-border/60 px-4 sm:px-6">
        {/* Left — mobile search button (icon only); desktop spacer keeps nav centered */}
        <div className="flex flex-1 items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Ara"
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <Search className="size-4" strokeWidth={1.75} />
          </button>
          <div className="hidden md:block" aria-hidden />
        </div>

        {/* Center — primary nav (desktop) */}
        <nav className="hidden items-center gap-6 md:flex">
          {publicNav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="text-[11px] font-medium uppercase tracking-[0.2em] transition-colors"
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Ara"
            className="flex items-center text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-3.5" strokeWidth={1.75} />
          </button>
        </nav>

        {/* Right — panel button + mobile menu */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link to="/admin">
              <ArrowLeftRight className="size-4" />
              <span>Panel</span>
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
                    Menü
                  </SheetTitle>
                </SheetHeader>
                <SideSwitch side="public" />
                <Accordion type="multiple" className="px-2">
                  <AccordionItem value="products" className="border-b-0">
                    <AccordionTrigger className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors hover:no-underline">
                      <LayoutGrid className="size-4 shrink-0" strokeWidth={1.75} />
                      <span className="flex-1 text-left">Ürünlerimiz</span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-2">
                      <div className="flex flex-col">
                        <SheetClose asChild>
                          <Link
                            to="/products"
                            activeProps={{ className: "bg-secondary text-foreground" }}
                            inactiveProps={{
                              className: "text-muted-foreground hover:text-foreground",
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-current opacity-40" />
                            Tüm Ürünler
                          </Link>
                        </SheetClose>
                        {activeCategories.map((cat) => (
                          <SheetClose asChild key={cat.id}>
                            <Link
                              to="/products/$categorySlug"
                              params={{ categorySlug: cat.slug }}
                              activeProps={{ className: "bg-secondary text-foreground" }}
                              inactiveProps={{
                                className: "text-muted-foreground hover:text-foreground",
                              }}
                              className="flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="size-1.5 shrink-0 rounded-full bg-current opacity-40" />
                                {cat.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {productCount(cat.id)}
                              </span>
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="about" className="border-b-0">
                    <SheetClose asChild>
                      <Link
                        to="/about"
                        activeProps={{ className: "text-foreground" }}
                        inactiveProps={{
                          className: "text-muted-foreground hover:text-foreground",
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors"
                      >
                        <Info className="size-4 shrink-0" strokeWidth={1.75} />
                        Hakkımızda
                      </Link>
                    </SheetClose>
                  </AccordionItem>
                </Accordion>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom tier — centered brand wordmark */}
      <div className="flex h-16 items-center justify-center px-4">
        <Link
          to="/"
          className="text-2xl font-black uppercase tracking-[0.15em] text-foreground"
        >
          Nordveka <span className="text-accent">Furniture</span>
        </Link>
      </div>
    </header>
  );
}
