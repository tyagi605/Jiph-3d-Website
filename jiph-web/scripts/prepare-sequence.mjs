#!/usr/bin/env node
/**
 * Turns a folder of rendered frames (PNG / JPG / WebP / TIFF from Twinmotion, D5, Lumion, Blender…)
 * into web-ready sequences for the scroll player:
 *
 *   public/sequences/<name>/desktop/frame_0001.webp …   (landscape, default 1600 px wide)
 *   public/sequences/<name>/mobile/frame_0001.webp  …   (portrait 4:5 centre crop, default 720 px wide)
 *   public/sequences/<name>/manifest.json
 *
 * Usage:
 *   node scripts/prepare-sequence.mjs "D:/renders/classroom" [--name classroom] [--desktop 1600]
 *        [--mobile 720] [--mobile-crop portrait|landscape] [--quality 72] [--every 1]
 *
 * --every 2 keeps every second frame (halves the download if the render has too many frames).
 */
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };

if (!input) {
  console.error('Usage: node scripts/prepare-sequence.mjs <folder-of-frames> [--name classroom] [--desktop 1600] [--mobile 720] [--mobile-crop portrait] [--quality 72] [--every 1]');
  process.exit(1);
}

const name = opt("name", "classroom");
const desktopW = Number(opt("desktop", 1600));
const mobileW = Number(opt("mobile", 720));
const mobileCrop = opt("mobile-crop", "portrait");
const quality = Number(opt("quality", 72));
const every = Math.max(1, Number(opt("every", 1)));

const out = path.join(process.cwd(), "public", "sequences", name);
const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]);
const natural = new Intl.Collator(undefined, { numeric: true }).compare;

const files = (await readdir(input))
  .filter((f) => exts.has(path.extname(f).toLowerCase()))
  .sort(natural)
  .filter((_, i) => i % every === 0);

if (files.length < 2) {
  console.error(`Found ${files.length} image(s) in ${input}. Export the animation as an image sequence first.`);
  process.exit(1);
}

const first = await sharp(path.join(input, files[0])).metadata();
const srcW = first.width, srcH = first.height;
const desktopH = Math.round((desktopW / srcW) * srcH);
const mobileH = mobileCrop === "portrait" ? Math.round(mobileW * 1.25) : Math.round((mobileW / srcW) * srcH);

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, "desktop"), { recursive: true });
await mkdir(path.join(out, "mobile"), { recursive: true });

console.log(`${files.length} frames · source ${srcW}×${srcH} → desktop ${desktopW}×${desktopH}, mobile ${mobileW}×${mobileH} (${mobileCrop})`);

const pad = (i) => String(i + 1).padStart(4, "0");
let done = 0;

async function convert(file, i) {
  const src = path.join(input, file);
  await sharp(src).resize(desktopW, desktopH, { fit: "cover" }).webp({ quality, effort: 5 }).toFile(path.join(out, "desktop", `frame_${pad(i)}.webp`));
  const m = sharp(src);
  if (mobileCrop === "portrait") {
    // centre 4:5 crop from the landscape render, then scale
    const cropW = Math.min(srcW, Math.round(srcH * 0.8));
    m.extract({ left: Math.round((srcW - cropW) / 2), top: 0, width: cropW, height: srcH });
  }
  await m.resize(mobileW, mobileH, { fit: "cover" }).webp({ quality: quality - 4, effort: 5 }).toFile(path.join(out, "mobile", `frame_${pad(i)}.webp`));
  done++;
  if (done % 10 === 0 || done === files.length) process.stdout.write(`\r  converted ${done}/${files.length}`);
}

const queue = files.map((f, i) => [f, i]);
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) { const [f, i] = queue.shift(); await convert(f, i); } }));

const manifest = {
  frames: files.length,
  desktop: { pattern: "desktop/frame_%04d.webp", width: desktopW, height: desktopH, start: 1 },
  mobile: { pattern: "mobile/frame_%04d.webp", width: mobileW, height: mobileH, start: 1 },
};
await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));

async function folderSize(dir) {
  let total = 0;
  for (const f of await readdir(dir)) total += (await stat(path.join(dir, f))).size;
  return (total / 1024 / 1024).toFixed(1);
}
console.log(`\n✓ public/sequences/${name}/  desktop ${await folderSize(path.join(out, "desktop"))} MB · mobile ${await folderSize(path.join(out, "mobile"))} MB`);
console.log("  Rebuild or restart the site; the home page picks the frames up automatically.");
