{url && (
  <div style={{marginTop: 16}}>
    <div className="h2">Your shareable link</div>
    <a className="link" href={url} target="_blank" rel="noreferrer">{url}</a>
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <button
        className="button"
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            alert("Link copied");
          } catch { alert("Copy failed"); }
        }}
      >
        Copy link
      </button>
      <button
        className="button"
        type="button"
        onClick={async () => {
          if (navigator.share) {
            try { await navigator.share({ title: "My Car Ad", url }); } 
            catch {}
          } else {
            await navigator.clipboard.writeText(url);
            alert("Link copied");
          }
        }}
      >
        Share
      </button>
    </div>
    <div className="small" style={{marginTop: 8}}>Paste it in SMS, Marketplace, Craigslist, DMs—wherever.</div>
  </div>
)}

