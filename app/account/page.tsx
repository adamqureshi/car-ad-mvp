"use client";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const m = localStorage.getItem("carad.mobile") || "";
    setMobile(m);
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const n = mobile.trim();
    if (!n) { alert("Enter your mobile"); return; }
    localStorage.setItem("carad.mobile", n);
    alert("Saved! Tap the green pencil to create your ad.");
    window.location.href = "/";
  }

  return (
    <div className="card">
      <div className="h1">Create account</div>
      <p className="p">Just your mobile for now. We’ll add verification later.</p>
      <form className="row" onSubmit={save}>
        <label className="small">Mobile number
          <input
            className="input"
            placeholder="e.g., +1 555 123 4567"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        <button className="button" type="submit">Save</button>
      </form>
      <div className="small" style={{marginTop:8}}>After saving, hit the green pencil to create an ad.</div>
    </div>
  );
}
