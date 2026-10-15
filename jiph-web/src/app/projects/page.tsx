import type { Metadata } from "next";
import Link from "next/link";
import { products, projects } from "@/data/catalog";
import { productUrl } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Projects",
  description: "Universities, medical colleges, schools and government projects furnished by JIPH, including LPU, Chandigarh University, IIM Rohtak and PGIMER.",
};

export default function ProjectsPage() {
  return (
    <div className="wrap page">
      <p className="eyebrow">Projects</p>
      <h1>Campuses we’ve furnished.</h1>
      <p className="lead">A selection of the 15,000+ institutions and organisations that have chosen JIPH.</p>
      <ul className="project-list">
        {projects.map((pr) => (
          <li key={pr.name}>
            <h2>{pr.name}</h2>
            <span className="mono muted">{pr.type}</span>
            {pr.products && (
              <span className="small">
                {pr.products.map((slug) => {
                  const p = products.find((x) => x.slug === slug);
                  return p ? <Link key={slug} href={productUrl(p)}>{p.name} →</Link> : null;
                })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
