// Generic, category-agnostic data model.
// No hard-coded product fields (width / material / foamDensity ...) —
// everything technical is expressed as dynamic Specification entries.

export type SpecGroup =
  | "general"
  | "material"
  | "dimensions"
  | "performance"
  | "certifications";

export const SPEC_GROUPS: { id: SpecGroup; label: string; labelTr: string }[] = [
  { id: "general", label: "General", labelTr: "Genel" },
  { id: "material", label: "Material", labelTr: "Malzeme" },
  { id: "dimensions", label: "Dimensions", labelTr: "Ölçüler" },
  { id: "performance", label: "Performance", labelTr: "Performans" },
  { id: "certifications", label: "Certifications", labelTr: "Sertifikalar" },
];

export interface Specification {
  id: string;
  group: SpecGroup;
  key: string;
  value: string;
  unit?: string | undefined;
}

export type DocumentKind =
  | "datasheet"
  | "manual"
  | "warranty"
  | "test-report"
  | "certificate";

export interface TechDocument {
  id: string;
  title: string;
  kind: DocumentKind;
  issuer?: string;
  reference?: string;
  validUntil?: string;
  url?: string;
}

export interface ComponentVariant {
  id: string;
  name: string;
  code: string;
  swatch?: string; // css color for a simple visual token
  image?: string;
  specs: Specification[];
}

export type ComponentType =
  | "frame"
  | "foam"
  | "fabric"
  | "leg"
  | "mechanism"
  | "cushion"
  | "surface"
  | "hardware"
  | "other";

export const COMPONENT_TYPES: { id: ComponentType; label: string }[] = [
  { id: "frame", label: "Gövde / İskelet" },
  { id: "foam", label: "Sünger" },
  { id: "fabric", label: "Kumaş / Döşeme" },
  { id: "leg", label: "Ayak" },
  { id: "mechanism", label: "Mekanizma" },
  { id: "cushion", label: "Minder" },
  { id: "surface", label: "Yüzey / Tabla" },
  { id: "hardware", label: "Hırdavat" },
  { id: "other", label: "Diğer" },
];

/** Reusable component, shared across products (component library). */
export interface ComponentDef {
  id: string;
  name: string;
  code: string;
  type: ComponentType;
  description?: string | undefined;
  images: string[];
  specs: Specification[];
  variants: ComponentVariant[];
  documents: TechDocument[];
}

/** A component placed on a product, with product-specific overrides. */
export interface ProductComponentRef {
  id: string;
  componentId: string;
  order: number;
  active: boolean;
  /** normalized 0..1 coordinates on the product hero image (hotspot ready) */
  hotspot?: { x: number; y: number } | undefined;
  /** per-image hotspots keyed by image source (gallery images; hero lives in `hotspot`) */
  hotspots?: Record<string, { x: number; y: number }> | undefined;
  defaultVariantId?: string | undefined;
  overrides?: {
    name?: string;
    description?: string;
    /** specs added or replacing library specs (matched by key) */
    specs?: Specification[];
  };
}

/**
 * Category is a first-class entity. Products reference it by id (relation),
 * never by a free-text string.
 * `parentId` keeps the schema ready for a hierarchy, and `specTemplates`
 * is the extension point for category-specific specification templates.
 */
export interface CategorySpecTemplate {
  id: string;
  group: SpecGroup;
  key: string;
  unit?: string | undefined;
  required?: boolean | undefined;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | undefined;
  image?: string | undefined;
  isActive: boolean;
  parentId?: string | null | undefined;
  specTemplates: CategorySpecTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  code: string;
  /** relation → Category.id */
  categoryId: string | null;
  /** legacy free-text category, kept only for safe migration of old data */
  category?: string | undefined;
  summary?: string;
  heroImage: string;
  gallery: string[];
  status: "draft" | "published";
  specs: Specification[];
  components: ProductComponentRef[];
  documents: TechDocument[];
  manufacturerId: string;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface Manufacturer {
  id: string;
  name: string;
  location?: string;
  about?: string;
  contactEmail?: string;
  contactPhone?: string;
  /** company-level certifications — never product/component scoped */
  certifications: TechDocument[];
}

export interface CatalogData {
  manufacturer: Manufacturer;
  categories: Category[];
  components: ComponentDef[];
  products: Product[];
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


/** Resolved view of a product component (library def + overrides applied). */
export interface ResolvedComponent {
  ref: ProductComponentRef;
  def: ComponentDef;
  name: string;
  description?: string | undefined;
  specs: Specification[];
  overriddenKeys: string[];
}

export function resolveComponent(
  ref: ProductComponentRef,
  def: ComponentDef,
): ResolvedComponent {
  const overrides = ref.overrides?.specs ?? [];
  const merged: Specification[] = def.specs.map((s) => {
    const o = overrides.find(
      (x) => x.key.toLowerCase() === s.key.toLowerCase() && x.group === s.group,
    );
    return o ? { ...s, value: o.value, unit: o.unit } : s;
  });
  const added = overrides.filter(
    (o) =>
      !def.specs.some(
        (s) => s.key.toLowerCase() === o.key.toLowerCase() && s.group === o.group,
      ),
  );
  return {
    ref,
    def,
    name: ref.overrides?.name || def.name,
    description: ref.overrides?.description || def.description,
    specs: [...merged, ...added],
    overriddenKeys: overrides.map((o) => o.key.toLowerCase()),
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);
