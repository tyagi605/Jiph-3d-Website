import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getRange, getRanges, productUrl } from "@/lib/catalog";

export function generateStaticParams() {
  return getRanges().map((r) => ({ range: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/furniture/[range]">): Promise<Metadata> {
  const r = getRange((await params).range);
  return r ? { title: r.name, description: r.summary } : {};
}

export default async function RangePage({ params }: PageProps<"/furniture/[range]">) {
  const { range } = await params;
  const r = getRange(range);
  if (!r) notFound();
  const items = getProducts(range);

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/furniture">Furniture</Link> / <span>{r.name}</span></nav>
      <p className="eyebrow">{r.building}</p>
      <h1>{r.name}</h1>
      <p className="lead">{r.summary}</p>
      <ul className="product-list">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={productUrl(p)} className="product-row">
              <div>
                <h2>{p.name}</h2>
                <p>{p.tagline}</p>
                {p.govtProject && <span className="badge">{p.govtProject}</span>}
              </div>
              <div className="sizes">
                {p.sizes.map((s) => (
                  <span key={s.code}><span className="mono">{s.code}</span> {s.label}</span>
                ))}
              </div>
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
