"use client";
import { useMemo, useState } from "react";
import { decodePayload } from "@/lib/codec";

const fmt = new Intl.NumberFormat("en-US");
const fmtMoney = (s?: string) => {
  if (!s) return "";
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return "";
  return "$" + fmt.format(Number(digits));
};
const fmtMiles = (s?: string) => {
  if (!s) return "";
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return "";
  return fmt.format(Number(digits)) + " miles";
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

  const title =
    [data.year, data.make, data.model, data.trim].filter(Boolean).join(" ") || "Vehicle";
  const where =
    [data.city, data.state].filter(Boolean).join(", ") || (data.zip ? `ZIP ${data.zip}` : "");
  const price = fmtMoney(data.price);
  const miles = fmtMiles(data.miles);

  return (
    <div className="card">
      {data.photoUrl && (
        <div style={{ marginBottom: 12 }}>
          <img
            src={data.photoUrl}
            alt={title}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 12,
              border: "1px solid var(--border)",
              display: "block",
            }}
          />
        </div>
      )}

      <div className="h1">{title}</div>
      <div className="p small">VIN: {data.vin}</div>
      {where && <div className="p small">Location: {where}</div>}
      {miles && <div className="p small">Odometer: {miles}</div>}
      {price && (
        <div className="p">
          Asking Price: <strong>{price}</strong>
        </div>
      )}
      {data.notes && <div className="p">Notes: {data.notes}</div>}

      <div className="hr" />

      {!showContact ? (
        <button className="button" type="button" onClick={() => setShowContact(true)}>
          CONTACT SELLER
        </button>
      ) : (
        <div>
          <div className="h2">Seller Contact</div>
          <div className="p"><strong>{data.sellerPhone}</strong></div>
          <div className="actions" style={{ marginTop: 8 }}>
            <a className="link" href={`sms:${encodeURIComponent(data.sellerPhone)}`}>
              Text seller
            </a>
            <a className="link" href={`tel:${encodeURIComponent(data.sellerPhone)}`}>
              Call seller
            </a>
            {data.sellerEmail && (
              <a
                className="link"
                href={`mailto:${encodeURIComponent(
                  data.sellerEmail
                )}?subject=${encodeURIComponent("Interested in your car")}`}
              >
                Email seller
              </a>
            )}
          </div>
        </div>
      )}

      <div className="hr" />

      <div className="small">
        Minimal ad page. Payments/inspection/title services can be added later.
      </div>

      <div className="p" style={{ marginTop: 8 }}>
        <a className="link" href="/">Create your own car ad</a>
      </div>
    </div>
  );
}





