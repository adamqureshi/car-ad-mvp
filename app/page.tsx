"use client";
import { useRef, useState } from "react";
import { encodePayload } from "@/lib/codec";

const fmt = new Intl.NumberFormat("en-US");
const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");

export default function Page() {
  const [creating, setCreating] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const vinDebounce = useRef<any>(null);
  const zipDebounce = useRef<any>(null);

  const getInput = (name: string) =>
    formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

  /** VIN auto-decode (debounced on type, also runs onBlur or button) */
  function scheduleDecodeIfReady() {
    const vinEl = getInput("vin") as HTMLInputElement | null;
    if (!vinEl) return;
    const raw = vinEl.value || "";
    const upper = raw.toUpperCase();
    if (raw !== upper) {
      const pos = vinEl.selectionStart || upper.length;
      vinEl.value = upper;
      requestAnimationFrame(() => vinEl.setSelectionRange(pos, pos));
    }
    if (upper.length !== 17 || decoding) {
      if (vinDebounce.current) clearTimeout(vinDebounce.current);
      return;
    }
    if (vinDebounce.current) clearTimeout(vinDebounce.current);
    vinDebounce.current = setTimeout(() => decodeVinNow(), 300);
  }

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
      setValue("year", String(row.ModelYear || ""));
      setValue("make", String(row.Make || ""));
      setValue("model", String(row.Model || ""));
      setValue("trim", String(row.Trim || row.Series || ""));
    } catch {
      alert("VIN decode failed. You can still continue manually.");
    } finally {
      setDecoding(false);
    }
  }

  /** ZIP → City/State (US) */
  function scheduleZipLookup() {
    const zipEl = getInput("zip") as HTMLInputElement | null;
    if (!zipEl) return;
    const digits = onlyDigits(zipEl.value).slice(0, 5);
    if (zipEl.value !== digits) zipEl.value = digits;
    if (digits.length !== 5) {
      if (zipDebounce.current) clearTimeout(zipDebounce.current);
      return;
    }
    if (zipDebounce.current) clearTimeout(zipDebounce.current);
    zipDebounce.current = setTimeout(() => lookupZipNow(digits), 300);
  }

  async function lookupZipNow(zip: string) {
    setZipLoading(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) throw new Error("zip");
      const data = await res.json();
      const place = data?.places?.[0];
      if (place) {
        setValue("city", String(place["place name"] || ""));
        setValue("state", String(place["state abbreviation"] || ""));
      }
    } catch {
      // silent; user can fill manually
    } finally {
      setZipLoading(false);
    }
  }

  /** Price/Odometer formatting on input */
  function formatNumberInput(name: "price" | "miles") {
    const el = getInput(name) as HTMLInputElement | null;
    if (!el) return;
    const rawDigits = onlyDigits(el.value);
    el.value = rawDigits ? fmt.format(Number(rawDigits)) : "";
  }

  const setValue = (name: string, value: string) => {
    const el = getInput(name) as HTMLInputElement | null;
    if (el) el.value = value || "";
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      vin: String(form.get("vin") || "").trim().toUpperCase(),
      price: String(form.get("price") || "").trim(),         // may have commas
      titleStatus: (form.get("titleStatus") as any) || "paid",
      year: String(form.get("year") || "").trim(),
      make: String(form.get("make") || "").trim(),
      model: String(form.get("model") || "").trim(),
      trim: String(form.get("trim") || "").trim(),
      miles: String(form.get("miles") || "").trim(),         // may have commas
      city: String(form.get("city") || "").trim(),
      state: String(form.get("state") || "").trim(),
      zip: String(form.get("zip") || "").trim(),
      photoUrl: String(form.get("photoUrl") || "").trim(),
      sellerName: String(form.get("sellerName") || "").trim(),
      sellerEmail: String(form.get("sellerEmail") || "").trim(),
      sellerPhone: String(form.get("sellerPhone") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
    };

    if (payload.vin.length !== 17) {
      alert("VIN must be 17 characters.");
      return;
    }
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
            Photo URL
            <input className="input" name="photoUrl" placeholder="https://…" />
          </label>
        </div>

        <div className="row2">
          <label className="small">
            Asking price ($)
            <input
              className="input"
              name="price"
              placeholder="e.g., 31,500"
              inputMode="numeric"
              onInput={() => formatNumberInput("price")}
            />
          </label>
          <label className="small">
            Odometer (miles)
            <input
              className="input"
              name="miles"
              placeholder="e.g., 42,300"
              inputMode="numeric"
              onInput={() => formatNumberInput("miles")}
            />
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
            ZIP
            <input
              className="input"
              name="zip"
              placeholder="e.g., 11713"
              inputMode="numeric"
              maxLength={5}
              onInput={scheduleZipLookup}
              onBlur={scheduleZipLookup}
            />
            {zipLoading && <div className="small">Looking up city/state…</div>}
          </label>
          <div className="row2">
            <label className="small">
              City
              <input className="input" name="city" placeholder="City" />
            </label>
            <label className="small">
              State
              <input className="input" name="state" placeholder="NY" />
            </label>
          </div>
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

        <button className="button" type="submit" disabled={creating || decoding || zipLoading}>
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
                  } catch {}
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




