/**
 * Contact form field-quality checks (no email, Sheets, or Turnstile calls).
 *
 * Run: npx tsx scripts/verify-contact-validation.ts
 */
import { validateContactForm } from "../lib/contact/validation"

function assert(condition: boolean, label: string) {
  if (!condition) {
    throw new Error(`FAIL  ${label}`)
  }
  console.log(`ok   ${label}`)
}

function payload(overrides: {
  name?: string
  email?: string
  subject?: string
  message?: string
} = {}) {
  return {
    name: "Alex Rivera",
    email: "alex@example.com",
    subject: "General inquiry",
    message: "I have a question about the SpeedStar Android app.",
    ...overrides,
  }
}

function rejected(overrides: Parameters<typeof payload>[0], field?: "name" | "message") {
  const result = validateContactForm(payload(overrides))
  if (result.ok) return false
  if (!field) return true
  return Boolean(result.fields[field])
}

function accepted(overrides: Parameters<typeof payload>[0] = {}) {
  return validateContactForm(payload(overrides)).ok === true
}

function run() {
  console.log("\n== Valid submissions ==")
  assert(accepted(), "typical support question passes")
  assert(
    accepted({
      name: "umar",
      message: "hello dear, i would like to contact you. Are you available",
    }),
    "short real name and conversational message pass"
  )
  assert(
    accepted({
      message: "Please help, my speed test shows 12 Mbps at home.",
    }),
    "technical message with numbers still passes"
  )
  assert(
    accepted({
      name: "Jo",
      message: "WiFi drops every few minutes at home.",
    }),
    "two-letter name and home-network report pass"
  )
  assert(
    accepted({
      message: "アプリの速度測定がうまくいきません。再試行しても同じです。",
    }),
    "non-Latin alphabetic message passes"
  )

  console.log("\n== Invalid names ==")
  assert(rejected({ name: "u" }, "name"), "single-character name rejected")
  assert(rejected({ name: "12" }, "name"), "numeric name rejected")
  assert(rejected({ name: "882911" }, "name"), "long numeric name rejected")
  assert(rejected({ name: "!!!!" }, "name"), "symbol-only name rejected")

  console.log("\n== Invalid messages ==")
  assert(
    rejected({ message: "1234567890123456" }, "message"),
    "numeric-only message rejected"
  )
  assert(
    rejected({ message: "Need help now" }, "message"),
    "message shorter than 16 characters rejected"
  )
  assert(
    rejected({ message: "51313135161dfsd65dsd5s16d5s6d" }, "message"),
    "screenshot garbage (digits mixed with letters) rejected"
  )
  assert(
    rejected({ message: ";hjklm;l16513" }, "message"),
    "keyboard-row mash rejected"
  )
  assert(
    rejected({ message: "21316865131kjgkjbkjnl5165" }, "message"),
    "digit-heavy random string rejected"
  )
  assert(
    rejected({ message: "asdfasdfasdfasdf" }, "message"),
    "repeated keyboard sequence rejected"
  )
  assert(
    rejected({ message: "!!!!!!??????!!!!" }, "message"),
    "symbol-only message rejected"
  )
  assert(
    rejected({ message: "aaaaaaaaaaaaaaaa" }, "message"),
    "repeated-character message rejected"
  )

  console.log("\nAll contact validation checks passed.")
}

run()
