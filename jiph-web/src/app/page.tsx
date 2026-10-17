import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ClassroomBuild from "@/components/ClassroomBuild";
import type { SequenceManifest } from "@/components/SequencePlayer";
import { company, projects, stats } from "@/data/catalog";
import { getRanges } from "@/lib/catalog";

/** Read at build time: rendered classroom frames are used when public/sequences/classroom exists. */
async function classroomSequence(): Promise<SequenceManifest | null> {
  "use cache";
  try {
    const raw = await readFile(path.join(process.cwd(), "public", "sequences", "classroom", "manifest.json"), "utf8");
    const m = JSON.parse(raw) as SequenceManifest;
    return m.frames > 1 && m.desktop?.pattern ? m : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const sequence = await classroomSequence();
  const ranges = getRanges();
  return (
    <>
      <section className="hero wrap">
        <p className="eyebrow">Institutional furniture · since {company.since}</p>
        <h1>Furniture built for institutions.</h1>
        <p className="lead">Lecture halls, classrooms, libraries, labs and hostels, designed, made in our Haryana factory and installed by our own teams for schools, colleges and universities across India.</p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/contact">Plan your project</Link>
          <Link className="btn btn-ghost" href="/furniture">Browse furniture</Link>
        </div>
      </section>

      <ClassroomBuild sequence={sequence} />

      <section className="wrap band" aria-labelledby="clients-h">
        <h2 id="clients-h" className="eyebrow center">Trusted by leading institutions</h2>
        <ul className="logos">
          {projects.slice(0, 8).map((p) => <li key={p.name}>{p.name}</li>)}
        </ul>
      </section>

      <section className="wrap section" aria-labelledby="scale-h">
        <p className="eyebrow">Scale</p>
        <h2 id="scale-h">Made in our own factory. Installed across India.</h2>
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
          ))}
        </dl>
      </section>

      <section className="section tint" aria-labelledby="campus-h">
        <div className="wrap">
          <p className="eyebrow">Every building on campus</p>
          <h2 id="campus-h">Choose a space to furnish.</h2>
          <div className="range-grid">
            {ranges.map((r) => (
              <Link key={r.slug} href={`/furniture/${r.slug}`} className="range-card">
                <span className="mono muted">{r.building}</span>
                <h3>{r.name}</h3>
                <p>{r.summary}</p>
                <span className="more">{r.count} model{r.count === 1 ? "" : "s"} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="process-h">
        <p className="eyebrow">How we work</p>
        <h2 id="process-h">One team, from drawing to delivery.</h2>
        <ol className="steps">
          {[
            ["Consult", "Site visit and requirement mapping."],
            ["Design", "Layouts and samples for approval."],
            ["Manufacture", "In our Gharaunda facility on NH-1."],
            ["Deliver", "Scheduled to your session start."],
            ["Install", "By our own crews, on site."],
            ["Support", "After-sales service across India."],
          ].map(([t, d], i) => (
            <li key={t}><span className="mono">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="section tint cta-band" aria-labelledby="cta-h">
        <div className="wrap">
          <h2 id="cta-h">Planning a new campus or block?</h2>
          <p className="lead">Send us your floor plan and student numbers. We’ll come back with a layout, samples and a quote.</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact">Start an enquiry</Link>
            <a className="btn btn-ghost" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </div>
      </section>
    </>
  );
}
