"use client";
import { useState } from "react";
import { encodePayload } from "../lib/codec";


export default function Page() {
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      vin: String(form.get("vin") || "").trim(),
      price: String(form.get("price") || "").trim(),
      titleStatus: (form.get("titleStatus") as any) || "paid",
      year: String(form.get("year") || "").trim(),
      make: String(form.get("make") || "").trim(),
      model: String(form.get("model") || "").trim(),
      trim: String(form.get("trim") || "").trim(),
      miles: String(form.get("miles") || "").trim(),
      city: String(form.get("city") || "").trim(),
      state: String(form.get("state") || "").trim(),
      sellerName: String(form.get("sellerName") || "").trim(),
      sellerEmail: String(form.get("sellerEmail") || "").trim(),
      sellerPhone: String(form.get("sellerPhone") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
    };

    if (!payload.vin || payload.vin.length < 11) { alert("Please enter a valid VIN."); return; }
    if (!payload.sellerPhone) { alert("Seller mobile is required."); return; }

    setCreating(true);
    const encoded = encodePayload(payload as any);
    const nextUrl = `${window.location.origin}/ad/${encoded}`;
    setUrl(nextUrl);
    setCreating(false);
  }

  return (
    <div className="card">
      <div className="h1">Create a Car Ad (one shareable link)</div>
      <p className="p">Enter the basics. Your link is ready instantly. Share it anywhere.</p>

      <form className="row" onSubmit={onSubmit}>
        <div className="row2">
          <label className="small">VIN
            <input className="input" name="vin" placeholder="17‑digit VIN" required />
          </label>
          <label className="small">Exit price ($)
            <input className="input" name="price" placeholder="e.g., 31,500" />
          </label>
        </div>

        <div className="row2">
          <label className="small">Title status
            <select className="select" name="titleStatus">
              <option value="paid">Paid off (title in hand)</option>
              <option value="lien">Lien / loan payoff needed</option>
            </select>
          </label>
          <label className="small">Miles
            <input className="input" name="miles" placeholder="e.g., 42,300" />
          </label>
        </div>

        <div className="row2">
          <label className="small">Year
            <input className="input" name="year" placeholder="e.g., 2022" />
          </label>
          <label className="small">Make
            <input className="input" name="make" placeholder="e.g., Tesla" />
          </label>
        </div>

        <div className="row2">
          <label className="small">Model
            <input className="input" name="model" placeholder="e.g., Model Y" />
          </label>
          <label className="small">Trim
            <input className="input" name="trim" placeholder="e.g., Long Range" />
          </label>
        </div>

        <div className="row2">
          <label className="small">City
            <input className="input" name="city" placeholder="e.g., Bellport" />
          </label>
          <label className="small">State
            <input className="input" name="state" placeholder="NY" />
          </label>
        </div>

        <div className="row2">
          <label className="small">Seller name
            <input className="input" name="sellerName" placeholder="Your name" />
          </label>
          <label className="small">Seller email
            <input className="input" name="sellerEmail" placeholder="you@example.com" />
          </label>
        </div>

        <label className="small">Seller mobile (required — buyers will text/call)
          <input className="input" name="sellerPhone" placeholder="e.g., +1 555 123 4567" required />
        </label>

        <label className="small">Notes (optional)
          <textarea className="input" name="notes" placeholder="Any quick details buyers should know" rows={3} />
        </label>

        <button className="button" type="submit" disabled={creating}>{creating ? "Creating…" : "Create Link"}</button>
      </form>

      {url && (
        <div style={{marginTop: 16}}>
          <div className="h2">Your shareable link</div>
          <a className="link" href={url} target="_blank" rel="noreferrer">{url}</a>
          <div className="small" style={{marginTop: 8}}>Copy and share this anywhere. Buyers can tap to text/call/email you.</div>
        </div>
      )}
    </div>
  );
}
