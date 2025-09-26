"use client";
import { useEffect, useState } from "react";

function onlyDigits(s: string) { return s.replace(/\D/g, ""); }
function formatUSPhone(s: string) {
  const d = onlyDigits(s).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

export default function AccountPage() {
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const m = localStorage.getItem("carad.mobile") || "";
    setMobile(m ? formatUSPhone(m) : "");
  }, []);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const cursorEnd = e.target.selectionEnd || 0;
    const before = e.target.value;
    const formatted = formatUSPhone(before);
    setMobile(formatted);
    // keep cursor near end; simple & good enough
    requestAnimationFrame(() => e.target.setSelectionRange(formatted.length, formatted.length));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const raw = onlyDigits(mobile);
    if (!raw) { alert("Enter your mobile"); return; }
    localStorage.setItem("carad.mobile", raw); // store digits only
    alert("Saved! Tap the green pencil or Create Ad to make an ad.");
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
            placeholder="(917) 386-4337"
            value={mobile}
            onChange={onInput}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        <button className="button" type="submit">Save</button>
      </form>
      <div className="small" style={{marginTop:8}}>After saving, create your ad.</div>
    </div>
  );
}
