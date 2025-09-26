"use client";
import { useEffect, useState } from "react";

export default function FabCreate() {
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const mobile = localStorage.getItem("carad.mobile");
    setHasAccount(Boolean(mobile));
  }, []);

  const href = hasAccount ? "/new" : "/account";

  return (
    <a className="fab-green" href={href} aria-label="Create Ad">
      {/* Pencil icon (SVG) */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="white"/>
        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
      </svg>
    </a>
  );
}
