"use client";

import { useState } from "react";

export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    setMsg(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Failed to start");
      setStep("code");
      setMsg("Code sent via SMS.");
    } catch (e: any) {
      setMsg(e.message || "Error starting verification");
    } finally {
      setLoading(false);
    }
  }

  async function check() {
    setMsg(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Invalid code");
      setMsg("You're signed in!");
      // redirect to dashboard or new-ad
      window.location.href = "/";
    } catch (e: any) {
      setMsg(e.message || "Error verifying code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="h1">Create account</div>
      <p className="p">Just your mobile for now. We’ll add verification later.</p>

      {step === "enter" && (
        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            placeholder="+15551234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
            inputMode="tel"
            autoComplete="tel"
          />
          <button className="button" type="button" onClick={start} disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            inputMode="numeric"
          />
          <button className="button" type="button" onClick={check} disabled={loading}>
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>
          <a className="link" style={{ marginTop: 8 }} onClick={() => setStep("enter")}>
            Use a different number
          </a>
        </div>
      )}

      {msg && <div className="small" style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}
