import { Link } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog/store";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

/** Public site footer — tasarım sistemiyle uyumlu, minimal B2B footer. */
export function SiteFooter() {
  const { data } = useCatalog();
  const m = data.manufacturer;
  const categories = data.categories.filter((c) => c.isActive).slice(0, 6);

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="text-xl font-black uppercase tracking-[0.15em] text-foreground"
            >
              Nordveka <span className="text-accent">Furniture</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {m.about ??
                "Modüler oturma grupları ve masif ahşap mobilya üretimi. Rezidans ve kontrakt projeler için tasarlıyor, kendi atölyemizde üretiyoruz."}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2.5">
            <span className="tech-label mb-1">Site</span>
            {[
              { to: "/", label: "Anasayfa" },
              { to: "/products", label: "Ürünlerimiz" },
              { to: "/about", label: "Hakkımızda" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Categories */}
          <nav className="flex flex-col gap-2.5">
            <span className="tech-label mb-1">Kategoriler</span>
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/products/$categorySlug"
                params={{ categorySlug: c.slug }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
            >
              Tümü <ArrowUpRight className="size-3.5" />
            </Link>
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <span className="tech-label mb-1">İletişim</span>
            {m.location ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-accent" strokeWidth={1.5} />
                {m.location}
              </span>
            ) : null}
            {m.contactEmail ? (
              <a
                href={`mailto:${m.contactEmail}`}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="size-3.5 shrink-0 text-accent" strokeWidth={1.5} />
                {m.contactEmail}
              </a>
            ) : null}
            {m.contactPhone ? (
              <a
                href={`tel:${m.contactPhone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-3.5 shrink-0 text-accent" strokeWidth={1.5} />
                {m.contactPhone}
              </a>
            ) : null}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            © {year} Nordveka Furniture · Tüm hakları saklıdır
          </p>
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Dijital Ürün Kimliği · QR
          </p>
        </div>
      </div>
    </footer>
  );
}
