/**
 * Security checks for the contact form (validation, honeypot, rate limit,
 * Turnstile fail-closed). Does not send email or write to Sheets.
 *
 * Run: npx tsx scripts/verify-contact-security.ts
 */
import { isHoneypotFilled } from "../lib/contact/honeypot"
import { createMemoryRateLimitStore } from "../lib/contact/rate-limit/memory"
import {
  isTurnstileVerificationOptional,
  verifyTurnstileToken,
} from "../lib/contact/turnstile"
import { validateContactForm } from "../lib/contact/validation"

function assert(condition: boolean, label: string) {
  if (!condition) {
    throw new Error(`FAIL  ${label}`)
  }
  console.log(`ok   ${label}`)
}

function validPayload() {
  return {
    name: "Alex Rivera",
    email: "alex@example.com",
    subject: "General inquiry" as const,
    message: "I have a question about the SpeedStar Android app.",
  }
}

async function run() {
  console.log("\n== Validation ==")

  const legitimate = validateContactForm(validPayload())
  assert(legitimate.ok === true, "legitimate submission passes")

  const empty = validateContactForm({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  assert(empty.ok === false, "empty fields rejected")

  const badEmail = validateContactForm({
    ...validPayload(),
    email: "not-an-email",
  })
  assert(badEmail.ok === false && Boolean(badEmail.fields.email), "invalid email rejected")

  const numeric = validateContactForm({
    ...validPayload(),
    message: "1234567890",
  })
  assert(numeric.ok === false, "numeric-only message rejected")

  const garbageName = validateContactForm({
    ...validPayload(),
    name: "882911",
  })
  assert(garbageName.ok === false, "numeric name rejected")

  const badSubject = validateContactForm({
    ...validPayload(),
    subject: "Free crypto",
  })
  assert(badSubject.ok === false, "subject not on the allow-list rejected")

  console.log("\n== Honeypot ==")
  assert(!isHoneypotFilled({ hpWebsite: "" }), "empty honeypot allowed")
  assert(isHoneypotFilled({ hpWebsite: "https://spam.test" }), "hpWebsite filled")
  assert(isHoneypotFilled({ website: "http://bot.test" }), "website extra field filled")
  assert(isHoneypotFilled({ company: "Acme" }), "company extra field filled")

  console.log("\n== Rate limit ==")
  const store = createMemoryRateLimitStore({ limit: 5, windowMs: 60_000 })
  const key = "contact:ip:203.0.113.10"
  const results = []
  for (let i = 0; i < 6; i += 1) {
    results.push(await store.consume(key))
  }
  assert(
    results.slice(0, 5).every((result) => result.allowed),
    "first 5 requests allowed"
  )
  assert(results[5].allowed === false, "6th request in the window blocked")

  console.log("\n== Turnstile ==")
  assert(
    isTurnstileVerificationOptional({ NODE_ENV: "development" }),
    "development without secret may skip Turnstile"
  )
  assert(
    !isTurnstileVerificationOptional({ NODE_ENV: "production" }),
    "production without secret must not skip Turnstile"
  )
  assert(
    !isTurnstileVerificationOptional({
      NODE_ENV: "development",
      TURNSTILE_SECRET_KEY: "set",
    }),
    "secret present always requires verification"
  )

  const previousSecret = process.env.TURNSTILE_SECRET_KEY
  process.env.TURNSTILE_SECRET_KEY = "test-secret"
  const missingToken = await verifyTurnstileToken({ token: "" })
  assert(missingToken.ok === false, "configured Turnstile rejects empty token")

  if (previousSecret === undefined) {
    delete process.env.TURNSTILE_SECRET_KEY
  } else {
    process.env.TURNSTILE_SECRET_KEY = previousSecret
  }

  console.log("\nAll contact security checks passed.")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
