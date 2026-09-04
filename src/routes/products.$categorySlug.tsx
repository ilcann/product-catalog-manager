import { createFileRoute } from "@tanstack/react-router";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";

export const Route = createFileRoute("/products/$categorySlug")({
  head: ({ params }) => {
    const label = params.categorySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = `${label} — Nordveka Katalog`;
    const description = `${label} kategorisindeki Nordveka ürünleri, parça bazlı teknik verileri ve belgeleri.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryCatalog,
});

function CategoryCatalog() {
  const { categorySlug } = Route.useParams();
  return <CatalogBrowser activeSlug={categorySlug} />;
}
