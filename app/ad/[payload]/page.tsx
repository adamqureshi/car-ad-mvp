import Link from "next/link";
import { decodePayload } from "@/lib/codec";
import { notFound } from "next/navigation";
import LeadForm from "./LeadForm";

export default function AdPage({ params }: { params: { payload: string } }) {
  const data = decodePayload(params.payload);
  if (!data) return notFound();

  const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(" ") || "Vehicle";
  const where = [data.city, data.state].filter(Boolean).join(", ");

  return (
    <div className="card">
      <div className="h1">{title}</div>
      <div className="p small">VIN: {data.vin}</div>
      {where && <div className="p small">Location: {where}</div>}
      {data.miles && <div className="p small">Miles: {data.miles}</div>}
      {data.price && <div className="p">Seller exit price: <strong>${data.price}</strong></div>}
      {data.titleStatus && (
        <div className="p small">Title status: {data.titleStatus === "paid" ? "Paid off" : "Lien (payoff needed)"}</div>
      )}
      {data.notes && <div className="p">Notes: {data.notes}</div>}

      <div className="hr" />

      <div className="h2">Contact seller (fast)</div>
      <div className="actions" style={{marginTop: 8}}>
        <a className="link" href={`sms:${encodeURIComponent(data.sellerPhone)}`}>Text seller</a>
        <a className="link" href={`tel:${encodeURIComponent(data.sellerPhone)}`}>Call seller</a>
        {data.sellerEmail && (
          <a className="link" href={`mailto:${encodeURIComponent(data.sellerEmail)}?subject=${encodeURIComponent("Interested in your car")}`}>Email seller</a>
        )}
      </div>

      <div className="hr" />

      <LeadForm payloadEncoded={params.payload} />

      <div className="hr" />

      <div className="small">
        This is a minimal ad page. For trust & safety (payments, lien payoff, inspection), upgrade later.
      </div>

      <div className="p" style={{marginTop: 8}}>
        <Link className="link" href="/">Create your own car ad</Link>
      </div>
    </div>
  );
}