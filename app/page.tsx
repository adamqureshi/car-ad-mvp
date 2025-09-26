"use client";
import { useRef, useState } from "react";
import { encodePayload } from "@/lib/codec";

export default function Page() {
  const [creating, setCreating] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const vinDebounce = useRef<any>(null); // debounce timer

  // Helper: get input/textarea by name (form is mostly uncontrolled)
  const getInput = (name: string) =>
    formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

  // Schedules a decode when VIN is 17 chars (debounced)
  function scheduleDecodeIfReady() {
    const vinEl = getInput("vin") as HTMLInputElement | null;
    if (!vinEl) return;

    // Normalize to uppercase as user types
    const raw = vinEl.value || "";
    const upper = raw.toUpperCase();
    if (raw !== upper) {
      const pos = vinEl.selectionStart || upper.length;
      vinEl.value = upper;
      // keep cursor position
      requestAnimationFrame(() => {
        vinEl.setSelectionRange(pos, pos);
      });
    }

    if (upper.length !== 17 || decoding) {
      if (vinDebounce.current) clearTimeout(vinDebounce.current);
      return;
    }
    if (vinDebounce.current) clearTimeout(vinDebounce.current);
    vinDebounce.current = setTimeout(() => {
      decodeVinNow();
    }, 300);
  }

  // Decode VIN via NHTSA VPIC and ALWAYS write fields
  async function decodeVinNow() {
    const vinEl = getInput("vin") as HTMLInputElement | null;
    if (!vinEl) return;
    const vin = (vinEl.value || "").trim().toUpperCase();
    if (vin.length !== 17 || decoding) return;

    setDecoding(true);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(
          vin
        )}?format=json`
      );
      const data = await res.json();
      const row = data?.Results?.[0] || {};

      const year = row.ModelYear || "";
      const make = row.Make || "";
      const model = row.Model || "";
      const trim = row.Trim || row.Series || "";

      const setValue = (name: string, value: string) => {
        const el = getInput(name) as HTMLInputElement | null;
        if (el) el.value = value || "";
      };

      setValue("year", String(year));
      setValue("make", String(make));
      setValue("model", String(model));
      setValue("trim", String(trim));
    } catch {
      alert("VIN decode failed. You can still continue manually.");
    } finally {
      setDecoding(false);
    }
  }

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

    // normalize + validate VIN
    payload.vin = payload.vin.toUpperCase();
    if (payload.vin.length !== 17) {
      alert("VIN must be 17 characters.");
      return;
    }

    // required phone
    if (!payload.sellerPhone) {
      alert("Seller mobile is required.");
      return;
    }

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

      <form className="row" onSubmit={onSubmit} ref={formRef}>
        <div className="row2">
          <label className="small">
            VIN
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                className="input"
                name="vin"
                placeholder="17-digit VIN"
                required
                maxLength={17}
                onChange={scheduleDecodeIfReady}
                onBlur={decodeVinNow}
              />
              <button
                type="button"
                className="button"
                onClick={decodeVinNow}
                disabled={decoding}
                title="Decode VIN (NHTSA)"
                style={{ whiteSpace: "nowrap" }}
              >
                {decoding ? "Decoding…" : "Decode VIN"}
              </button>
            </div>
          </label>

          <label className="small">
            Exit price ($)
            <input className="input" name="price" placeholder="e.g., 31,500" />
          </label>
        </div>

        <div className="row2">
          <label className="small">
            Title status
            <select className="select" name="titleStatus">
              <option value="paid">Paid off (title in hand)</option>
              <option value="lien">Lien / loan payoff needed</option>
            </select>
          </label>
          <label className="small">
            Miles
            <input className="input" name="miles" placeholder="e.g., 42,300" />
          </label>
        </div>

        <div className="row2">
          <label className="small">
            Year
            <input className="input" name="year" placeholder="e.g., 2022" />
          </label>
          <label className="small">
            Make
            <input className="input" name="make" placeholder="e.g., Tesla" />
          </label>
        </div>

        <div className="row2">
          <label className="small">
            Model
            <input className="input" name="model" placeholder="e.g., Model Y" />
          </label>
          <label className="small">
            Trim
            <input className="input" name="trim" placeholder="e.g., Long Range" />
          </label>
        </div>

        <div className="row2">
          <label className="small">
            City
            <input className="input" name="city" placeholder="e.g., Bellport" />
          </label>
          <label className="small">
            State
            <input className="input" name="state" placeholder="NY" />
          </label>
        </div>

        <div className="row2">
          <label className="small">
            Seller name
            <input className="input" name="sellerName" placeholder="Your name" />
          </label>
          <label className="small">
            Seller email
            <input className="input" name="sellerEmail" placeholder="you@example.com" />
          </label>
        </div>

        <label className="small">
          Seller mobile (required — buyers will text/call)
          <input
            className="input"
            name="sellerPhone"
            placeholder="e.g., +1 555 123 4567"
            required
            inputMode="tel"
            autoComplete="tel"
          />
        </label>

        <label className="small">
          Notes (optional)
          <textarea className="input" name="notes" placeholder="Any quick details buyers should know" rows={3} />
        </label>

        <button className="button" type="submit" disabled={creating || decoding}>
          {creating ? "Creating…" : "Create Link"}
        </button>
      </form>

      {url && (
        <div style={{ marginTop: 16 }}>
          <div className="h2">Your shareable link</div>
          <a className="link" href={url} target="_blank" rel="noreferrer">
            {url}
          </a>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="button"
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  alert("Link copied");
                } catch {
                  alert("Copy failed");
                }
              }}
            >
              Copy link
            </button>

            <button
              className="button"
              type="button"
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: "My Car Ad", url });
                  } catch {
                    /* user canceled share */
                  }
                } else {
                  await navigator.clipboard.writeText(url);
                  alert("Link copied");
                }
              }}
            >
              Share
            </button>
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            Paste it in SMS, Marketplace, Craigslist, DMs—wherever.
          </div>
        </div>
      )}
    </div>
  );
}



