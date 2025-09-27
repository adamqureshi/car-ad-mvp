import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";

const AC   = process.env.TWILIO_ACCOUNT_SID!;
const TK   = process.env.TWILIO_AUTH_TOKEN!;
const VSID = process.env.TWILIO_VERIFY_SID!;

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !String(phone).startsWith("+")) {
      return NextResponse.json(
        { ok: false, error: "Provide E.164 phone (e.g. +15551234567)." },
        { status: 400 }
      );
    }
    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Code is required." },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${AC}:${TK}`).toString("base64");
    const body = new URLSearchParams({ To: phone, Code: String(code) }).toString();

    const r = await fetch(`https://verify.twilio.com/v2/Services/${VSID}/VerificationCheck`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await r.json();

    if (!r.ok || data.status !== "approved") {
      return NextResponse.json(
        { ok: false, error: data?.message || "Invalid code" },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ ok: true });
    setSession(res, { phone });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
