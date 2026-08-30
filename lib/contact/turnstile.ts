type TurnstileVerifyResponse = {
  success: boolean
  "error-codes"?: string[]
}

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/** Local `next dev` only. Production and `next start` always require verification. */
export function isTurnstileVerificationOptional(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return env.NODE_ENV === "development" && !env.TURNSTILE_SECRET_KEY?.trim()
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 *
 * Production (and `next start`) fail closed: missing secret, missing token,
 * or Cloudflare rejection all block the submission.
 * Local `next dev` may skip verification only when no secret is configured,
 * so the form remains usable without Turnstile keys on a laptop.
 */
export async function verifyTurnstileToken(options: {
  token: string
  ipAddress?: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()

  if (!secret) {
    if (isTurnstileVerificationOptional()) {
      return { ok: true }
    }

    console.error(
      "[contact] TURNSTILE_SECRET_KEY is not set; rejecting submission."
    )
    return {
      ok: false,
      message: "Security verification is unavailable. Please try again later.",
    }
  }

  if (!options.token.trim()) {
    return {
      ok: false,
      message: "Please complete the security check and try again.",
    }
  }

  const body = new URLSearchParams({
    secret,
    response: options.token,
  })

  if (options.ipAddress) {
    body.set("remoteip", options.ipAddress)
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return {
        ok: false,
        message: "Security verification failed. Please try again.",
      }
    }

    const result = (await response.json()) as TurnstileVerifyResponse

    if (!result.success) {
      return {
        ok: false,
        message: "Security verification failed. Please try again.",
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: "Security verification failed. Please try again.",
    }
  }
}
