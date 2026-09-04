import { createFileRoute } from "@tanstack/react-router";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Tüm Ürünler — Nordveka Katalog" },
      {
        name: "description",
        content:
          "Nordveka ürün kataloğu: koltuk, kanepe, masa ve sandalye kategorileriyle parça bazlı teknik veri.",
      },
      { property: "og:title", content: "Tüm Ürünler — Nordveka Katalog" },
      {
        property: "og:description",
        content: "Kategori bazlı ürün kataloğu ve dijital ürün kimlikleri.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CatalogBrowser activeSlug={null} />,
});
