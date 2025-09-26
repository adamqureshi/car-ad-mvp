import { Resend } from "resend";
import { NextResponse } from "next/server";
import { decodePayload } from "@/lib/codec";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { payloadEncoded, name, phone, email, message } = await req.json();
    const payload = decodePayload(payloadEncoded);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });
    }

    const to: string[] = [];
    if (payload.sellerEmail) to.push(payload.sellerEmail);
    if (process.env.ADMIN_EMAIL) to.push(process.env.ADMIN_EMAIL);
    if (to.length === 0) {
      return NextResponse.json({ ok: false, error: "No recipient" }, { status: 400 });
    }

    const title = [payload.year, payload.make, payload.model, payload.trim].filter(Boolean).join(" ") || "Vehicle";

    const text = `New lead on your car:\n\n` +
      `Car: ${title}\nVIN: ${payload.vin}\nPrice: ${payload.price || "(n/a)"}\n\n` +
      `Buyer name: ${name || "(n/a)"}\nBuyer phone: ${phone || "(n/a)"}\nBuyer email: ${email || "(n/a)"}\n\n` +
      `Message:\n${message || "(none)"}\n\n` +
      `Contact buyer directly to respond.\n`;

    await resend.emails.send({
      from: "leads@car-ad-mvp.dev", // change to your verified Resend domain
      to,
      subject: `Lead: ${title}`,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}