# JIPH website (phase 1)

Next.js 16 site for JIPH Furniture: a scroll-built 3D classroom on the home page, a product catalogue with live 3D models, a quote basket, and an enquiry API that stores leads and pushes them to Zoho CRM.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # production
```

Copy `.env.example` to `.env.local` and fill the Zoho values to send leads to Zoho CRM. Without them, leads are only stored locally in `.data/leads.jsonl`.

## Photoreal classroom (rendered frames)

The home-page classroom plays a rendered image sequence when `public/sequences/classroom/manifest.json` exists, and falls back to the live WebGL scene otherwise. Render spec and timing for the 3D artist: [docs/RENDER-BRIEF.md](docs/RENDER-BRIEF.md). Convert renders with:

```bash
npm run sequence -- "D:/renders/classroom"
```

Test switches: `/?sequence=test` (generated frames), `/?sequence=off` (live scene), `/?quality=lite|high`.

## Structure

| Path | What it is |
|---|---|
| `src/data/catalog.ts` | Products, ranges, finishes, projects, transcribed from the catalogue. Stand-in for the CMS. Ambiguous values are listed at the top of the file. |
| `src/lib/catalog.ts` | The only data access layer pages use. Swap its internals for Payload/PostgreSQL later. |
| `src/components/SequencePlayer.tsx` | Scroll-scrubbed frame player: priority loading, nearest-frame fallback, desktop and phone sets. |
| `scripts/prepare-sequence.mjs` | Converts a folder of renders into WebP sets and a manifest. |
| `src/components/ClassroomBuild.tsx` | Scroll-pinned home section: HTML overlay, seat counter, reduced-motion fallback. |
| `src/components/three/ClassroomScene.tsx` | The 3D room that assembles on scroll (floor → walls → board → 12 desks → teacher table → camera pull-back). |
| `src/components/three/Furniture.tsx` | Procedural models for each product kind, sized from catalogue dimensions. Replace with glTF from factory CAD. |
| `src/components/ProductConfigurator.tsx` | Product page: 3D viewer, size, laminate and frame pickers, add to quote. |
| `src/lib/quote-store.ts` | Quote basket (Zustand, saved in the browser). |
| `src/lib/leads.ts` | Zod validation, lead storage, Zoho CRM push, rate limit, honeypot. |
| `src/app/api/enquiries`, `src/app/api/quotes` | `POST` endpoints for the contact form and quote basket. |
| `src/app/api/products` | `GET` product list as JSON. |

## Pages

`/` · `/furniture` · `/furniture/[range]` · `/furniture/[range]/[model]` · `/projects` · `/about` · `/contact` · `/quote` · `/sitemap.xml` · `/robots.txt`

All catalogue pages are pre-rendered at build time. Each product page has Product structured data.

## Before launch

- Confirm the values flagged at the top of `src/data/catalog.ts` with JIPH.
- Add the remaining ~370 catalogue models (same shape as the existing entries).
- Replace procedural models with glTF exports for the ~20 hero products, and add studio photos.
- Move lead storage from `.data/leads.jsonl` to PostgreSQL. The local file does not persist on serverless hosts such as Vercel.
- Add WhatsApp Business notifications and a quote PDF (phase 2 in the build plan).
- Set up 301 redirects from the old jiph.in URLs.
