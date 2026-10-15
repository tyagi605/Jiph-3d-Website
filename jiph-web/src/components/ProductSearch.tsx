"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { productUrl, searchProducts } from "@/lib/catalog";

export default function ProductSearch() {
  const [q, setQ] = useState("");
  const active = q.trim().length >= 2;
  const results = useMemo(() => (active ? searchProducts(q) : []), [q, active]);

  return (
    <div className="search">
      <label htmlFor="product-search" className="sr-only">Search furniture</label>
      <input id="product-search" type="search" placeholder="Try “Scholar 90”, “1103”, “bunk” or “lab”" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      {active && (
        <div className="search-results" role="region" aria-live="polite">
          {results.length === 0 ? (
            <p className="muted">No models match “{q}”. Try a code from the catalogue, or <Link href="/contact">ask us</Link>.</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.slug}>
                  <Link href={productUrl(p)}>
                    <strong>{p.name}</strong> <span className="mono muted">{p.sizes.map((s) => s.code).join(" · ")}</span>
                    <span className="muted"> — {p.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
