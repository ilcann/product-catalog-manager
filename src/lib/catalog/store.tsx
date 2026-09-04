import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoCatalog } from "./demo-data";
import {
  slugify,
  uid,
  type CatalogData,
  type Category,
  type ComponentDef,
  type Manufacturer,
  type Product,
} from "./types";

const STORAGE_KEY = "nordveka-catalog-v1";

/**
 * Safe migration for data persisted before categories became a relation:
 * products that only carry a legacy `category` string get (or create) a real
 * category record; products with no category stay untouched (categoryId: null).
 */
export function migrateCatalog(raw: CatalogData): CatalogData {
  const categories: Category[] = [...(raw.categories ?? [])];
  const stamp = new Date().toISOString();

  const products = (raw.products ?? []).map((p) => {
    if (p.categoryId && categories.some((c) => c.id === p.categoryId)) return p;
    const legacy = p.category?.trim();
    if (!legacy) return { ...p, categoryId: p.categoryId ?? null };
    const slug = slugify(legacy);
    let match = categories.find(
      (c) => c.slug === slug || c.name.toLowerCase() === legacy.toLowerCase(),
    );
    if (!match) {
      match = {
        id: `cat-${uid()}`,
        name: legacy,
        slug: slug || `kategori-${uid()}`,
        isActive: true,
        parentId: null,
        specTemplates: [],
        createdAt: stamp,
        updatedAt: stamp,
      };
      categories.push(match);
    }
    return { ...p, categoryId: match.id };
  });

  return { ...raw, categories, products };
}

interface CatalogContextValue {
  data: CatalogData;
  getProduct: (slugOrId: string) => Product | undefined;
  getComponent: (id: string) => ComponentDef | undefined;
  getCategory: (idOrSlug: string) => Category | undefined;
  categoryName: (id: string | null | undefined) => string;
  productCount: (categoryId: string) => number;
  updateProduct: (id: string, patch: (p: Product) => Product) => void;
  createProduct: (partial?: Partial<Product>) => Product;
  addProduct: (product: Product) => Product;
  removeProduct: (id: string) => void;
  updateManufacturer: (patch: (m: Manufacturer) => Manufacturer) => void;
  upsertComponent: (component: ComponentDef) => void;
  removeComponent: (id: string) => void;
  upsertCategory: (category: Category) => void;
  /** removes a category; optionally moves its products to another category */
  removeCategory: (id: string, moveToCategoryId?: string | null) => void;
  reset: () => void;
}

// Keep a single context instance even if this module gets duplicated by
// dev-time HMR/optimizer reloads (otherwise consumers see a null context).
const globalRef = globalThis as typeof globalThis & {
  __nordvekaCatalogContext?: React.Context<CatalogContextValue | null>;
};
const CatalogContext =
  globalRef.__nordvekaCatalogContext ??
  (globalRef.__nordvekaCatalogContext = createContext<CatalogContextValue | null>(null));

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogData>(demoCatalog);

  // hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(migrateCatalog(JSON.parse(raw) as CatalogData));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: CatalogData) => {
    setData(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      data,
      getProduct: (key) => data.products.find((p) => p.slug === key || p.id === key),
      getComponent: (id) => data.components.find((c) => c.id === id),
      getCategory: (key) => data.categories.find((c) => c.id === key || c.slug === key),
      categoryName: (id) =>
        (id && data.categories.find((c) => c.id === id)?.name) || "Kategorisiz",
      productCount: (categoryId) =>
        data.products.filter((p) => p.categoryId === categoryId).length,
      updateProduct: (id, patch) =>
        persist({
          ...data,
          products: data.products.map((p) => (p.id === id ? patch(p) : p)),
        }),
      removeProduct: (id) =>
        persist({ ...data, products: data.products.filter((p) => p.id !== id) }),
      createProduct: (partial) => {
        const id = uid();
        const slug = (partial?.slug || `urun-${id}`);
        const now = new Date().toISOString();
        const product: Product = {
          id,
          slug,
          name: partial?.name ?? "Yeni Ürün",
          code: partial?.code ?? "",
          categoryId: partial?.categoryId ?? null,
          summary: partial?.summary ?? "",
          heroImage: partial?.heroImage ?? "",
          gallery: partial?.gallery ?? [],
          status: partial?.status ?? "draft",
          specs: partial?.specs ?? [],
          components: partial?.components ?? [],
          documents: partial?.documents ?? [],
          manufacturerId: partial?.manufacturerId ?? data.manufacturer.id,
          createdAt: now,
          updatedAt: now,
        };
        persist({ ...data, products: [...data.products, product] });
        return product;
      },
      addProduct: (product) => {
        persist({ ...data, products: [...data.products, product] });
        return product;
      },
      updateManufacturer: (patch) =>
        persist({ ...data, manufacturer: patch(data.manufacturer) }),
      upsertComponent: (component) =>
        persist({
          ...data,
          components: data.components.some((c) => c.id === component.id)
            ? data.components.map((c) => (c.id === component.id ? component : c))
            : [...data.components, component],
        }),
      removeComponent: (id) =>
        persist({
          ...data,
          components: data.components.filter((c) => c.id !== id),
          products: data.products.map((p) => ({
            ...p,
            components: p.components.filter((pc) => pc.componentId !== id),
          })),
        }),
      upsertCategory: (category) =>
        persist({
          ...data,
          categories: data.categories.some((c) => c.id === category.id)
            ? data.categories.map((c) => (c.id === category.id ? category : c))
            : [...data.categories, category],
        }),
      removeCategory: (id, moveToCategoryId) =>
        persist({
          ...data,
          categories: data.categories
            .filter((c) => c.id !== id)
            .map((c) => (c.parentId === id ? { ...c, parentId: null } : c)),
          products: data.products.map((p) =>
            p.categoryId === id ? { ...p, categoryId: moveToCategoryId ?? null } : p,
          ),
        }),
      reset: () => persist(demoCatalog),
    }),
    [data, persist],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
