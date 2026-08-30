import { NextResponse } from "next/server"

import { isContactBackendReady } from "@/lib/contact/config"
import { sendContactAutoReply, sendContactNotification } from "@/lib/contact/email"
import { isHoneypotFilled } from "@/lib/contact/honeypot"
import { getContactRateLimitStore } from "@/lib/contact/rate-limit"
import { appendContactToSheet } from "@/lib/contact/sheets"
import type { ContactApiResponse, ContactSubmission } from "@/lib/contact/types"
import { verifyTurnstileToken } from "@/lib/contact/turnstile"
import { validateContactForm } from "@/lib/contact/validation"
import { contactEmail } from "@/lib/content/contact"
import { siteConfig } from "@/lib/site"

export const runtime = "nodejs"

/**
 * Prefer platform-assigned client IPs. `x-forwarded-for` is last because
 * the left-most hop can be set by the caller.
 */
function getClientIp(request: Request): string | undefined {
  const header = (name: string) => request.headers.get(name)?.split(",")[0]?.trim()

  return (
    header("cf-connecting-ip") ||
    header("x-real-ip") ||
    header("x-vercel-forwarded-for") ||
    header("x-forwarded-for") ||
    undefined
  )
}

function json(
  body: ContactApiResponse,
  status = 200,
  headers?: HeadersInit
) {
  return NextResponse.json(body, { status, headers })
}

function asRecord(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>
  }
  return {}
}

function readString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key]
  return typeof value === "string" ? value : ""
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
        code: "server",
      },
      400
    )
  }

  const payload = asRecord(body)

  // 1) Honeypot — silently discard. Do not persist or notify.
  if (isHoneypotFilled(payload)) {
    console.info("[contact] discarded honeypot submission")
    return json({ ok: true })
  }

  const ipAddress = getClientIp(request)
  const store = getContactRateLimitStore()

  // 2) Bot verification — enforced server-side (fail-closed outside `next dev`).
  const turnstile = await verifyTurnstileToken({
    token: readString(payload, "turnstileToken"),
    ipAddress,
  })

  if (!turnstile.ok) {
    return json(
      {
        ok: false,
        message: turnstile.message,
        code: "turnstile",
      },
      400
    )
  }

  // 3) Rate limit the endpoint itself (IP), before validation work.
  const ipLimit = await store.consume(`contact:ip:${ipAddress ?? "unknown"}`)

  if (!ipLimit.allowed) {
    return json(
      {
        ok: false,
        message: "Too many submissions. Please try again later.",
        code: "rate_limit",
      },
      429,
      { "Retry-After": String(ipLimit.retryAfterSeconds) }
    )
  }

  // 4) Server-side field validation.
  const validation = validateContactForm({
    name: readString(payload, "name"),
    email: readString(payload, "email"),
    subject: readString(payload, "subject"),
    message: readString(payload, "message"),
  })

  if (!validation.ok) {
    return json(
      {
        ok: false,
        message: "Please check the highlighted fields and try again.",
        fields: validation.fields,
        code: "validation",
      },
      400
    )
  }

  const emailLimit = await store.consume(
    `contact:email:${validation.data.email}`
  )

  if (!emailLimit.allowed) {
    return json(
      {
        ok: false,
        message: "Too many submissions. Please try again later.",
        code: "rate_limit",
      },
      429,
      { "Retry-After": String(emailLimit.retryAfterSeconds) }
    )
  }

  if (!isContactBackendReady()) {
    console.error(
      "[contact] RESEND_API_KEY / CONTACT_TO_EMAIL not configured; rejecting submit."
    )
    return json(
      {
        ok: false,
        message: `We couldn't send your message right now. Please email us at ${contactEmail}.`,
        code: "not_configured",
      },
      503
    )
  }

  const submission: ContactSubmission = {
    ...validation.data,
    website: siteConfig.url,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress,
    timestamp: new Date().toISOString(),
    status: "New",
  }

  try {
    await sendContactNotification(submission)
  } catch (error) {
    console.error("[contact] email notification failed", error)
    return json(
      {
        ok: false,
        message: "We couldn't send your message right now. Please try again.",
        code: "server",
      },
      500
    )
  }

  try {
    await appendContactToSheet(submission)
  } catch (error) {
    console.error("[contact] Google Sheets append failed", error)
  }

  try {
    await sendContactAutoReply(submission)
  } catch (error) {
    console.error("[contact] auto-reply failed", error)
  }

  return json({ ok: true })
}
