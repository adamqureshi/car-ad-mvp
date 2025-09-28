// app/api/ads/[id]/route.ts
import { list } from "@vercel/blob";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id.trim();
  const exactKey = `ads/${id}.json`;

  // Try exact filename first
  const exact = await findExactBlob(exactKey);
  // Fallback: handle files saved with random suffix (ads/<id>-RANDOM.json)
  const hit = exact ?? (await findByPrefix(`ads/${id}`));

  if (!hit) {
    return new Response(JSON.stringify({ error: "Ad not found", id }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const r = await fetch(hit.url, { cache: "no-store" });
  if (!r.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch blob" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const json = await r.text();
  return new Response(json, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

async function findExactBlob(pathname: string) {
  const { blobs } = await list({ prefix: "ads/", limit: 20 });
  return blobs.find((b) => b.pathname === pathname) ?? null;
}

async function findByPrefix(prefix: string) {
  const { blobs } = await list({ prefix, limit: 1 });
  return blobs[0] ?? null;
}
