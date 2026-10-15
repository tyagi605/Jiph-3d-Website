import "server-only";
import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const phone = z.string().trim().regex(/^[+\d][\d\s-]{7,16}$/, "Enter a valid phone number");

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  role: z.string().trim().max(60).optional().default(""),
  institution: z.string().trim().min(2, "Enter your institution").max(120),
  phone,
  email: z.string().trim().email("Enter a valid email").max(120),
  city: z.string().trim().max(60).optional().default(""),
  projectType: z.enum(["School", "College / University", "Hostel", "Office", "Government / Tender", "Other"]),
  timeline: z.enum(["Within 1 month", "1–3 months", "3–6 months", "Just exploring"]),
  message: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true, { message: "Please agree so we can contact you" }),
  source: z.string().max(200).optional().default(""),
  // honeypot: real people never fill this hidden field
  website: z.string().max(0).optional().default(""),
});

export const quoteSchema = enquirySchema.extend({
  items: z
    .array(
      z.object({
        slug: z.string().max(60),
        name: z.string().max(80),
        sizeCode: z.string().max(20),
        sizeLabel: z.string().max(60),
        finish: z.string().max(120),
        qty: z.number().int().min(1).max(100000),
      }),
    )
    .min(1, "Your quote list is empty")
    .max(100),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type QuoteRequest = z.infer<typeof quoteSchema>;

// Vercel's filesystem is read-only except /tmp, which is wiped between invocations:
// fine for a demo, but production needs PostgreSQL (or Zoho as the system of record).
const DATA_DIR = process.env.LEADS_DIR || (process.env.VERCEL ? "/tmp/jiph-leads" : path.join(process.cwd(), ".data"));

/**
 * Store first so a lead is never lost, then hand off to Zoho.
 * Local JSONL is the development store; production points this at PostgreSQL.
 */
export async function saveLead(kind: "enquiry" | "quote", data: Enquiry | QuoteRequest) {
  const id = `${kind === "quote" ? "Q" : "E"}-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
  const { website: _hp, ...clean } = data;
  const record = { id, kind, createdAt: new Date().toISOString(), ...clean };
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(path.join(DATA_DIR, "leads.jsonl"), JSON.stringify(record) + "\n", "utf8");
  const zoho = await pushToZoho(record).catch((e: unknown) => ({ ok: false as const, error: String(e) }));
  return { id, zoho };
}

/**
 * Creates a Lead in Zoho CRM when ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and
 * ZOHO_REFRESH_TOKEN are set (server-side OAuth, scope ZohoCRM.modules.leads.CREATE).
 * ZOHO_ACCOUNTS_URL / ZOHO_API_URL default to the India data centre.
 */
async function pushToZoho(record: { id: string; kind: string } & Omit<Enquiry, "website"> & Partial<Pick<QuoteRequest, "items">>) {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) return { ok: false as const, skipped: "Zoho not configured" };
  const accounts = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.in";
  const api = process.env.ZOHO_API_URL ?? "https://www.zohoapis.in";

  const tokenRes = await fetch(`${accounts}/oauth/v2/token`, {
    method: "POST",
    body: new URLSearchParams({ grant_type: "refresh_token", client_id: ZOHO_CLIENT_ID, client_secret: ZOHO_CLIENT_SECRET, refresh_token: ZOHO_REFRESH_TOKEN }),
  });
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Zoho token refresh failed");

  const [first, ...rest] = record.name.split(" ");
  const items = record.items?.map((i) => `${i.qty} × ${i.name} ${i.sizeLabel} (${i.sizeCode}) — ${i.finish}`).join("\n") ?? "";
  const res = await fetch(`${api}/crm/v6/Leads`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        First_Name: rest.length ? first : "",
        Last_Name: rest.length ? rest.join(" ") : first,
        Company: record.institution,
        Designation: record.role,
        Email: record.email,
        Phone: record.phone,
        City: record.city,
        Lead_Source: "Website",
        Description: [`Ref ${record.id} (${record.kind})`, `Project: ${record.projectType}`, `Timeline: ${record.timeline}`, record.message, items].filter(Boolean).join("\n\n"),
      }],
    }),
  });
  if (!res.ok) throw new Error(`Zoho ${res.status}`);
  return { ok: true as const };
}

/** Very small in-memory rate limit per IP (per server instance). */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, limit = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > limit;
}
