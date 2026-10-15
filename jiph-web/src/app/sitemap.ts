import type { MetadataRoute } from "next";
import { products, ranges } from "@/data/catalog";

const base = "https://www.jiph.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/furniture", "/projects", "/about", "/contact"].map((p) => ({ url: `${base}${p}` })),
    ...ranges.map((r) => ({ url: `${base}/furniture/${r.slug}` })),
    ...products.map((p) => ({ url: `${base}/furniture/${p.range}/${p.slug}` })),
  ];
}
