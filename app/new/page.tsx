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
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const vinDebounce = useRef<any>(null);
  const zipDebounce = useRef<any>(null);

  useEffect(() => {
    setAccountMobile(localStorage.getItem("carad.mobile") || "");
  }, []);

  const getInput = (name: string) =>
    formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

  function setValue(name: string, value: string) {
    const el = getInput(name) as HTMLInputElement | null;
    if (el) el.value = value;
  }

  // ----- VIN decode (NHTSA) -----
  function scheduleDecodeIfReady() {
    const vinEl = getInput("vin") as HTMLInputElement | null;
    if (!vinEl) return;
    const upper = (vinEl.value || "").toUpperCase();
    if (upper !== vinEl.value) vinEl.value = upper;
    if (upper.length !== 17 || decoding) {
      if (vinDebounce.current) clearTimeout(vinDebounce.current);
      return;
    }
    if (vinDebounce.current) clearTimeout(vinDebounce.current);
    vinDebounce.current = setTimeout(decodeVinNow, 300);
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
      const r = data?.Results?.[0] || {};
      setValue("year", String(r.ModelYear || ""));
      setValue("make", String(r.Make || ""));
      setValue("model", String(r.Model || ""));
      setValue("trim", String(r.Trim || r.Series || ""));
    } catch {
      alert("VIN decode failed (you can continue manually).");
    } finally {
      setDecoding(false);
    }
  }

  // ----- ZIP → City/State -----
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
    zipDebounce.current = setTimeout(() => lookupZip(digits), 300);
  }
  async function lookupZip(zip: string) {
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
    } finally {
      setZipLoading(false);
    }
  }

  // ----- numeric formatting -----
  function formatNumberInput(name: "price" | "miles") {
    const el = getInput(name) as HTMLInputElement | null;
    if (!el) return;
    const digits = onlyDigits(el.value);
    el.value = digits ? fmt.format(Number(digits)) : "";
  }
  function onPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.target.value = formatUSPhone(e.target.value);
  }

  // ----- uploads -----
  async function handleFiles(fs: FileList | null) {
    if (!fs || fs.length === 0) return;
    setUploading(true);
    try {
      for (const f of Array.from(fs)) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data?.ok && data.url) setPhotos((p) => [...p, data.url]);
        else if (data?.error === "NO_TOKEN")
          alert("Upload unavailable (BLOB_READ_WRITE_TOKEN missing).");
        else alert("Upload failed.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  function removePhoto(url: string) {
    setPhotos((p) => p.filter((x) => x !== url));
  }

  // ----- submit -----
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const sellerPhoneDigits = onlyDigits(String(form.get("sellerPhone") || ""));

    const payload = {
      vin: String(form.get("vin") || "").trim().toUpperCase(),
      photos: [
        ...(String(form.get("photoUrl") || "").trim()
          ? [String(form.get("photoUrl") || "").trim()]
          : []),
        ...photos,
      ].slice(0, 12),
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
      sellerPhone: sellerPhoneDigits,
      notes: String(form.get("notes") || "").trim(),
    };

    if (payload.vin.length !== 17) return alert("VIN must be 17 characters.");
    if (!sellerPhoneDigits) return alert("Seller mobile is required.");
    if (uploading) return alert("Please wait for uploads to finish.");

    setCreating(true);
    const encoded = encodePayload(payload as any);
    const nextUrl = `${window.location.origin}/ad/${encoded}`;
    setUrl(nextUrl);

    const title =
      [payload.year, payload.make, payload.model, payload.trim]
        .filter(Boolean)
        .join(" ") || "Vehicle";
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
      <div className="breadcrumbs">
        <a className="link" href="/">Home</a>
        <span className="bc-sep">›</span>
        <span className="small">New Ad</span>
      </div>

      <div className="h1">New Ad</div>
      <p className="p">Fill this out, get a link, share anywhere.</p>

      <form className="row" onSubmit={onSubmit} ref={formRef}>
        <label className="small">VIN
          <input
            className="input"
            name="vin"
            placeholder="17-digit VIN"
            required
            maxLength={17}
            onChange={scheduleDecodeIfReady}
            onBlur={decodeVinNow}
          />
        </label>
        <a className="link" href="#" onClick={(e)=>{e.preventDefault(); if (!decoding) decodeVinNow();}}>
          {decoding ? "Decoding…" : "Decode VIN"}
        </a>

        {/* -------- UPLOAD PHOTOS -------- */}
        <div style={{
          border: "1px dashed var(--border-strong)",
          borderRadius: 12, padding: 12, background: "#f9fafb"
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <button
              type="button"
              onClick={()=>fileInputRef.current?.click()}
              className="link"
              style={{textDecoration:"underline",fontWeight:700}}
            >
              Upload photos
            </button>
            {uploading && <span className="small">Uploading…</span>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e)=>handleFiles(e.target.files)}
            style={{display:"none"}}
          />
          {photos.length > 0 && (
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingTop:8}}>
              {photos.map((p)=>(
                <div key={p} style={{
                  position:"relative", width:84, height:84, flex:"0 0 auto",
                  borderRadius:10, overflow:"hidden", border:"1px solid var(--border)", background:"#fff"
                }}>
                  <img src={p} alt="photo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <button type="button"
                          onClick={()=>removePhoto(p)}
                          style={{
                            position:"absolute", top:4, right:4, background:"rgba(17,24,39,.75)",
                            color:"#fff", border:"none", borderRadius:6, fontSize:11, padding:"2px 6px", cursor:"pointer"
                          }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* -------------------------------- */}

        <label className="small">Photo URL (optional)
          <input className="input" name="photoUrl" placeholder="https://…" />
        </label>

        <div className="row2">
          <label className="small">Asking price ($)
            <input className="input" name="price" placeholder="e.g., 21,500" inputMode="numeric"
                   onInput={()=>formatNumberInput("price")} />
          </label>
          <label className="small">Odometer (miles)
            <input className="input" name="miles" placeholder="e.g., 6,000" inputMode="numeric"
                   onInput={()=>formatNumberInput("miles")} />
          </label>
        </div>

        <div className="row2">
          <label className="small">Year
            <input className="input" name="year" placeholder="e.g., 2020" />
          </label>
          <label className="small">Make
            <input className="input" name="make" placeholder="e.g., Tesla" />
          </label>
        </div>

        <div className="row2">
          <label className="small">Model
            <input className="input" name="model" placeholder="e.g., Model 3" />
          </label>
          <label className="small">Trim
            <input className="input" name="trim" placeholder="e.g., Long Range" />
          </label>
        </div>

        <div className="row2">
          <label className="small">ZIP
            <input className="input" name="zip" placeholder="e.g., 11713" inputMode="numeric" maxLength={5}
                   onInput={scheduleZipLookup} onBlur={scheduleZipLookup} />
            {zipLoading && <div className="small">Looking up city/state…</div>}
          </label>
          <div className="row2">
            <label className="small">City
              <input className="input" name="city" placeholder="City" />
            </label>
            <label className="small">State
              <input className="input" name="state" placeholder="NY" />
            </label>
          </div>
        </div>

        <div className="row2">
          <label className="small">Seller name
            <input className="input" name="sellerName" placeholder="Your name" />
          </label>
          <label className="small">Seller email
            <input className="input" name="sellerEmail" placeholder="you@example.com" />
          </label>
        </div>

        <label className="small">Seller mobile (required)
          <input className="input" name="sellerPhone" placeholder="(917) 386-4337"
                 required inputMode="tel" autoComplete="tel"
                 defaultValue={formatUSPhone(accountMobile)} onChange={onPhoneChange} />
        </label>

        <label className="small">Notes (optional)
          <textarea className="input" name="notes" placeholder="Any quick details buyers should know" rows={3} />
        </label>

        <a className="link" href="#" onClick={(e)=>{e.preventDefault(); (formRef.current as HTMLFormElement)?.requestSubmit();}}>
          {creating ? "Creating…" : "Create Link"}
        </a>
      </form>

      {url && (
        <div style={{ marginTop: 16 }}>
          <div className="h2">Your shareable link</div>
          <a className="link" href={url} target="_blank" rel="noreferrer">{url}</a>
          <div className="small" style={{ marginTop: 8 }}>
            <a className="link" href="#" onClick={async (e)=>{e.preventDefault(); await navigator.clipboard.writeText(url); alert("Link copied");}}>
              Copy link
            </a>
            <span className="bc-sep"> · </span>
            <a className="link" href="/">Back to dashboard</a>
          </div>
        </div>
      )}
    </div>
  );
}


