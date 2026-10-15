import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductConfigurator from "@/components/ProductConfigurator";
import { products } from "@/data/catalog";
import { getProduct, getProducts, getRange, productUrl } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ range: p.range, model: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/furniture/[range]/[model]">): Promise<Metadata> {
  const { range, model } = await params;
  const p = getProduct(range, model);
  if (!p) return {};
  return { title: `${p.name} ${getRange(range)?.name ?? ""} (${p.code})`, description: `${p.tagline}. ${p.description}` };
}

export default async function ProductPage({ params }: PageProps<"/furniture/[range]/[model]">) {
  const { range, model } = await params;
  const p = getProduct(range, model);
  const r = getRange(range);
  if (!p || !r) notFound();
  const related = getProducts(range).filter((x) => x.slug !== p.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.code,
    description: p.description,
    category: r.name,
    brand: { "@type": "Brand", name: "JIPH" },
    manufacturer: { "@type": "Organization", name: "JIPH Furniture Pvt. Ltd." },
  };

  return (
    <div className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/furniture">Furniture</Link> / <Link href={`/furniture/${r.slug}`}>{r.name}</Link> / <span>{p.name}</span>
      </nav>

      <ProductConfigurator product={p} />

      <div className="detail">
        <section>
          <h2>About {p.name}</h2>
          <p>{p.description}</p>
          <h3>Features</h3>
          <ul className="ticks">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>
        <section>
          <h2>Sizes</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Type</th><th>W × D × H (mm)</th></tr></thead>
              <tbody>
                {p.sizes.map((s) => (
                  <tr key={s.code}><td className="mono">{s.code}</td><td>{s.label}</td><td className="mono">{s.dims.join(" × ")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">Manufacturing tolerance ±5 mm. Custom sizes on request for project orders.</p>
        </section>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2>More {r.name.toLowerCase()}</h2>
          <div className="range-grid">
            {related.map((x) => (
              <Link key={x.slug} href={productUrl(x)} className="range-card">
                <span className="mono muted">{x.code}</span>
                <h3>{x.name}</h3>
                <p>{x.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
