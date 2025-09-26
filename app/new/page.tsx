"use client";
import { useEffect, useRef, useState } from "react";
import { encodePayload } from "@/lib/codec";

const fmt = new Intl.NumberFormat("en-US");
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const formatUSPhone = (s: string) => {
  const d = onlyDigits(s).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
};

export default function NewAd() {
  const [creating, setCreating] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [accountMobile, setAccountMobile] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const vinDebounce = useRef<any>(null);
  const zipDebounce = useRef<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("carad.mobile") || "";
    setAccountMobile(raw); // raw digits; we’ll format in the input defaultValue below
  }, []);

  const getInput = (name: string) =>
    formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;

  // --- VIN decode (unchanged) ---
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
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
      const data = await res.json();
      const row = data?.Results?.[0] || {};
      setValue("year", String(row.ModelYear || ""));
      setValue("make", String(row.Make || ""));
      setValue("model", String(row.Model || ""));
      setValue("trim", String(row.Trim || row.Series || ""));
    } finally { setDecoding(false); }
  }

  // --- ZIP lookup (unchanged) ---
  function scheduleZipLookup() {
    const zipEl = getInput("zip") as HTMLInputElement | null;
    if (!zipEl) return;
    const digits = onlyDigits(zipEl.value).slice(0, 5);
    if (zipEl.value !== digits) zipEl.value = digits;
    if (digits.length !== 5) { if (zipDebounce.current) clearTimeout(zipDebounce.current); return; }
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
    } finally { setZipLoading(false); }
  }

  // --- price/odometer formatting (unchanged) ---
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

  // --- NEW: phone formatting while typing ---
  function onPhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const formatted = formatUSPhone(val);
    e.target.value = formatted;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const sellerPhoneFormatted = String(form.get("sellerPhone") || "").trim();
    const sellerPhoneDigits = onlyDigits(sellerPhoneFormatted);

    const payload = {
      vin: String(form.get("vin") || "").trim().toUpperCase(),
      photoUrl: String(form.get("photoUrl") || "").trim(),
      price: String(form.get("price") || "").trim(),
      miles: String(form.get("miles") || "").trim(),
      titleStatus: (form.get("titleStatus") as any) || "paid",
      year: String(form.get("year") || "").trim(),
      make: String(form.get("make") || "").trim(),
      model: String(form.get("model") || "").trim(),
      trim: String(form.get("trim") || "").trim(),
      zip: String(form.get("zip") || "").trim(),
      city: String(form.get("city") || "").trim(),
      state: String(form.get("state") || "").trim(),
      sellerName: String(form.get("sellerName") || "").trim(),
      sellerEmail: String(form.get("sellerEmail") || "").trim(),
      sellerPhone: sellerPhoneDigits, // store digits in the URL
      notes: String(form.get("notes") || "").trim(),
    };

    if (payload.vin.length !== 17) { alert("VIN must be 17 characters."); return; }
    if (!sellerPhoneDigits) { alert("Seller mobile is required."); return; }

    const encoded = encodePayload(payload as any);
    const nextUrl = `${window.location.origin}/ad/${encoded}`;
    setUrl(nextUrl);

    // Save to "My ads"
    const title = [payload.year, payload.make, payload.model, payload.trim].filter(Boolean).join(" ") || "Vehicle";
    try {
      const raw = localStorage.getItem("carad.myads");
      const arr = raw ? (JSON.parse(raw) as any[]) : [];
      arr.unshift({ title, url: nextUrl, createdAt: Date.now() });
      localStorage.setItem("carad.myads", JSON.stringify(arr.slice(0, 50)));
    } catch {}

    setCreating(false);
  }

  return (
    <div className="card">
      <div className="h1">New Ad</div>
      <p className="p">Fill this out, get a link, share anywhere.</p>

      <form className="row" onSubmit={onSubmit} ref={formRef}>
        {/* VIN + Photo URL, price/odometer, year/make/model/trim, ZIP... (unchanged) */}
        {/* ... keep your existing fields here ... */}

        {/* Seller fields */}
        <div className="row2">
          <label className="small">Seller name
            <input className="input" name="sellerName" placeholder="Your name" />
          </label>
          <label className="small">Seller email
            <input className="input" name="sellerEmail" placeholder="you@example.com" />
          </label>
        </div>

        <label className="small">Seller mobile (required)
          <input
            className="input"
            name="sellerPhone"
            placeholder="(917) 386-4337"
            required
            inputMode="tel"
            autoComplete="tel"
            defaultValue={formatUSPhone(accountMobile)}
            onChange={onPhoneInput}
          />
        </label>

        {/* Notes + submit (unchanged) */}
        {/* ... */}
      </form>

      {url && (
        <div style={{ marginTop: 16 }}>
          <div className="h2">Your shareable link</div>
          <a className="link" href={url} target="_blank" rel="noreferrer">{url}</a>
        </div>
      )}
    </div>
  );
}

