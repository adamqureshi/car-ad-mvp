import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge"; // optional, but fast

export async function POST(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ ok: false, error: "NO_TOKEN" }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "NO_FILE" }, { status: 400 });
    }

    const key = `car-ads/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
      addRandomSuffix: true,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "UPLOAD_FAILED" }, { status: 500 });
  }
}
