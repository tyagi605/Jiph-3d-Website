"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { company } from "@/data/catalog";
import { useQuote } from "@/lib/quote-store";

const nav = [
  { href: "/furniture", label: "Furniture" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function QuoteCount() {
  const count = useQuote((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || count === 0) return null;
  return <span className="count" aria-label={`${count} items`}>{count}</span>;
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="logo" aria-label="JIPH Furniture home">
          <span className="logo-mark">JIPH</span>
          <span className="logo-sub">Built for institutions</span>
        </Link>
        <nav aria-label="Primary" className={open ? "open" : ""}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>
        <div className="bar-right">
          <a className="phone" href={`tel:${company.phones[0].replace(/\s/g, "")}`}>{company.phones[0]}</a>
          <Link href="/quote" className="btn btn-primary btn-sm">Quote list <QuoteCount /></Link>
          <button type="button" className="menu" aria-expanded={open} aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap fgrid">
        <div>
          <p className="logo-mark">JIPH</p>
          <p className="muted">{company.name}<br />{company.address}</p>
          <p>{company.phones.map((p) => <a key={p} href={`tel:${p.replace(/\s/g, "")}`}>{p}</a>).reduce<React.ReactNode[]>((a, el, i) => (i ? [...a, " · ", el] : [el]), [])}<br /><a href={`mailto:${company.email}`}>{company.email}</a></p>
        </div>
        <div>
          <h2>Furniture</h2>
          <ul>
            <li><Link href="/furniture/lecture-hall-seating">Lecture halls</Link></li>
            <li><Link href="/furniture/classroom-desks">Classrooms</Link></li>
            <li><Link href="/furniture/library">Libraries</Link></li>
            <li><Link href="/furniture/hostel">Hostels</Link></li>
            <li><Link href="/furniture/laboratory">Laboratories</Link></li>
          </ul>
        </div>
        <div>
          <h2>Company</h2>
          <ul>
            <li><Link href="/about">About JIPH</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/contact">Factory visit</Link></li>
            <li><Link href="/quote">Quote list</Link></li>
          </ul>
        </div>
        <div>
          <h2>Certified</h2>
          <ul>{company.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
      <div className="wrap fbase muted">
        <span>© 2026 {company.name}</span>
        <span>Manufacturing since {company.since}</span>
      </div>
    </footer>
  );
}

export function MobileBar() {
  return (
    <div className="mbar">
      <a className="btn btn-ghost" href={`tel:${company.phones[0].replace(/\s/g, "")}`}>Call</a>
      <a className="btn btn-ghost" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a>
      <Link className="btn btn-primary" href="/contact">Enquire</Link>
    </div>
  );
}
