"use client";
import { useMemo, useState } from "react";
import { decodePayload } from "@/lib/codec";
import AdGallery from "@/components/AdGallery"; // <-- add this

// ... your helpers (fmtMoney, fmtMiles, formatUSPhone) stay the same

export default function AdPage({ params }: { params: { payload: string } }) {
  const data = useMemo(() => decodePayload(params.payload), [params.payload]);
  const [showContact, setShowContact] = useState(false);

  const images: string[] = (data as any)?.images ?? []; // <-- add this

  if (!data) {
    return (
      <div className="card">
        <div className="p">Invalid ad.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="breadcrumbs">
        <a className="link" href="/">Home</a>
        <span className="bc-sep">›</span>
        <span>Ad</span>
      </div>

      {/* === NEW: GALLERY === */}
      <AdGallery images={images} />

      {/* your existing title / price / miles / city-state UI follows */}
      {/* e.g. */}
      {/* <div className="h1">{data.title}</div> */}
      {/* ... rest of page unchanged ... */}
    </div>
  );
}


