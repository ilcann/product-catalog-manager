import monaSofa from "@/assets/mona-sofa.jpg";
import atlasTable from "@/assets/atlas-table.jpg";
import imgFrameBeech from "@/assets/components/frame-beech.jpg";
import imgFoamHr35 from "@/assets/components/foam-hr35.jpg";
import imgFabricVerona from "@/assets/components/fabric-verona.jpg";
import imgLegCone from "@/assets/components/leg-cone.jpg";
import imgCushionBack from "@/assets/components/cushion-back.jpg";
import imgCushionSeat from "@/assets/components/cushion-seat.jpg";
import imgSurfaceOak from "@/assets/components/surface-oak.jpg";
import imgFoam32 from "@/assets/components/foam-32.jpg";
import imgFoam40 from "@/assets/components/foam-40.jpg";
import imgVerona101 from "@/assets/components/verona-101.jpg";
import imgVerona102 from "@/assets/components/verona-102.jpg";
import imgVerona105 from "@/assets/components/verona-105.jpg";
import imgLegBlack from "@/assets/components/leg-black.jpg";
import imgLegGold from "@/assets/components/leg-gold.jpg";
import imgLegChrome from "@/assets/components/leg-chrome.jpg";
import imgOakNatural from "@/assets/components/oak-natural.jpg";
import imgOakSmoked from "@/assets/components/oak-smoked.jpg";
import catOturmaGrubu from "@/assets/cat-oturma-grubu.jpg";
import catKoltuk from "@/assets/cat-koltuk.jpg";
import catKoseKoltuk from "@/assets/cat-kose-koltuk.jpg";
import catBerjer from "@/assets/cat-berjer.jpg";
import catKanepe from "@/assets/cat-kanepe.jpg";
import catYemekOdasi from "@/assets/cat-yemek-odasi.jpg";
import catYemekMasasi from "@/assets/cat-yemek-masasi.jpg";
import catSandalye from "@/assets/cat-sandalye.jpg";
import catOrtaSehpa from "@/assets/cat-orta-sehpa.jpg";
import catTvUnitesi from "@/assets/cat-tv-unitesi.jpg";
import catYatakOdasi from "@/assets/cat-yatak-odasi.jpg";
import catYatak from "@/assets/cat-yatak.jpg";
import catKomodin from "@/assets/cat-komodin.jpg";
import catGardirop from "@/assets/cat-gardirop.jpg";
import type {
  CatalogData,
  Category,
  ComponentDef,
  Product,
  Specification,
  TechDocument,
} from "./types";

const spec = (
  group: Specification["group"],
  key: string,
  value: string,
  unit?: string,
): Specification => ({
  id: `${group}-${key}`.toLowerCase().replace(/\s+/g, "-"),
  group,
  key,
  value,
  ...(unit ? { unit } : {}),
});

const doc = (
  id: string,
  title: string,
  kind: TechDocument["kind"],
  issuer?: string,
  reference?: string,
): TechDocument => ({
  id,
  title,
  kind,
  ...(issuer ? { issuer } : {}),
  ...(reference ? { reference } : {}),
});

const now = "2026-01-15T09:00:00.000Z";

const cat = (
  id: string,
  name: string,
  slug: string,
  description: string,
  parentId: string | null = null,
  image = "",
): Category => ({
  id,
  name,
  slug,
  description,
  image,
  isActive: true,
  parentId,
  specTemplates: [],
  createdAt: now,
  updatedAt: now,
});

export const demoCategories: Category[] = [
  cat("cat-oturma-grubu", "Oturma Grubu", "oturma-grubu", "Koltuk, kanepe ve berjer ailesi.", null, catOturmaGrubu),
  cat("cat-koltuk", "Koltuk", "koltuk", "Tekli ve çoklu koltuklar.", "cat-oturma-grubu", catKoltuk),
  cat("cat-kose-koltuk", "Köşe Koltuk", "kose-koltuk", "Modüler ve köşe oturma grupları.", "cat-oturma-grubu", catKoseKoltuk),
  cat("cat-berjer", "Berjer", "berjer", "Tekli dinlenme koltukları.", "cat-oturma-grubu", catBerjer),
  cat("cat-kanepe", "Kanepe", "kanepe", "İkili ve üçlü kanepeler.", "cat-oturma-grubu", catKanepe),
  cat("cat-yemek-odasi", "Yemek Odası", "yemek-odasi", "Yemek masası ve sandalye grupları.", null, catYemekOdasi),
  cat("cat-yemek-masasi", "Yemek Masası", "yemek-masasi", "Masif ve kaplama yemek masaları.", "cat-yemek-odasi", catYemekMasasi),
  cat("cat-sandalye", "Sandalye", "sandalye", "Döşemeli ve ahşap sandalyeler.", "cat-yemek-odasi", catSandalye),
  cat("cat-orta-sehpa", "Orta Sehpa", "orta-sehpa", "Salon orta ve yan sehpaları.", null, catOrtaSehpa),
  cat("cat-tv-unitesi", "TV Ünitesi", "tv-unitesi", "Salon TV üniteleri ve konsollar.", null, catTvUnitesi),
  cat("cat-yatak-odasi", "Yatak Odası", "yatak-odasi", "Yatak odası ürün ailesi.", null, catYatakOdasi),
  cat("cat-yatak", "Yatak", "yatak", "Baza ve karyola grupları.", "cat-yatak-odasi", catYatak),
  cat("cat-komodin", "Komodin", "komodin", "Yatak odası komodinleri.", "cat-yatak-odasi", catKomodin),
  cat("cat-gardirop", "Gardırop", "gardirop", "Sürgülü ve menteşeli gardıroplar.", "cat-yatak-odasi", catGardirop),
];


const components: ComponentDef[] = [
  {
    id: "cmp-frame-beech",
    name: "Masif Kayın İskelet",
    code: "FRM-BEECH-01",
    type: "frame",
    description:
      "Fırınlanmış masif kayın ve kontrplak kombinasyonu, zımbalı ve tutkallı birleşim.",
    images: [imgFrameBeech],
    specs: [
      spec("material", "Malzeme", "Masif kayın + 18 mm kontrplak"),
      spec("material", "Birleşim", "Tutkal + zımba + köşe takozu"),
      spec("dimensions", "Kesit", "45 x 70", "mm"),
      spec("performance", "Yük Taşıma", "180", "kg/oturum"),
      spec("performance", "Nem Oranı", "8-10", "%"),
    ],
    variants: [],
    documents: [
      doc("d-frm-1", "FSC Sertifikası", "certificate", "FSC", "FSC-C123456"),
      doc("d-frm-2", "Yük Dayanım Test Raporu", "test-report", "TSE", "TR-2025-4412"),
    ],
  },
  {
    id: "cmp-foam-hr35",
    name: "HR Sünger 35 DNS",
    code: "FOAM-HR35",
    type: "foam",
    description: "Yüksek elastikiyetli soğuk sünger, oturum konforu için.",
    images: [imgFoamHr35],
    specs: [
      spec("material", "Tip", "HR (High Resilience) soğuk sünger"),
      spec("material", "Üretici", "ABC Sünger A.Ş."),
      spec("dimensions", "Kalınlık", "15", "cm"),
      spec("performance", "Yoğunluk", "35", "kg/m³"),
      spec("performance", "Sertlik (ILD)", "180", "N"),
      spec("performance", "Kalıcı Deformasyon", "< 5", "%"),
    ],
    variants: [
      {
        id: "v-foam-32",
        name: "Soft 32 DNS",
        code: "FOAM-HR32",
        image: imgFoam32,
        specs: [spec("performance", "Yoğunluk", "32", "kg/m³")],
      },
      {
        id: "v-foam-40",
        name: "Firm 40 DNS",
        code: "FOAM-HR40",
        image: imgFoam40,
        specs: [spec("performance", "Yoğunluk", "40", "kg/m³")],
      },
    ],
    documents: [
      doc("d-foam-1", "Sünger Test Raporu", "test-report", "SGS", "SGS-FM-8871"),
      doc("d-foam-2", "Yangın Dayanım Raporu", "certificate", "BS 5852", "FR-1122"),
    ],
  },
  {
    id: "cmp-fabric-verona",
    name: "Verona Döşeme Kumaşı",
    code: "FAB-VRN",
    type: "fabric",
    description: "Boucle dokulu, leke tutmaz apreli polyester karışım döşemelik.",
    images: [imgFabricVerona],
    specs: [
      spec("material", "İçerik", "%78 Polyester, %22 Akrilik"),
      spec("material", "Apre", "Su ve leke itici"),
      spec("dimensions", "En", "140", "cm"),
      spec("dimensions", "Gramaj", "420", "g/m²"),
      spec("performance", "Martindale", "60.000", "devir"),
      spec("performance", "Işık Haslığı", "5", "/8"),
      spec("certifications", "OEKO-TEX", "Standard 100 – Class II"),
    ],
    variants: [
      {
        id: "v-vrn-101",
        name: "Verona 101 – Kum",
        code: "VRN-101",
        swatch: "#c9b79a",
        image: imgVerona101,
        specs: [spec("material", "Renk", "Kum bej")],
      },
      {
        id: "v-vrn-102",
        name: "Verona 102 – Antrasit",
        code: "VRN-102",
        swatch: "#3f4245",
        image: imgVerona102,
        specs: [spec("material", "Renk", "Antrasit")],
      },
      {
        id: "v-vrn-105",
        name: "Verona 105 – Yeşil",
        code: "VRN-105",
        swatch: "#4d5f4a",
        image: imgVerona105,
        specs: [spec("material", "Renk", "Adaçayı yeşili")],
      },
    ],
    documents: [
      doc("d-fab-1", "OEKO-TEX Standard 100", "certificate", "OEKO-TEX", "OT-2025-77"),
      doc("d-fab-2", "Martindale Aşınma Raporu", "test-report", "Intertek", "IT-9932"),
    ],
  },
  {
    id: "cmp-leg-cone",
    name: "Metal Konik Ayak",
    code: "LEG-CONE",
    type: "leg",
    description: "Çelik konik ayak, elektrostatik toz boyalı, ayarlanabilir pabuç.",
    images: [imgLegCone],
    specs: [
      spec("material", "Malzeme", "Çelik"),
      spec("material", "Kaplama", "Elektrostatik toz boya"),
      spec("dimensions", "Yükseklik", "15", "cm"),
      spec("performance", "Tuz Püskürtme Testi", "240", "saat"),
    ],
    variants: [
      {
        id: "v-leg-black",
        name: "Siyah Metal",
        code: "LEG-CONE-BK",
        swatch: "#1b1b1b",
        image: imgLegBlack,
        specs: [spec("material", "Renk", "Mat siyah")],
      },
      {
        id: "v-leg-gold",
        name: "Gold Metal",
        code: "LEG-CONE-GD",
        swatch: "#b08d4f",
        image: imgLegGold,
        specs: [spec("material", "Renk", "Saten gold")],
      },
      {
        id: "v-leg-chrome",
        name: "Krom",
        code: "LEG-CONE-CR",
        swatch: "#b9bfc4",
        image: imgLegChrome,
        specs: [spec("material", "Renk", "Parlak krom")],
      },
    ],
    documents: [
      doc("d-leg-1", "Malzeme Sertifikası", "certificate", "Tedarikçi", "MTC-4410"),
    ],
  },
  {
    id: "cmp-cushion-back",
    name: "Sırt Minderi",
    code: "CSH-BACK",
    type: "cushion",
    description: "Silikon elyaf dolgulu, fermuarlı çıkarılabilir kılıf.",
    images: [imgCushionBack],
    specs: [
      spec("material", "Dolgu", "Silikonize elyaf + sünger çekirdek"),
      spec("dimensions", "Ölçü", "60 x 45", "cm"),
      spec("performance", "Geri Dönüş", "Yüksek"),
    ],
    variants: [],
    documents: [doc("d-csh-1", "Dolgu Malzeme Föyü", "datasheet", "ABC Sünger")],
  },
  {
    id: "cmp-cushion-seat",
    name: "Oturum Minderi",
    code: "CSH-SEAT",
    type: "cushion",
    description: "HR sünger çekirdek üzerine elyaf sargı.",
    images: [imgCushionSeat],
    specs: [
      spec("material", "Çekirdek", "HR 35 DNS sünger"),
      spec("material", "Sargı", "150 g/m² elyaf"),
      spec("dimensions", "Ölçü", "60 x 60 x 15", "cm"),
      spec("performance", "Konfor Sınıfı", "Medium-firm"),
    ],
    variants: [],
    documents: [],
  },
  {
    id: "cmp-surface-oak",
    name: "Masif Meşe Tabla",
    code: "SRF-OAK",
    type: "surface",
    description: "Lamine masif meşe tabla, doğal yağ verniği.",
    images: [imgSurfaceOak],
    specs: [
      spec("material", "Malzeme", "Masif meşe (lamine)"),
      spec("material", "Yüzey", "Doğal sert yağ"),
      spec("dimensions", "Kalınlık", "4", "cm"),
      spec("performance", "Isı Dayanımı", "70", "°C"),
    ],
    variants: [
      {
        id: "v-oak-natural",
        name: "Doğal",
        code: "SRF-OAK-NAT",
        swatch: "#c08f4f",
        image: imgOakNatural,
        specs: [],
      },
      {
        id: "v-oak-smoked",
        name: "Füme",
        code: "SRF-OAK-SMK",
        swatch: "#6b4f34",
        image: imgOakSmoked,
        specs: [],
      },
    ],
    documents: [doc("d-srf-1", "FSC Sertifikası", "certificate", "FSC", "FSC-C123456")],
  },
];

const monaProduct: Product = {
  id: "prd-mona",
  slug: "mona-modular-sofa",
  name: "Mona Modular Sofa",
  code: "MONA-3S-L",
  categoryId: "cat-kose-koltuk",
  summary:
    "Modüler köşe koltuk. Masif kayın iskelet, HR sünger konfor katmanı ve değiştirilebilir Verona döşeme.",
  heroImage: monaSofa,
  gallery: [monaSofa],
  status: "published",
  manufacturerId: "mfr-1",
  createdAt: "2026-01-14T09:20:00.000Z",
  updatedAt: "2026-02-28T11:05:00.000Z",
  specs: [
    spec("dimensions", "Genişlik", "310", "cm"),
    spec("dimensions", "Derinlik", "165", "cm"),
    spec("dimensions", "Yükseklik", "82", "cm"),
    spec("dimensions", "Oturum Yüksekliği", "44", "cm"),
    spec("general", "Kullanım", "Rezidans / Kontrakt"),
    spec("performance", "Garanti", "5", "yıl"),
  ],
  documents: [
    doc("d-prd-1", "Teknik Föy", "datasheet", "Nordveka"),
    doc("d-prd-2", "Kullanım Kılavuzu", "manual", "Nordveka"),
    doc("d-prd-3", "Garanti Belgesi", "warranty", "Nordveka", "GB-2026-0031"),
    doc("d-prd-4", "Genel Ürün Test Raporu", "test-report", "TSE", "TR-2026-118"),
  ],
  components: [
    {
      id: "pc-1",
      componentId: "cmp-frame-beech",
      order: 0,
      active: true,
      hotspot: { x: 0.5, y: 0.62 },
    },
    {
      id: "pc-2",
      componentId: "cmp-foam-hr35",
      order: 1,
      active: true,
      hotspot: { x: 0.33, y: 0.55 },
      overrides: {
        specs: [spec("dimensions", "Kalınlık", "18", "cm")],
      },
    },
    {
      id: "pc-3",
      componentId: "cmp-fabric-verona",
      order: 2,
      active: true,
      hotspot: { x: 0.62, y: 0.34 },
      defaultVariantId: "v-vrn-101",
    },
    {
      id: "pc-4",
      componentId: "cmp-leg-cone",
      order: 3,
      active: true,
      hotspot: { x: 0.2, y: 0.79 },
      defaultVariantId: "v-leg-black",
    },
    {
      id: "pc-5",
      componentId: "cmp-cushion-back",
      order: 4,
      active: true,
      hotspot: { x: 0.4, y: 0.36 },
    },
    {
      id: "pc-6",
      componentId: "cmp-cushion-seat",
      order: 5,
      active: true,
      hotspot: { x: 0.47, y: 0.56 },
    },
  ],
};

const atlasProduct: Product = {
  id: "prd-atlas",
  slug: "atlas-dining-table",
  name: "Atlas Dining Table",
  code: "ATLAS-240",
  categoryId: "cat-yemek-masasi",
  summary: "Masif meşe tabla ve kutu profil metal ayaklı yemek masası.",
  heroImage: atlasTable,
  gallery: [atlasTable],
  status: "published",
  manufacturerId: "mfr-1",
  createdAt: "2025-11-03T08:00:00.000Z",
  updatedAt: "2026-01-22T15:40:00.000Z",
  specs: [
    spec("dimensions", "Genişlik", "240", "cm"),
    spec("dimensions", "Derinlik", "100", "cm"),
    spec("dimensions", "Yükseklik", "75", "cm"),
    spec("general", "Kapasite", "8-10 kişi"),
  ],
  documents: [doc("d-atlas-1", "Teknik Föy", "datasheet", "Nordveka")],
  components: [
    {
      id: "pa-1",
      componentId: "cmp-surface-oak",
      order: 0,
      active: true,
      hotspot: { x: 0.5, y: 0.36 },
      defaultVariantId: "v-oak-natural",
    },
    {
      id: "pa-2",
      componentId: "cmp-leg-cone",
      order: 1,
      active: true,
      hotspot: { x: 0.22, y: 0.66 },
      defaultVariantId: "v-leg-black",
      overrides: {
        name: "Kutu Profil Metal Ayak",
        specs: [spec("dimensions", "Yükseklik", "71", "cm")],
      },
    },
  ],
};

export const demoCatalog: CatalogData = {
  manufacturer: {
    id: "mfr-1",
    name: "Nordveka Furniture",
    location: "İnegöl, Bursa – Türkiye",
    about:
      "1998'den bu yana rezidans ve kontrakt projeler için modüler oturma grupları ve masif ahşap mobilya üretimi.",
    contactEmail: "sales@nordveka.com",
    contactPhone: "+90 224 000 00 00",
    certifications: [
      doc("mc-1", "ISO 9001:2015 Kalite Yönetim Sistemi", "certificate", "TÜV", "QMS-88112"),
      doc("mc-2", "ISO 14001 Çevre Yönetim Sistemi", "certificate", "TÜV", "EMS-44120"),
      doc("mc-3", "FSC Chain of Custody", "certificate", "FSC", "FSC-C123456"),
    ],
  },
  categories: demoCategories,
  components,
  products: [monaProduct, atlasProduct],
};
