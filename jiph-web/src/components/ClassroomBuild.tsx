"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useWebGL } from "@/lib/use-webgl";
import { DESKS, TL } from "./three/timeline";

const ClassroomScene = dynamic(() => import("./three/ClassroomScene"), { ssr: false });

const STEPS = [
  { until: 0.14, eyebrow: "Build a classroom", title: "Start with an empty room.", body: "9 m × 8 m, a typical secondary-school classroom. Scroll to furnish it with JIPH products." },
  { until: 0.27, eyebrow: "The space", title: "Walls, windows, a greenboard.", body: "Every JIPH project starts with a site visit and a layout drawn to your room." },
  { until: 0.66, eyebrow: "Scholar 90 · 1103", title: "Twelve desks. Twenty-four seats.", body: "Our most trusted classroom desk: steel frame, wooden seat and backrest, book shelf under the top.", sku: "2 Seater · 1066 × 930 × 750 mm" },
  { until: 0.8, eyebrow: "Mentor-1 · 1301", title: "A table for the teacher.", body: "Spacious top at an ergonomic 750 mm height, sized for books and a laptop.", sku: "1200 × 600 × 750 mm" },
  { until: 1.01, eyebrow: "Ready", title: "Ready for the first bell.", body: "Now multiply it by every room on your campus. We make it in our own 1.5 lakh sq ft facility and install it across India.", cta: true },
];

export default function ClassroomBuild() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const [seats, setSeats] = useState(0);
  const webgl = useWebGL();
  const reduce = useReducedMotion();
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setLowPower(window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4);
  }, []);

  useEffect(() => {
    if (reduce) {
      progress.current = 0.86;
      setStep(STEPS.length - 1);
      setSeats(DESKS.length * 2);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      progress.current = p;
      setStep(STEPS.findIndex((s) => p < s.until));
      const landed = DESKS.filter((_, i) => p >= TL.deskStart + i * TL.deskStep + TL.deskDur * 0.6).length;
      setSeats(landed * 2);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [reduce]);

  const s = STEPS[Math.max(0, step)];

  return (
    <section ref={section} className={`build ${reduce ? "still" : ""}`} aria-label="Build a classroom with JIPH furniture">
      <div className="build-stage">
        <div className="build-canvas" aria-hidden="true">
          {webgl ? <ClassroomScene progress={progress} lowPower={lowPower} /> : <div className="build-fallback" />}
        </div>

        <div className="build-copy" key={step}>
          <p className="eyebrow">{s.eyebrow}</p>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
          {s.sku && <p className="mono sku">{s.sku}</p>}
          {s.cta && (
            <div className="cta-row">
              <Link className="btn btn-primary" href="/furniture">Furnish your campus</Link>
              <Link className="btn btn-ghost" href="/furniture/classroom-desks/scholar-90">See Scholar 90</Link>
            </div>
          )}
        </div>

        <div className="build-meter" aria-live="polite">
          <span className="mono">Seats installed</span>
          <strong>{seats}</strong>
          <span className="mono muted">/ {DESKS.length * 2}</span>
        </div>
        {!reduce && step === 0 && <p className="build-hint mono">Scroll ↓</p>}
      </div>

      {/* Same story as plain text for search engines and screen readers */}
      <ol className="sr-only">
        {STEPS.map((x) => <li key={x.title}>{x.title} {x.body}</li>)}
      </ol>
    </section>
  );
}
