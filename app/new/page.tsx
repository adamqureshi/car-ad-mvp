"use client";
import { useEffect, useRef, useState } from "react";
// ⬇️ remove encodePayload; we don't need the long URL anymore
// import { encodePayload } from "@/lib/codec";

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
  const [url, setUrl] = useState<string | null>(null);     // will hold /ad/{id}
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
    if (vinDebounce.cur
