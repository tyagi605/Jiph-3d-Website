import type { Metadata } from "next";
import Link from "next/link";
import ProductSearch from "@/components/ProductSearch";
import { getRanges } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Institutional furniture",
  description: "Lecture hall seating, classroom desks, kids, library, hostel, cafeteria, laboratory and auditorium furniture by JIPH. Search by model name or code.",
};

export default function FurniturePage() {
  return (
    <div className="wrap page">
      <p className="eyebrow">Furniture</p>
      <h1>Everything a campus needs.</h1>
      <p className="lead">Search by model name or catalogue code, or browse by space.</p>
      <ProductSearch />
      <h2 className="sub">Browse by space</h2>
      <div className="range-grid">
        {getRanges().map((r) => (
          <Link key={r.slug} href={`/furniture/${r.slug}`} className="range-card">
            <span className="mono muted">{r.building}</span>
            <h3>{r.name}</h3>
            <p>{r.summary}</p>
            <span className="more">{r.count} model{r.count === 1 ? "" : "s"} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
