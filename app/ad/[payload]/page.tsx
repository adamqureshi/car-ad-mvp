"use client";
import { useMemo, useState } from "react";
import { decodePayload } from "@/lib/codec";

const fmt = new Intl.NumberFormat("en-US");
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const fmtMoney = (s?: string) => {
  const d = s?.replace(/[^\d]/g, "") || "";
  return d ? "$" + fmt.format(Number(d)) : "";
};
const fmtMiles = (s?: string) => {
  const d = s?.replace(/[^\d]/g, "") || "";
  return d ? fmt.format(Number(d)) + " miles" : "";
};
const formatUSPhone = (s: string) => {
  const d = onlyDigits(s).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
};

export default function AdPage({ params }: { params: { payload: string } }) {
  const data = useMemo(() => decodePayload(params.payload), [params.payload]);
  const [showContact, setShowContact] = useState(false);

  if (!data) {
    return (
      <div className="card">
        <div className="h1">Not found</div>
        <div className="p">This ad link looks invalid.</div>
      </div>
    );
  }

  const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(" ") || "Vehicle";
  const where = [data.city, data.state].filter(Boolean).join(", ") || (data.zip ? `ZIP ${data.zip}` : "");
  const price = fmtMoney(data.price);
  const miles = fmtMiles(data.miles);
  const phoneDigits = onlyDigits(data.sellerPhone || "");
  const phonePretty = formatUSPhone(data.sellerPhone || "");

  return (
    <div className="card">
      {/* photo, title, details ... (unchanged) */}

      <div className="hr" />

      {!showContact ? (
        <button className="button" type="button" onClick={() => setShowContact(true)}>
          CONTACT SELLER
        </button>
      ) : (
        <div>
          <div className="h2">Seller Contact</div>
          <div className="p"><strong>{phonePretty || data.sellerPhone}</strong></div>
          <div className="actions" style={{ marginTop: 8 }}>
            <a className="link" href={`sms:${encodeURIComponent(phoneDigits)}`}>Text seller</a>
            <a className="link" href={`tel:${encodeURIComponent(phoneDigits)}`}>Call seller</a>
            {data.sellerEmail && (
              <a className="link" href={`mailto:${encodeURIComponent(data.sellerEmail)}?subject=${encodeURIComponent("Interested in your car")}`}>
                Email seller
              </a>
            )}
          </div>
        </div>
      )}

      <div className="hr" />
      <div className="small">Minimal ad page. Payments/inspection/title services can be added later.</div>
      <div className="p" style={{ marginTop: 8 }}>
        <a className="link" href="/">Create your own car ad</a>
      </div>
    </div>
  );
}

