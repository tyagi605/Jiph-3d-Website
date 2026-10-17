"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { laminates, powderCoats, type Product } from "@/data/catalog";
import { useQuote } from "@/lib/quote-store";
import { useWebGL } from "@/lib/use-webgl";
import type { View } from "./three/views";

const ProductViewer = dynamic(() => import("./three/ProductViewer"), {
  ssr: false,
  loading: () => <div className="viewer-placeholder">Loading 3D model…</div>,
});

const VIEWS: { id: View; label: string }[] = [
  { id: "three-quarter", label: "3D" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
];

const mm = (d: [number, number, number]) => `${d[0]} × ${d[1]} × ${d[2]} mm`;

export default function ProductConfigurator({ product }: { product: Product }) {
  const tops = [...(product.topColours ?? []), ...laminates];
  const [sizeIdx, setSizeIdx] = useState(Math.min(1, product.sizes.length - 1));
  const [lam, setLam] = useState(tops[0]);
  const [coat, setCoat] = useState(powderCoats.find((c) => c.name === product.defaultFrame) ?? powderCoats[0]);
  const [view, setView] = useState<View>("three-quarter");
  const [showDims, setShowDims] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const [colour, setColour] = useState(product.colours?.[0]);
  const [qty, setQty] = useState(product.kind === "desk-bench" || product.kind === "lecture-row" ? 40 : 10);
  const [added, setAdded] = useState(false);
  const add = useQuote((s) => s.add);
  const webgl = useWebGL();

  const size = product.sizes[sizeIdx];
  const finishLabel = colour ? `${colour.name} (${colour.code})` : product.finishes ? `${lam.code} ${lam.name} / ${coat.name}` : "Standard";

  function addToQuote() {
    add({ slug: product.slug, range: product.range, name: product.name, sizeCode: colour?.code ?? size.code, sizeLabel: size.label, dims: size.dims, finish: finishLabel, qty });
    setAdded(true);
  }

  return (
    <div className="config">
      <figure className="viewer-wrap" ref={figure}>
        <div className="viewer" aria-label={`3D model of ${product.name}`}>
          {webgl === false ? (
            <div className="viewer-placeholder">3D preview needs WebGL. Sizes and finishes are listed alongside.</div>
          ) : webgl ? (
            <ProductViewer kind={product.kind} dims={size.dims} seats={size.seats} finish={{ wood: lam.hex, metal: coat.hex }} colour={colour?.hex} slug={product.slug} view={view} showDims={showDims} model={product.models?.[size.code]} />
          ) : (
            <div className="viewer-placeholder" />
          )}
          {webgl && (
            <div className="viewer-tools">
              <div className="seg" role="group" aria-label="Camera view">
                {VIEWS.map((v) => (
                  <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
                ))}
              </div>
              <button type="button" className="tool" aria-pressed={showDims} onClick={() => setShowDims((s) => !s)}>Dimensions</button>
              <button
                type="button"
                className="tool"
                aria-label="Full screen"
                onClick={() => {
                  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                  else figure.current?.requestFullscreen?.().catch(() => {});
                }}
              >⤢</button>
            </div>
          )}
        </div>
        <figcaption className="viewer-note">Drag to rotate, scroll or pinch to zoom. Built to catalogue dimensions; on-screen colours are approximate.</figcaption>
      </figure>

      <div className="config-panel">
        <p className="mono muted">Model {size.code}</p>
        <h1>{product.name}</h1>
        <p className="lead">{product.tagline}</p>
        {product.govtProject && <p className="badge">{product.govtProject}</p>}

        {product.sizes.length > 1 && (
          <fieldset className="opts">
            <legend>Size</legend>
            <div className="chips">
              {product.sizes.map((s, i) => (
                <button key={s.code} type="button" className={`chip ${i === sizeIdx ? "on" : ""}`} aria-pressed={i === sizeIdx} onClick={() => { setSizeIdx(i); setAdded(false); }}>
                  {s.label} <span className="mono">{s.code}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <p className="dims"><span className="muted">Overall (W × D × H)</span> <strong className="mono">{mm(size.dims)}</strong></p>

        {product.colours && (
          <fieldset className="opts">
            <legend>Colour <span className="muted">{colour?.name}</span></legend>
            <div className="swatches">
              {product.colours.map((c) => (
                <button key={c.code} type="button" className={`sw ${colour?.code === c.code ? "on" : ""}`} style={{ background: c.hex }} aria-label={`${c.name}, ${c.code}`} aria-pressed={colour?.code === c.code} onClick={() => { setColour(c); setAdded(false); }} />
              ))}
            </div>
          </fieldset>
        )}

        {product.finishes && (
          <>
            <fieldset className="opts">
              <legend>{product.topColours ? "Top & panels" : "Laminate"} <span className="muted">{lam.name}</span></legend>
              <div className="swatches">
                {tops.map((l) => (
                  <button key={l.code} type="button" className={`sw ${lam.code === l.code ? "on" : ""}`} style={{ background: l.hex }} aria-label={`${l.name} laminate`} aria-pressed={lam.code === l.code} onClick={() => { setLam(l); setAdded(false); }} />
                ))}
              </div>
            </fieldset>
            <fieldset className="opts">
              <legend>Frame <span className="muted">{coat.name}</span></legend>
              <div className="swatches">
                {powderCoats.map((c) => (
                  <button key={c.name} type="button" className={`sw ${coat.name === c.name ? "on" : ""}`} style={{ background: c.hex }} aria-label={`${c.name} powder coat`} aria-pressed={coat.name === c.name} onClick={() => { setCoat(c); setAdded(false); }} />
                ))}
              </div>
            </fieldset>
          </>
        )}

        <div className="add-row">
          <label className="qty">
            <span className="muted">Quantity</span>
            <input id="qty" type="number" min={1} max={100000} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </label>
          <button type="button" className="btn btn-primary" onClick={addToQuote}>Add to quote</button>
        </div>
        {added && (
          <p className="added" role="status">
            Added {qty} × {product.name} ({size.label}). <Link href="/quote">View quote list</Link>
          </p>
        )}
      </div>
    </div>
  );
}
