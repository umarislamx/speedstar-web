type TurnstileVerifyResponse = {
  success: boolean
  "error-codes"?: string[]
}

export async function verifyTurnstileToken(options: {
  token: string
  ipAddress?: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      // Allow local UI work without Turnstile credentials.
      return { ok: true }
    }

    return {
      ok: false,
      message: "Something went wrong. Please try again later.",
    }
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
