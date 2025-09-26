export type Payload = {
  vin: string;
  price?: string;
  titleStatus?: "paid" | "lien";
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  miles?: string;
  city?: string;
  state?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  notes?: string;
};

export function encodePayload(p: Payload) {
  const json = JSON.stringify(p);
  const base64 = Buffer.from(json).toString("base64url");
  return base64;
}

export function decodePayload(s: string): Payload | null {
  try {
    const json = Buffer.from(s, "base64url").toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}