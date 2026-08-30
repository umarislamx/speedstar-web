import { contactSubjects, type ContactSubject } from "@/lib/content/contact"

import type { ContactFieldErrors, ContactFormValues } from "@/lib/contact/types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REPEATED_CHAR_PATTERN = /(.)\1{7,}/u

export const CONTACT_NAME_MAX = 100
export const CONTACT_EMAIL_MAX = 254
export const CONTACT_MESSAGE_MIN = 10
export const CONTACT_MESSAGE_MAX = 5000
export const CONTACT_NAME_MIN_LETTERS = 2
export const CONTACT_MESSAGE_MIN_LETTERS = 6

export function isContactSubject(value: string): value is ContactSubject {
  return (contactSubjects as readonly string[]).includes(value)
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return ""
  return value.replace(/\0/g, "").trim().slice(0, maxLength)
}

export function countLetters(value: string): number {
  let count = 0
  for (const char of value) {
    if (/\p{L}/u.test(char)) count += 1
  }
  return count
}

export function isMostlyNumeric(value: string): boolean {
  const compact = value.replace(/\s+/g, "")
  if (!compact) return false
  const digits = (compact.match(/\d/g) ?? []).length
  return digits / compact.length >= 0.7
}

type ContactFormInput = {
  name?: string
  email?: string
  subject?: string
  message?: string
  turnstileToken?: string
}

export function validateContactForm(
  input: ContactFormInput
):
  | {
      ok: true
      data: Omit<ContactFormValues, "turnstileToken" | "hpWebsite"> & {
        subject: ContactSubject
      }
    }
  | { ok: false; fields: ContactFieldErrors } {
  const name = sanitizeText(input.name, CONTACT_NAME_MAX)
  const email = sanitizeText(input.email, CONTACT_EMAIL_MAX).toLowerCase()
  const subjectRaw = sanitizeText(input.subject, 80)
  const message = sanitizeText(input.message, CONTACT_MESSAGE_MAX)

  const fields: ContactFieldErrors = {}

  if (!name) {
    fields.name = "Please enter your name."
  } else if (name.length < 2) {
    fields.name = "Please enter at least 2 characters."
  } else if (countLetters(name) < CONTACT_NAME_MIN_LETTERS || isMostlyNumeric(name)) {
    fields.name = "Please enter a valid name."
  } else if (REPEATED_CHAR_PATTERN.test(name)) {
    fields.name = "Please enter a valid name."
  }

  if (!email) {
    fields.email = "Please enter your email address."
  } else if (!EMAIL_PATTERN.test(email)) {
    fields.email = "Please enter a valid email address."
  }

  if (!subjectRaw || !isContactSubject(subjectRaw)) {
    fields.subject = "Please select a subject."
  }

  if (!message) {
    fields.message = "Please enter your message."
  } else if (message.length < CONTACT_MESSAGE_MIN) {
    fields.message = "Please enter at least 10 characters."
  } else if (
    countLetters(message) < CONTACT_MESSAGE_MIN_LETTERS ||
    isMostlyNumeric(message)
  ) {
    fields.message = "Please enter a more detailed message."
  } else if (REPEATED_CHAR_PATTERN.test(message)) {
    fields.message = "Please enter a more detailed message."
  }

  if (!name && !email && !message) {
    fields.form = "Please enter your details before submitting."
  }

  if (Object.keys(fields).length > 0) {
    return { ok: false, fields }
  }

  return {
    ok: true,
    data: {
      name,
      email,
      subject: subjectRaw as ContactSubject,
      message,
    },
  }
}
