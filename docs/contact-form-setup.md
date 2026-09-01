# Contact form setup

Production contact submissions go through `POST /api/contact`:

```
Honeypot → Turnstile (server) → rate limit → validation → Resend → Google Sheets
```

Rejected or discarded submissions are never emailed and never appended to the spreadsheet.

## 1. Cloudflare Turnstile (required in production)

Without `TURNSTILE_SECRET_KEY`, production (Vercel and `next start`) **rejects every submit**. That is intentional so the public endpoint cannot be called with raw JSON.

1. Sign in at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. **Add widget**.
3. Widget mode: **Invisible** (matches the site UI).
4. Hostnames:
   - Production site host (example: `www.speedstar.app` and the apex if you use it)
   - `localhost` only if you want the widget while running `next dev`
5. Copy the **site key** and **secret key**.
6. In Vercel → Project → Settings → Environment Variables, set:

   | Name | Environment | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Production (and Preview) | Public. Safe in the browser bundle. |
   | `TURNSTILE_SECRET_KEY` | Production (and Preview) | Server-only. Never commit to Git. |

7. Redeploy the production deployment after saving the variables.

Local `.env.local` may leave both empty. The API only skips Turnstile when `NODE_ENV=development`.

## 2. Resend

Required for a successful submit.

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (verified sender, e.g. `SpeedStar <contact@speedstar.xyz>`)
- `CONTACT_TO_EMAIL` (inbox for new messages)

## 3. Google Sheets (optional)

Same Workload Identity Federation setup as before. Missing Sheets config does not fail the user-facing submit.

## 4. What you do not need to change

- No Google Apps Script webhook
- No Formspree / EmailJS / Firebase
- No service-account private key in the repo
