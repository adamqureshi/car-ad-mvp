import { NextResponse } from "next/server";
const AC = process.env.TWILIO_ACCOUNT_SID!;
const TK = process.env.TWILIO_AUTH_TOKEN!;
const VSID = process.env.TWILIO_VERIFY_SID!;

export async function POST(req: Request) {
  try {
    const { phone }:{ phone?: string } = await req.json();
    if (!phone || !phone.startsWith("+")) {
      return NextResponse.json({ ok: false, error: "Provide E.164 phone (e.g. +15551234567)." }, { status: 400 });
    }
    const auth = Buffer.from(`${AC}:${TK}`).toString("base64");
    const body = new URLSearchParams({ To: phone, Channel: "sms" }).toString();
    const r = await fetch(`https://verify.twilio.com/v2/Services/${VSID}/Verifications`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ ok: false, error: data?.message || "Twilio error" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
