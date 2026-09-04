import {
  COMPONENT_TYPES,
  SPEC_GROUPS,
  type Manufacturer,
  type Product,
  type ResolvedComponent,
  type TechDocument,
} from "./types";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const kindLabel: Record<TechDocument["kind"], string> = {
  datasheet: "Teknik Föy",
  manual: "Kılavuz",
  warranty: "Garanti",
  "test-report": "Test Raporu",
  certificate: "Sertifika",
};

function docRows(docs: TechDocument[]): string {
  return docs
    .map(
      (d) => `
      <tr>
        <td>${esc(d.title)}</td>
        <td>${kindLabel[d.kind]}</td>
        <td>${esc(d.issuer ?? "—")}</td>
        <td>${esc(d.reference ?? "—")}</td>
      </tr>`,
    )
    .join("");
}

function docSection(title: string, docs: TechDocument[]): string {
  if (docs.length === 0) {
    return `<p class="muted">${esc(title)}: belge eklenmemiş.</p>`;
  }
  return `
    <table>
      <thead>
        <tr><th>Belge</th><th>Tür</th><th>Düzenleyen</th><th>Referans</th></tr>
      </thead>
      <tbody>${docRows(docs)}</tbody>
    </table>`;
}

function specTable(specs: ResolvedComponent["specs"]): string {
  const groups = SPEC_GROUPS.map((g) => ({
    ...g,
    items: specs.filter((s) => s.group === g.id),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) return "";

  return groups
    .map(
      (g) => `
      <h4>${esc(g.labelTr)} · ${esc(g.label)}</h4>
      <table>
        <tbody>
          ${g.items
            .map(
              (s) => `
            <tr>
              <td class="key">${esc(s.key)}</td>
              <td>${esc(s.value)}${s.unit ? ` ${esc(s.unit)}` : ""}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`,
    )
    .join("");
}

export interface PrintProductInput {
  product: Product;
  items: ResolvedComponent[];
  categoryName: string | null;
  manufacturer: Manufacturer;
  productUrl: string;
}

export function printProductPdf({
  product,
  items,
  categoryName,
  manufacturer,
  productUrl,
}: PrintProductInput) {
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const componentCerts = items.flatMap((i) =>
    i.def.documents
      .filter((d) => d.kind === "certificate" || d.kind === "test-report")
      .map((d) => ({ ...d, title: `${d.title} (${i.name})` })),
  );

  const partsSection = items
    .map((item, i) => {
      const typeLabel =
        COMPONENT_TYPES.find((t) => t.id === item.def.type)?.label ?? "Diğer";
      const variants =
        item.def.variants.length > 0
          ? `<p class="muted small">Varyantlar: ${item.def.variants
              .map((v) => esc(v.name))
              .join(", ")}</p>`
          : "";
      const specs = specTable(item.specs);
      return `
        <div class="part">
          <div class="part-head">
            <span class="part-no">${String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3>${esc(item.name)}</h3>
              <p class="muted small">${esc(typeLabel)} · ${item.specs.length} özellik${
                item.def.variants.length > 0 ? ` · ${item.def.variants.length} varyant` : ""
              }</p>
            </div>
          </div>
          ${item.description ? `<p>${esc(item.description)}</p>` : ""}
          ${variants}
          ${specs}
        </div>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>${esc(product.name)} — Ürün Kimliği</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #1c1a17;
    padding: 56px 64px;
    font-size: 12px;
    line-height: 1.55;
  }
  header.brand {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #1c1a17;
    padding-bottom: 16px;
  }
  header.brand .logo {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 26px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  header.brand .meta {
    text-align: right;
    color: #6b645c;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .title-block { margin: 32px 0 8px; }
  .title-block .category {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #6b645c;
  }
  .title-block h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 32px;
    font-weight: 500;
    margin-top: 6px;
  }
  .title-block .code {
    font-family: "Courier New", monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    color: #6b645c;
    margin-top: 4px;
    text-transform: uppercase;
  }
  .hero {
    margin: 20px 0 8px;
    text-align: center;
    background: #f6f4f0;
    padding: 24px;
  }
  .hero img { max-width: 100%; max-height: 300px; object-fit: contain; }
  .summary { margin: 16px 0; color: #3d3831; max-width: 620px; }
  section { margin-top: 36px; page-break-inside: avoid; }
  section.page-break { page-break-before: always; }
  h2 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid #d8d2c8;
    padding-bottom: 8px;
    margin-bottom: 14px;
  }
  h2 .tab-no {
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    color: #6b645c;
    display: block;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  h4 {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6b645c;
    margin: 14px 0 4px;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th {
    text-align: left;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6b645c;
    border-bottom: 1px solid #d8d2c8;
    padding: 6px 8px 6px 0;
  }
  td { border-bottom: 1px solid #ece7de; padding: 7px 8px 7px 0; vertical-align: top; }
  td.key { color: #6b645c; width: 45%; }
  .part { border-bottom: 1px solid #ece7de; padding: 14px 0; page-break-inside: avoid; }
  .part-head { display: flex; gap: 12px; align-items: baseline; }
  .part-no { font-family: "Courier New", monospace; color: #6b645c; font-size: 11px; }
  .part h3 { font-size: 14px; font-weight: 600; }
  .muted { color: #6b645c; }
  .small { font-size: 10.5px; }
  footer {
    margin-top: 48px;
    border-top: 2px solid #1c1a17;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #6b645c;
    letter-spacing: 0.06em;
  }
</style>
</head>
<body>
  <header class="brand">
    <div class="logo">${esc(manufacturer.name)}</div>
    <div class="meta">
      Dijital Ürün Kimliği<br />
      ${esc(today)}
    </div>
  </header>

  <div class="title-block">
    <div class="category">${esc(categoryName ?? "Ürün")}</div>
    <h1>${esc(product.name)}</h1>
    <div class="code">${esc(product.code)} · ${esc(productUrl)}</div>
  </div>

  <div class="hero"><img src="${esc(product.heroImage)}" alt="${esc(product.name)}" /></div>

  ${product.summary ? `<p class="summary">${esc(product.summary)}</p>` : ""}

  <section>
    <h2><span class="tab-no">01 · Genel Bakış</span>Ürün Bilgileri</h2>
    <table>
      <tbody>
        <tr><td class="key">Ürün Kodu</td><td>${esc(product.code)}</td></tr>
        <tr><td class="key">Kategori</td><td>${esc(categoryName ?? "—")}</td></tr>
        <tr><td class="key">Üretici</td><td>${esc(manufacturer.name)}</td></tr>
        <tr><td class="key">Lokasyon</td><td>${esc(manufacturer.location ?? "—")}</td></tr>
        <tr><td class="key">Parça Sayısı</td><td>${items.length}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="page-break">
    <h2><span class="tab-no">02 · Parçalar</span>Bileşen Listesi</h2>
    ${partsSection || '<p class="muted">Parça eklenmemiş.</p>'}
  </section>

  <section class="page-break">
    <h2><span class="tab-no">03 · Teknik Özellikler</span>Ürün Spesifikasyonları</h2>
    ${specTable(product.specs) || '<p class="muted">Teknik özellik girilmemiş.</p>'}
  </section>

  <section class="page-break">
    <h2><span class="tab-no">04 · Belgeler</span>Dokümanlar</h2>
    ${docSection("Belgeler", product.documents)}
  </section>

  <section>
    <h2><span class="tab-no">05 · Sertifikalar</span>Sertifikalar &amp; Raporlar</h2>
    <h4>Parça Sertifikaları</h4>
    ${componentCerts.length > 0 ? docSection("Parça Sertifikaları", componentCerts) : '<p class="muted">Parça sertifikası eklenmemiş.</p>'}
    <h4>Firma Sertifikaları · ${esc(manufacturer.name)}</h4>
    ${docSection("Firma Sertifikaları", manufacturer.certifications)}
  </section>

  <footer>
    <span>${esc(manufacturer.name)}${manufacturer.location ? ` · ${esc(manufacturer.location)}` : ""}</span>
    <span>${esc(manufacturer.contactEmail ?? "")}${manufacturer.contactPhone ? ` · ${esc(manufacturer.contactPhone)}` : ""}</span>
  </footer>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.opener = null; // sever the reference without losing the handle
  win.document.open();
  win.document.write(html);
  win.document.close();
  const trigger = () => {
    win.focus();
    win.print();
  };
  // wait for images before printing
  const imgs = Array.from(win.document.images);
  if (imgs.length === 0) {
    trigger();
    return;
  }
  let pending = imgs.length;
  const done = () => {
    pending -= 1;
    if (pending <= 0) trigger();
  };
  imgs.forEach((img) => {
    if (img.complete) done();
    else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  });
  // safety fallback
  setTimeout(() => {
    if (pending > 0) {
      pending = 0;
      trigger();
    }
  }, 4000);
}
