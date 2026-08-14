type TurnstileVerifyResponse = {
  success: boolean
  "error-codes"?: string[]
}

/**
 * Verifies a Cloudflare Turnstile token when Turnstile is configured.
 * If TURNSTILE_SECRET_KEY is unset, verification is skipped so the contact
 * form can still work (rate limiting still applies).
 */
export async function verifyTurnstileToken(options: {
  token: string
  ipAddress?: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    // Turnstile is optional. Do not block submissions when it is not configured.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[contact] TURNSTILE_SECRET_KEY is not set; skipping Turnstile verification."
      )
    }
    return { ok: true }
  }

  if (!options.token) {
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
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    )

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
