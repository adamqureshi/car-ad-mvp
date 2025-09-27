import { put, list } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { Ad } from "./types";

const BUCKET_PREFIX = "ads/";

export async function saveAd(input: Omit<Ad, "id" | "createdAt">): Promise<Ad> {
  const id = nanoid(8); // short, shareable id
  const ad: Ad = { ...input, id, createdAt: new Date().toISOString() };

  await put(`${BUCKET_PREFIX}${id}.json`, JSON.stringify(ad), {
    contentType: "application/json",
  });

  return ad;
}

export async function loadAd(id: string): Promise<Ad | null> {
  // Find the JSON blob we saved for this id
  const { blobs } = await list({ prefix: `${BUCKET_PREFIX}${id}.json`, limit: 1 });
  const file = blobs[0];
  if (!file) return null;

  // file.url is a public, fetchable URL
  const res = await fetch(file.url);
  if (!res.ok) return null;
  return (await res.json()) as Ad;
}

