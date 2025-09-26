# Car Ad — MVP (Gray BG / Blue Links)

One VIN → one shareable page. Seller makes a link; buyer opens and contacts fast.

## Quickstart
1) Upload these files to a GitHub repo.
2) Create a Resend account and verify a domain. Get `RESEND_API_KEY`.
3) Deploy on Vercel.

### Env Vars
- `RESEND_API_KEY` = your Resend key
- `ADMIN_EMAIL` = where a copy of all leads goes (optional but recommended)
- `NEXT_PUBLIC_BASE_URL` = your production URL (e.g., `https://car-ad-mvp.vercel.app`)

## Flow
- Seller fills the form on `/` and clicks **Create Link**.
- We build a Base64URL payload inside the URL like `/ad/eyJ2aW4iOiJ...` (no DB needed for MVP).
- Buyer sees the ad, taps **Text Seller**, **Call Seller**, **Email Seller**, or submits a lead.
- Lead emails go to the seller (and ADMIN email) via **Resend**.

> For production, move to a DB and short codes.