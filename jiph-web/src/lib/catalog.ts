import { products, ranges, type Product } from "@/data/catalog";

export function getRanges() {
  return ranges.map((r) => ({ ...r, count: products.filter((p) => p.range === r.slug).length }));
}

export function getRange(slug: string) {
  return ranges.find((r) => r.slug === slug);
}

export function getProducts(range?: string) {
  return range ? products.filter((p) => p.range === range) : products;
}

export function getProduct(range: string, slug: string) {
  return products.find((p) => p.range === range && p.slug === slug);
}

export function productUrl(p: Pick<Product, "range" | "slug">) {
  return `/furniture/${p.range}/${p.slug}`;
}

/** Matches names, any size code ("1103"), taglines and tags. */
export function searchProducts(q: string) {
  const t = q.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return products;
  const loose = t.replace(/[\s-]/g, "");
  return products.filter((p) => {
    const hay = [p.name, p.tagline, p.range, ...p.tags, ...p.sizes.map((s) => s.code)].join(" ").toLowerCase();
    return hay.includes(t) || hay.replace(/[\s-]/g, "").includes(loose);
  });
}
