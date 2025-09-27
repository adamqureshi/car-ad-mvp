// lib/session.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const COOKIE_NAME = "carad.sid";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// naive JWT-ish token (header.payload.signature) w/ HMAC-SHA256
function sign(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createSessionToken(payload: object) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, b, s] = parts;
  const expected = sign(`${h}.${b}`);
  // timingSafeEqual throws if lengths differ
  if (s.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
  try {
    const obj = JSON.parse(Buffer.from(b, "base64url").toString());
    if (obj.exp && Date.now() > obj.exp) return null;
    return obj;
  } catch {
    return null;
  }
}

// server-side: read cookie + verify
export function getUserFromRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const data = verifySessionToken(token);
  if (!data) return null;
  return data as { phone: string; iat: number; exp?: number };
}

// set / clear cookie (server actions / route handlers without a response)
export function setSessionCookie(payload: { phone: string }) {
  const now = Date.now();
  const token = createSessionToken({ ...payload, iat: now, exp: now + MAX_AGE * 1000 });
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
}

// helper for APIs that already have a NextResponse
export function setSession(res: NextResponse, payload: { phone: string }) {
  const now = Date.now();
  const token = createSessionToken({ ...payload, iat: now, exp: now + MAX_AGE * 1000 });
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}

export function clearSessionOnResponse(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
