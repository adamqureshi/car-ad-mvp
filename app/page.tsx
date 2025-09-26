"use client";
import { useEffect, useState } from "react";

type MyAd = { title: string; url: string; createdAt: number };

export default function Home() {
  const [mobile, setMobile] = useState<string | null>(null);
  const [ads, setAds] = useState<MyAd[]>([]);

  useEffect(() => {
    setMobile(localStorage.getItem("carad.mobile"));
    try {
      const raw = localStorage.getItem("carad.myads");
      setAds(raw ? (JSON.parse(raw) as MyAd[]) : []);
    } catch {
      setAds([]);
    }
  }, []);

  function copy(t: string) {
    navigator.clipboard.writeText(t).then(() => alert("Link copied"));
  }

  return (
    <div className="card">
      <div className="h1">Your dashboard</div>

      {!mobile ? (
        <>
          <p className="p">You don’t have an account yet.</p>
          <a className="link-big" href="/account">Create account (mobile only)</a>
          <div className="small" style={{ marginTop: 8 }}>
            Saves just your mobile for now; verification later.
          </div>
        </>
      ) : (
        <>
          <p className="p">
            Signed in (local): <strong>{mobile}</strong>
          </p>
          <a className="button-blue" href="/new">Create Ad</a>
          <div className="small" style={{ marginTop: 8 }}>
            One tap → fill the form → get a shareable link.
          </div>
        </>
      )}

      <div className="hr" />

      <div className="h2">My ads</div>
      {ads.length === 0 ? (
        <div className="small">No ads yet.</div>
      ) : (
        <div className="row">
          {ads.map((a, i) => (
            <div key={i} className="card" style={{ padding: 12 }}>
              <div className="p"><strong>{a.title}</strong></div>
              <a className="link" href={a.url} target="_blank" rel="noreferrer">
                {a.url}
              </a>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="button" onClick={() => copy(a.url)} type="button">
                  Copy link
                </button>
                <a className="button" href={a.url} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






