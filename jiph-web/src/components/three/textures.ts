"use client";

import * as THREE from "three";

/**
 * Procedural surface textures (no downloads). Each is generated once and shared.
 * They add the micro-variation that stops flat colours reading as a drawing.
 */

const cache = new Map<string, THREE.Texture>();

function make(key: string, size: number, paint: (g: CanvasRenderingContext2D, s: number) => void, opts: { srgb?: boolean; repeat?: [number, number] } = {}) {
  const k = `${key}:${opts.repeat?.join("x") ?? ""}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  paint(c.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (opts.repeat) t.repeat.set(...opts.repeat);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(k, t);
  return t;
}

/** Seeded PRNG so textures look the same on every load. */
function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

/** Near-white painted plaster: soft mottling, multiplied with the wall colour. */
export function plaster(repeat: [number, number] = [3, 1]) {
  return make("plaster", 512, (g, s) => {
    const r = rng(7);
    g.fillStyle = "#f4f4f4";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const v = 228 + r() * 27;
      g.fillStyle = `rgba(${v},${v},${v},0.18)`;
      const x = r() * s, y = r() * s, rad = 2 + r() * 14;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
  }, { repeat });
}

/** Laminate wood grain, multiplied with the chosen laminate shade. */
export function woodGrain(repeat: [number, number] = [1, 1]) {
  return make("wood", 1024, (g, s) => {
    const r = rng(11);
    g.fillStyle = "#e9e2d8";
    g.fillRect(0, 0, s, s);
    // long grain lines with gentle waves
    for (let i = 0; i < 220; i++) {
      const y0 = r() * s;
      const amp = 2 + r() * 8;
      const freq = 0.004 + r() * 0.01;
      const dark = r() < 0.25;
      g.strokeStyle = dark ? `rgba(80,55,35,${0.12 + r() * 0.12})` : `rgba(255,250,240,${0.1 + r() * 0.15})`;
      g.lineWidth = dark ? 1 + r() * 2.5 : 0.6 + r() * 1.5;
      g.beginPath();
      for (let x = 0; x <= s; x += 8) {
        const y = y0 + Math.sin(x * freq + i) * amp;
        if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    // a couple of cathedral arches
    for (let k = 0; k < 3; k++) {
      const cx = r() * s, cy = r() * s;
      for (let j = 0; j < 7; j++) {
        g.strokeStyle = `rgba(90,60,38,0.08)`;
        g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(cx, cy, 160 + j * 18, 26 + j * 6, 0, 0, Math.PI * 2); g.stroke();
      }
    }
  }, { repeat });
}

/** Woven fabric for blinds and upholstery. */
export function fabric(repeat: [number, number] = [6, 6]) {
  return make("fabric", 256, (g, s) => {
    const r = rng(3);
    g.fillStyle = "#e6e6e6";
    g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.15})`;
      g.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 2) {
      g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`;
      g.fillRect(x, 0, 1, s);
    }
  }, { repeat });
}

/** Fine speckle used as a roughness map on powder coat, so highlights break up like real paint. */
export function speckle(repeat: [number, number] = [4, 4]) {
  return make("speckle", 256, (g, s) => {
    const r = rng(5);
    const img = g.createImageData(s, s);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 150 + r() * 90;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, { srgb: false, repeat });
}
