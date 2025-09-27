import { put, get } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { Ad } from "./types";

const BUCKET_PREFIX = "ads/";

export async function saveAd(input: Omit<Ad, "id" | "createdAt">): Promise<Ad> {
  const id = nanoid(8); // short shareable id like "a1B2c3D4"
  const ad: Ad = { ...input, id, createdAt: new Date().toISOString() };

  await put(`${BUCKET_PREFIX}${id}.json`, JSON.stringify(ad), {
    contentType: "application/json",
  });

  return ad;
}

export async function loadAd(id: string): Promise<Ad | null> {
  try {
    const res = await get(`${BUCKET_PREFIX}${id}.json`);
    const text = await res.body!.text();
    return JSON.parse(text) as Ad;
  } catch {
    return null;
  }
}
