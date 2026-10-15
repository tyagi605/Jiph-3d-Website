import type { Metadata } from "next";
import Link from "next/link";
import { company, stats } from "@/data/catalog";

export const metadata: Metadata = {
  title: "About JIPH",
  description: "JIPH Furniture has made institutional furniture in Haryana since 1996, with a 1.5 lakh sq ft facility, ISO certifications and installation across India.",
};

const machines = [
  "Biesse Rover Gold CNC router",
  "Biesse JADE automatic edgebanders",
  "Altendorf panel saw and beam saw",
  "Fiber laser cutting",
  "Automatic sheet and pipe bending",
  "Automatic powder-coating plant",
  "MIG welding and power presses",
  "Automatic post-forming machine",
];

export default function AboutPage() {
  return (
    <div className="wrap page">
      <p className="eyebrow">About</p>
      <h1>Furniture that institutions can be proud of.</h1>
      <p className="lead">JIPH started in {company.since} as a small manufacturing unit. Today we serve schools, colleges, universities, corporates and government organisations across India from our own factory on NH-1 in Gharaunda, Haryana.</p>

      <dl className="stats">
        {stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
      </dl>

      <div className="detail">
        <section>
          <h2>Infrastructure</h2>
          <p>Steel and wood are processed under one roof, so we control quality from raw sheet to finished desk.</p>
          <ul className="ticks">{machines.map((m) => <li key={m}>{m}</li>)}</ul>
        </section>
        <section>
          <h2>Certifications</h2>
          <ul className="ticks">{company.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
          <h2>Visit the factory</h2>
          <p>See samples, meet the production team and leave with a layout for your campus.</p>
          <Link className="btn btn-primary" href="/contact">Book a visit</Link>
        </section>
      </div>
    </div>
  );
}
