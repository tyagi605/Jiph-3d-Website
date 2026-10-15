"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuote } from "@/lib/quote-store";

export default function QuoteList() {
  const { items, setQty, remove } = useQuote();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="quote-list" />;
  if (items.length === 0) {
    return (
      <div className="quote-list empty">
        <p>Your quote list is empty.</p>
        <p className="muted">Open any product, choose a size and finish, and select <strong>Add to quote</strong>.</p>
        <Link className="btn btn-ghost" href="/furniture">Browse furniture</Link>
      </div>
    );
  }

  const units = items.reduce((n, i) => n + i.qty, 0);
  return (
    <div className="quote-list">
      <ul>
        {items.map((i) => (
          <li key={i.key}>
            <div>
              <Link href={`/furniture/${i.range}/${i.slug}`}><strong>{i.name}</strong></Link>
              <p className="muted small"><span className="mono">{i.sizeCode}</span> · {i.sizeLabel} · {i.dims.join(" × ")} mm</p>
              <p className="muted small">{i.finish}</p>
            </div>
            <label className="qty">
              <span className="sr-only">Quantity of {i.name}</span>
              <input id={`qty-${i.key}`} type="number" min={1} value={i.qty} onChange={(e) => setQty(i.key, Number(e.target.value) || 1)} />
            </label>
            <button type="button" className="link-btn" onClick={() => remove(i.key)}>Remove</button>
          </li>
        ))}
      </ul>
      <p className="total"><span className="muted">Total units</span> <strong>{units.toLocaleString("en-IN")}</strong></p>
    </div>
  );
}
