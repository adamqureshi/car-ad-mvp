// lib/codec.ts
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
  zip?: string;
  photoUrl?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  notes?: string;
};

// --- base64url helpers that work in server and browser ---

function encodeBase64Url(str: string): string {
  // Server (Node) path
  if (typeof window === "undefined") {
    // @ts-ignore Buffer exists in Node
    return Buffer.from(str, "utf8").toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  // Browser path
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(b64url: string): string {
  // Re-pad & de-url
  const base64 = (b64url + "===".slice((b64url.length + 3) % 4))
    .replace(/-/g, "+").replace(/_/g, "/");

  // Server (Node) path
  if (typeof window === "undefined") {
    // @ts-ignore Buffer exists in Node
    return Buffer.from(base64, "base64").toString("utf8");
  }
  // Browser path
  // Handle UTF-8 safely
  const bin = atob(base64);
  try {
    // convert binary string to UTF-8 string
    const bytes = Uint8Array.from({ length: bin.length }, (_, i) => bin.charCodeAt(i));
    return new TextDecoder().decode(bytes);
  } catch {
    // fallback
    return decodeURIComponent(escape(bin));
  }
}

export function encodePayload(p: Payload) {
  return encodeBase64Url(JSON.stringify(p));
}

export function decodePayload(s: string): Payload | null {
  try {
    const json = decodeBase64Url(s);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

