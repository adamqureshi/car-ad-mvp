"use client";
export default function LeadForm({ payloadEncoded }: { payloadEncoded: string }) {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!phone && !email) {
      alert("Provide a phone or email");
      return;
    }

    const res = await fetch(`/api/send-lead`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payloadEncoded, name, phone, email, message })
    });

    const json = await res.json();
    if (json?.ok) {
      alert("Sent! The seller will contact you.");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(json?.error || "Failed to send");
    }
  }

  return (
    <form className="row" onSubmit={onSubmit}>
      <div className="h2">Leave a quick lead (emailed to seller)</div>
      <label className="small">Your name
        <input className="input" name="name" placeholder="Optional" />
      </label>
      <div className="row2">
        <label className="small">Your mobile
          <input className="input" name="phone" placeholder="Best number" />
        </label>
        <label className="small">Your email
          <input className="input" name="email" placeholder="Optional" />
        </label>
      </div>
      <label className="small">Message
        <textarea className="input" name="message" placeholder="e.g., Can I see it today?" rows={3} />
      </label>
      <button className="button" type="submit">Send Lead</button>
      <div className="small">We send your message to the seller instantly via email (Resend).</div>
    </form>
  );
}