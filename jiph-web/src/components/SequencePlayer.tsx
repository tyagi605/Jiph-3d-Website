"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Scroll-scrubbed image sequence (the technique behind "frame-sequence" sites):
 * pre-rendered frames from Twinmotion / D5 / Blender are drawn to a canvas as the
 * visitor scrolls, so the page looks exactly like the render.
 *
 * Frames live in /public/sequences/<name>/ with a manifest.json — see
 * public/sequences/README.md for the export spec.
 */

export type SequenceVariant = {
  /** printf-style pattern relative to the manifest, e.g. "desktop/frame_%04d.webp" */
  pattern: string;
  width: number;
  height: number;
  /** first frame number in the file names (usually 1) */
  start?: number;
};

export type SequenceManifest = {
  frames: number;
  desktop: SequenceVariant;
  /** optional portrait or lighter set for phones */
  mobile?: SequenceVariant;
};

const frameUrl = (base: string, v: SequenceVariant, i: number) =>
  base + v.pattern.replace(/%0(\d)d/, (_, n: string) => String(i + (v.start ?? 1)).padStart(Number(n), "0"));

/** Load order: first + last frame, then every 16th, 8th, 4th, 2nd, then the rest — the scrub works early and sharpens as it loads. */
function loadOrder(n: number) {
  const seen = new Set<number>();
  const order: number[] = [];
  const push = (i: number) => { if (i >= 0 && i < n && !seen.has(i)) { seen.add(i); order.push(i); } };
  push(0); push(n - 1);
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < n; i += step) push(i);
  return order;
}

/** Synthetic frames for ?sequence=test, so the player can be checked before real renders exist. */
function testFrame(i: number, n: number, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  const t = i / (n - 1);
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, `hsl(${215 + t * 30}, 45%, ${88 - t * 20}%)`);
  grad.addColorStop(1, `hsl(${30 + t * 10}, 60%, ${92 - t * 15}%)`);
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(29,29,31,.85)";
  g.font = `700 ${Math.round(h / 8)}px Inter, Arial, sans-serif`;
  g.textAlign = "center";
  g.fillText(`Frame ${i + 1} / ${n}`, w / 2, h / 2);
  g.fillStyle = "#D7000F";
  g.fillRect(w * 0.1, h * 0.7, w * 0.8 * t, 10);
  return c;
}

type Props = {
  progress: RefObject<number>;
  manifest: SequenceManifest;
  base: string;
  test?: boolean;
  /** called once the first frame is on screen */
  onReady?: () => void;
};

export default function SequencePlayer({ progress, manifest, base, test, onReady }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d", { alpha: false });
    if (!ctx) return;

    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const variant = (mobile && manifest.mobile) || manifest.desktop;
    const n = manifest.frames;
    const images: (CanvasImageSource | undefined)[] = new Array(n);
    let alive = true;
    let drawn = -1;
    let ready = false;
    let raf = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
      drawn = -1;
    };

    /** nearest loaded frame to i, so scrubbing never shows a blank */
    const nearest = (i: number) => {
      for (let d = 0; d < n; d++) {
        if (images[i - d]) return i - d;
        if (images[i + d]) return i + d;
      }
      return -1;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const want = Math.round((progress.current ?? 0) * (n - 1));
      const idx = nearest(Math.min(n - 1, Math.max(0, want)));
      if (idx < 0 || idx === drawn) return;
      const img = images[idx]!;
      // object-fit: cover
      const iw = variant.width, ih = variant.height;
      const s = Math.max(el.width / iw, el.height / ih);
      const dw = iw * s, dh = ih * s;
      ctx.drawImage(img, (el.width - dw) / 2, (el.height - dh) / 2, dw, dh);
      drawn = idx;
      if (!ready) { ready = true; onReady?.(); }
    };

    const load = async (i: number) => {
      if (test) { images[i] = testFrame(i, n, variant.width, variant.height); return; }
      try {
        const res = await fetch(frameUrl(base, variant, i));
        if (!res.ok) return;
        const bmp = await createImageBitmap(await res.blob());
        if (alive) images[i] = bmp; // draw() picks it up when it is the nearest frame
      } catch { /* a missing frame falls back to its neighbour */ }
    };

    // 6 parallel loaders working through the priority order
    const queue = loadOrder(n);
    const worker = async () => { while (alive && queue.length) await load(queue.shift()!); };

    size();
    window.addEventListener("resize", size);
    raf = requestAnimationFrame(draw);
    for (let k = 0; k < 6; k++) void worker();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      images.forEach((im) => { if (im && "close" in im) (im as ImageBitmap).close(); });
    };
  }, [manifest, base, test, progress, onReady]);

  return <canvas ref={canvas} className="sequence-canvas" />;
}
