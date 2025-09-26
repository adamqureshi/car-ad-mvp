import { NextResponse } from "next/server";
import { decodePayload } from "@/lib/codec";

// TEMP: deploy-first version (no email required; never fails build)
export async function POST(req: Request) {
  try {
    const { payloadEncoded, name, phone, email, message } = await req.json();
    const payload = decodePayload(payloadEncoded);
    if (!payload) return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });

    // For now, just log to server and return ok.
    console.log("[Lead NOOP]", {
      to: [payload.sellerEmail].filter(Boolean),
      car: [payload.year, payload.make, payload.model, payload.trim].filter(Boolean).join(" ") || "Vehicle",
      vin: payload.vin,
      buyer: { name, phone, email, message },
    });

    return NextResponse.json({ ok: true, note: "Email disabled (no RESEND_API_KEY)" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}


