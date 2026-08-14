# speedstar-web

Official website for SpeedStar.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load **Inter Variable** as the only site typeface.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Contact form setup

The `/contact` page posts to `POST /api/contact` with this flow:

```
Form → client validation → Cloudflare Turnstile → API route
  → rate limit → server validation → Resend (notify + auto-reply)
  → Google Sheets append
```

Copy `.env.example` to `.env.local` and fill in the values below.

Resend must be configured before a submission is treated as successful. Google Sheets is appended best-effort after email send; missing Sheets config does not fail the user-facing submit.

### 1. Cloudflare Turnstile

1. Open [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Create a widget (prefer **Invisible**).
3. Add your local and production domains.
4. Set:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`

In local development, submissions still validate if Turnstile keys are missing.

### 2. Resend

1. Create an account at [Resend](https://resend.com).
2. Add and verify your sending domain.
3. Create an API key.
4. Set:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (example: `SpeedStar <contact@speedstar.xyz>`)
   - `CONTACT_TO_EMAIL` (inbox that receives new messages)

On a successful submit, Resend sends:

1. A formatted notification to `CONTACT_TO_EMAIL`
2. An auto-reply to the visitor (`We've received your message`)

### 3. Google Sheets (Vercel OIDC + Workload Identity Federation)

Production authenticates with a short-lived Vercel OIDC token. Google STS exchanges it, then impersonates the existing service account. No JSON/PEM key is used.

1. Enable **Google Sheets API**, **IAM Service Account Credentials API**, and **Security Token Service API**.
2. Create a Workload Identity Pool (`vercel`) and an OIDC provider (`vercel`) that trusts `https://oidc.vercel.com/<team-slug>`.
3. Grant the Vercel production subject **Workload Identity User** on the Sheets service account.
4. Create a spreadsheet with header row: `Timestamp | Name | Email | Subject | Message`.
5. Share the spreadsheet with the service account email (Editor).
6. Enable OIDC on the Vercel project and set Production env vars:
   - `GCP_PROJECT_NUMBER`
   - `GCP_WORKLOAD_IDENTITY_POOL_ID`
   - `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`
   - `GCP_SERVICE_ACCOUNT_EMAIL`
   - `GCP_AUDIENCE` (WIF provider default audience)
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - optional `GOOGLE_SHEETS_RANGE` (default `Sheet1!A:E`)

Local `next dev` does not receive a Vercel OIDC token, so Sheets append is skipped there. Each successful production submit appends exactly one new row (never overwrites).

### Security notes

- Never commit `.env.local` or long-lived Google credentials.
- Secrets are server-only except `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Inputs are sanitized and validated on both client and server.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Set the same environment variables in the Vercel project settings, then deploy.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
