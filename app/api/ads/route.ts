import { NextResponse } from "next/server";
import { saveAd } from "@/lib/store";
import type { Ad } from "@/lib/types";

// POST /api/ads -> { id }
export async function POST(req: Request) {
  const input = (await req.json()) as Omit<Ad, "id" | "createdAt">;
  if (!input?.vin) return NextResponse.json({ error: "VIN required" }, { status: 400 });
  if (!Array.isArray(input.photos)) input.photos = [];
  const ad = await saveAd(input);
  return NextResponse.json({ id: ad.id }, { status: 201 });
}

