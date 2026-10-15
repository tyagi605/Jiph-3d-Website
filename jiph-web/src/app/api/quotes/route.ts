import { quoteSchema, rateLimited, saveLead } from "@/lib/leads";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) return Response.json({ error: "Too many requests. Please call us instead." }, { status: 429 });

  const parsed = quoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  if (parsed.data.website) return Response.json({ id: "ok" });

  const { id } = await saveLead("quote", parsed.data);
  return Response.json({ id }, { status: 201 });
}
