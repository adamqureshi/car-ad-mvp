import { put, list } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { Ad } from "./types";

const BUCKET_PREFIX = "ads/";

export async function saveAd(input: Omit<Ad, "id" | "createdAt">): Promise<Ad> {
  const id = nanoid(8); // short, shareable id
  const ad: Ad = { ...input, id, createdAt: new Date().toISOString() };

  await put(`${BUCKET_PREFIX}${id}.json`, JSON.stringify(ad), {
    access: "public",                    // ← REQUIRED by @vercel/blob
    contentType: "application/json",
  });

  return ad;
}

export async function loadAd(id: string): Promise<Ad | null> {
  const { blobs } = await list({ prefix: `${BUCKET_PREFIX}${id}.json`, limit: 1 });
  const file = blobs[0];
  if (!file) return null;

  // file.url is fetchable only if access: "public"
  const res = await fetch(file.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as Ad;
}


