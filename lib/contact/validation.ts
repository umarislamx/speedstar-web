import { contactSubjects, type ContactSubject } from "@/lib/content/contact"

import type { ContactFieldErrors, ContactFormValues } from "@/lib/contact/types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isContactSubject(value: string): value is ContactSubject {
  return (contactSubjects as readonly string[]).includes(value)
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return ""
  return value.replace(/\0/g, "").trim().slice(0, maxLength)
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
): { ok: true; data: Omit<ContactFormValues, "turnstileToken"> & { subject: ContactSubject } } | { ok: false; fields: ContactFieldErrors } {
  const name = sanitizeText(input.name, 100)
  const email = sanitizeText(input.email, 254).toLowerCase()
  const subjectRaw = sanitizeText(input.subject, 80)
  const message = sanitizeText(input.message, 5000)

  const fields: ContactFieldErrors = {}

  if (!name) {
    fields.name = "Please enter your name."
  } else if (name.length < 2) {
    fields.name = "Please enter at least 2 characters."
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
  } else if (message.length < 10) {
    fields.message = "Please enter at least 10 characters."
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
