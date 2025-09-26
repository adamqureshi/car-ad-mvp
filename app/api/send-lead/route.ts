import { NextResponse } from "next/server";
import { decodePayload } from "@/lib/codec";

// TEMP: deploy-first version (safe if RESEND_API_KEY is missing)
export async function POST(req: Request) {
  try {
    const { payloadEncoded, name, phone, email, message } = await req.json();
    const payload = decodePayload(payloadEncoded);
    if (!payload) return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });

    const to: string[] = [];
    if (payload.sellerEmail) to.push(payload.sellerEmail);
    // ADMIN_EMAIL optional; ignored for now

    const title =
      [payload.year, payload.make, payload.model, payload.trim].filter(Boolean).join(" ") || "Vehicle";

    // If email isn't configured yet, just succeed (so the UI works for demo)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // You can log to server logs for debug/verification
      console.log("[Lead NOOP]", {
        to,
        title,
        vin: payload.vin,
        buyer: { name, phone, email, message },
      });
      return NextResponse.json({ ok: true, note: "Email disabled (no RESEND_API_KEY)" });
    }

    // ——— When you’re ready, replace the block below with the Resend send() code ———
    // const { Resend } = await import("resend");
    // const resend = new Resend(apiKey);
    // await resend.emails.send({
    //   from: "leads@YOUR-VERIFIED-DOMAIN",
    //   to: to.length ? to : ["you@yourdomain.com"],
    //   subject: `Lead: ${title}`,
    //   text: `Buyer: ${name || "(n/a)"}\nPhone: ${phone || "(n/a)"}\nEmail: ${email || "(n/a)"}\n\n${message || ""}`,
    // });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}

