"use client";

import { useEffect, useState } from "react";

function onlyDigits(s: string) { return s.replace(/\D/g, ""); }
function formatUSPhone(s: string) {
  const d = onlyDigits(s).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}
function toE164FromUS(formatted: string) {
  const d = onlyDigits(formatted);
  if (d.length === 10) return `+1${d}`;
  if (formatted.trim().startsWith("+")) return formatted.trim();
  return "";
}

export default function AccountPage() {
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("carad.mobile") || "";
    setMobile(stored ? formatUSPhone(stored) : "");
  }, []);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatUSPhone(e.target.value);
    setMobile(formatted);
    requestAnimationFrame(() =>
      e.target.setSelectionRange(formatted.length, formatted.length)
    );
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const e164 = toE164FromUS(mobile);
    if (!e164) { setMsg("Enter a valid US number (e.g. (917) 386-4337)."); return; }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164 }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Failed to send code");

      localStorage.setItem("carad.mobile", onlyDigits(mobile));
      setStep("code");
      setMsg("Code sent via SMS.");
    } catch (err: any) {
      setMsg(err?.message || "Could not start verification");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const e164 = toE164FromUS(mobile);
    if (!e164) { setMsg("Invalid phone number."); return; }
    if (!code) { setMsg("Enter the 6-digit code."); return; }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164, code }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Invalid code");

      setMsg("You're signed in!");
      window.location.href = "/";
    } catch (err: any) {
      setMsg(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="breadcrumbs">
        <a className="link" href="/">Home</a>
        <span className="bc-sep">›</span>
        <span className="small">Account</span>
      </div>

      <div className="h1">Create account</div>
      <p className="p">Enter your mobile; we’ll text you a code to verify.</p>

      {step === "enter" && (
        <form className="row" onSubmit={sendCode}>
          <label className="small">Mobile number
            <input
              className="input"
              placeholder="(917) 386-4337"
              value={mobile}
              onChange={onInput}
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form className="row" onSubmit={verifyCode}>
          <label className="small">Enter code
            <input
              className="input"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>

          <a
            className="link"
            href="#"
            onClick={(e) => { e.preventDefault(); setStep("enter"); setMsg(null); }}
          >
            Use a different number
          </a>
        </form>
      )}

      {msg && <div className="small" style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  );
}


