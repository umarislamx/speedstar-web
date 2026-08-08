import { contactSubjects, type ContactSubject } from "@/lib/content/contact"

export type ContactFormValues = {
  name: string
  email: string
  subject: ContactSubject | ""
  message: string
  turnstileToken: string
}

export type ContactFieldErrors = Partial<
  Record<"name" | "email" | "subject" | "message" | "form", string>
>

export type ContactSubmission = {
  name: string
  email: string
  subject: ContactSubject
  message: string
  website: string
  userAgent?: string
  ipAddress?: string
  timestamp: string
  status: "New"
}

export type ContactApiSuccess = {
  ok: true
}

export type ContactApiError = {
  ok: false
  message: string
  fields?: ContactFieldErrors
  code?:
    | "validation"
    | "turnstile"
    | "rate_limit"
    | "not_configured"
    | "server"
    | "network"
}

export type ContactApiResponse = ContactApiSuccess | ContactApiError

export const CONTACT_SUBJECTS = contactSubjects
