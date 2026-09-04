import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/catalog/site-header";
import { SiteFooter } from "@/components/catalog/site-footer";
import { useCatalog } from "@/lib/catalog/store";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "Hakkımızda | Nordveka Furniture" },
      {
        name: "description",
        content:
          "Nordveka Furniture'ın üretim yaklaşımı, malzeme standartları ve parça bazlı ürün şeffaflığı hakkında bilgi.",
      },
      { property: "og:title", content: "Hakkımızda | Nordveka Furniture" },
      {
        property: "og:description",
        content:
          "Üretim yaklaşımımız, sertifikalarımız ve parça bazlı ürün şeffaflığı.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function About() {
  const { data } = useCatalog();
  const m = data.manufacturer;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <span className="tech-label">Hakkımızda</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {m.name}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.about}</p>

        <dl className="mt-10 border-t border-border">
          {[
            { label: "Lokasyon", value: m.location ?? "—" },
            { label: "E-posta", value: m.contactEmail ?? "—" },
            { label: "Telefon", value: m.contactPhone ?? "—" },
            { label: "Sertifika", value: `${m.certifications.length} belge` },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-border py-3"
            >
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </main>

      <SiteFooter />
    </div>
  );
}
