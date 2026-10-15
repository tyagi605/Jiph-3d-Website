import { products } from "@/data/catalog";

/** Full product list for search and integrations. Filtering happens client-side. */
export async function GET() {
  return Response.json(products);
}
