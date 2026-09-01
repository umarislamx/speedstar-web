import { contactSubjects, type ContactSubject } from "@/lib/content/contact"

import type { ContactFieldErrors, ContactFormValues } from "@/lib/contact/types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REPEATED_CHAR_PATTERN = /(.)\1{7,}/u
const LATIN_LETTER_PATTERN = /[a-z]/gi
const LATIN_VOWEL_PATTERN = /[aeiouy]/gi
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"] as const

export const CONTACT_NAME_MAX = 100
export const CONTACT_EMAIL_MAX = 254
export const CONTACT_MESSAGE_MIN = 16
export const CONTACT_MESSAGE_MAX = 5000
export const CONTACT_NAME_MIN_LETTERS = 2
export const CONTACT_MESSAGE_MIN_LETTERS = 10
export const CONTACT_MESSAGE_MIN_LETTER_RATIO = 0.45
export const CONTACT_MOSTLY_NUMERIC_RATIO = 0.55

export function isContactSubject(value: string): value is ContactSubject {
  return (contactSubjects as readonly string[]).includes(value)
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return ""
  return value.replace(/\0/g, "").trim().slice(0, maxLength)
}

export function compactText(value: string): string {
  return value.replace(/\s+/g, "")
}

export function countLetters(value: string): number {
  let count = 0
  for (const char of value) {
    if (/\p{L}/u.test(char)) count += 1
  }
  return count
}

export function letterRatio(value: string): number {
  const compact = compactText(value)
  if (!compact) return 0
  return countLetters(compact) / compact.length
}

export function digitRatio(value: string): number {
  const compact = compactText(value)
  if (!compact) return 0
  return (compact.match(/\d/g) ?? []).length / compact.length
}

export function isMostlyNumeric(value: string): boolean {
  return digitRatio(value) >= CONTACT_MOSTLY_NUMERIC_RATIO
}

export function hasTooFewLatinVowels(value: string): boolean {
  const latinLetters = value.match(LATIN_LETTER_PATTERN)?.length ?? 0
  if (latinLetters < 8) return false

  const vowels = value.match(LATIN_VOWEL_PATTERN)?.length ?? 0
  return vowels / latinLetters < 0.18
}

export function containsKeyboardSequence(value: string, minLength = 4): boolean {
  const compact = compactText(value).toLowerCase()
  if (compact.length < minLength) return false

  for (const row of KEYBOARD_ROWS) {
    const reversed = [...row].reverse().join("")
    for (const source of [row, reversed]) {
      for (let start = 0; start <= source.length - minLength; start += 1) {
        if (compact.includes(source.slice(start, start + minLength))) {
          return true
        }
      }
    }
  }

  return false
}

export function hasLowCharacterVariety(value: string): boolean {
  const compact = compactText(value).toLowerCase()
  if (compact.length < CONTACT_MESSAGE_MIN) return false
  return new Set(compact).size / compact.length < 0.22
}

export function looksLikeGarbageMessage(value: string): boolean {
  return (
    countLetters(value) < CONTACT_MESSAGE_MIN_LETTERS ||
    letterRatio(value) < CONTACT_MESSAGE_MIN_LETTER_RATIO ||
    isMostlyNumeric(value) ||
    hasTooFewLatinVowels(value) ||
    containsKeyboardSequence(value) ||
    hasLowCharacterVariety(value) ||
    REPEATED_CHAR_PATTERN.test(value)
  )
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
    fields.message = `Please enter at least ${CONTACT_MESSAGE_MIN} characters.`
  } else if (looksLikeGarbageMessage(message)) {
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
