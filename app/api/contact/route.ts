import { NextResponse } from "next/server"

import { sendContactAutoReply, sendContactNotification } from "@/lib/contact/email"
import { getContactRateLimitStore } from "@/lib/contact/rate-limit"
import { appendContactToSheet } from "@/lib/contact/sheets"
import type { ContactApiResponse, ContactSubmission } from "@/lib/contact/types"
import { verifyTurnstileToken } from "@/lib/contact/turnstile"
import { validateContactForm } from "@/lib/contact/validation"
import { siteConfig } from "@/lib/site"

export const runtime = "nodejs"

function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || undefined
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    undefined
  )
}

function json(body: ContactApiResponse, status = 200) {
  return NextResponse.json(body, { status })
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

  const payload = (body ?? {}) as Record<string, unknown>
  const validation = validateContactForm({
    name: typeof payload.name === "string" ? payload.name : "",
    email: typeof payload.email === "string" ? payload.email : "",
    subject: typeof payload.subject === "string" ? payload.subject : "",
    message: typeof payload.message === "string" ? payload.message : "",
    turnstileToken:
      typeof payload.turnstileToken === "string" ? payload.turnstileToken : "",
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

  const ipAddress = getClientIp(request)
  const rateLimitKey = `contact:${ipAddress ?? "unknown"}`
  const rateLimit = await getContactRateLimitStore().consume(rateLimitKey)

  if (!rateLimit.allowed) {
    return json(
      {
        ok: false,
        message: "Too many submissions. Please try again later.",
        code: "rate_limit",
      },
      429
    )
  }

  const turnstileToken =
    typeof payload.turnstileToken === "string" ? payload.turnstileToken : ""
  const turnstile = await verifyTurnstileToken({
    token: turnstileToken,
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

  const submission: ContactSubmission = {
    ...validation.data,
    website: siteConfig.url,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress,
    timestamp: new Date().toISOString(),
    status: "New",
  }

  try {
    // Prefer notifying support + logging first; auto-reply is best-effort after.
    await Promise.all([
      sendContactNotification(submission),
      appendContactToSheet(submission),
    ])
    await sendContactAutoReply(submission)
  } catch (error) {
    console.error("[contact] submission failed", error)
    return json(
      {
        ok: false,
        message:
          "We couldn't send your message right now. Please try again in a moment.",
        code: "server",
      },
      500
    )
  }

  return json({ ok: true })
}
