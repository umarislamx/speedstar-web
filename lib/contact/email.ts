import { Resend } from "resend"

import { escapeHtml } from "@/lib/contact/sanitize"
import type { ContactSubmission } from "@/lib/contact/types"
import { siteConfig } from "@/lib/site"

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.name} <onboarding@resend.dev>`
  )
}

function getSupportEmail() {
  return process.env.CONTACT_TO_EMAIL ?? process.env.SUPPORT_EMAIL
}

export async function sendContactNotification(
  submission: ContactSubmission
): Promise<void> {
  const resend = getResendClient()
  const to = getSupportEmail()

  if (!resend || !to) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] Skipping notification email (missing Resend env).")
      return
    }
    throw new Error("Email configuration missing")
  }

  const rows = [
    ["Timestamp", submission.timestamp],
    ["Name", submission.name],
    ["Email", submission.email],
    ["Subject", submission.subject],
    ["Website", submission.website],
    ["User Agent", submission.userAgent ?? "—"],
    ["IP Address", submission.ipAddress ?? "—"],
  ]

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;color:#71717a;font:14px/20px Inter,Arial,sans-serif;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;color:#18181b;font:14px/20px Inter,Arial,sans-serif;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("")

  const messageHtml = escapeHtml(submission.message).replaceAll("\n", "<br />")

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [to],
    replyTo: submission.email,
    subject: `[SpeedStar Contact] ${submission.subject} — ${submission.name}`,
    html: `
      <div style="background:#fafafa;padding:32px 16px;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
          <div style="padding:24px 24px 8px;">
            <p style="margin:0;font:600 18px/28px Inter,Arial,sans-serif;color:#18181b;">New contact message</p>
            <p style="margin:8px 0 0;font:14px/20px Inter,Arial,sans-serif;color:#71717a;">A visitor submitted the SpeedStar contact form.</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-top:8px;">${htmlRows}</table>
          <div style="padding:20px 24px 28px;">
            <p style="margin:0 0 8px;font:600 14px/20px Inter,Arial,sans-serif;color:#18181b;">Message</p>
            <div style="padding:16px;border:1px solid #e4e4e7;border-radius:8px;background:#fafafa;font:14px/22px Inter,Arial,sans-serif;color:#18181b;">${messageHtml}</div>
          </div>
        </div>
      </div>
    `,
    text: [
      "New SpeedStar contact message",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
      "",
      "Message:",
      submission.message,
    ].join("\n"),
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function sendContactAutoReply(
  submission: ContactSubmission
): Promise<void> {
  const resend = getResendClient()

  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] Skipping auto-reply email (missing Resend env).")
      return
    }
    throw new Error("Email configuration missing")
  }

  const firstName = submission.name.split(/\s+/)[0] || submission.name

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [submission.email],
    subject: "We've received your message",
    html: `
      <div style="background:#fafafa;padding:32px 16px;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 16px;font:600 20px/28px Inter,Arial,sans-serif;color:#18181b;">Hi ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 12px;font:15px/24px Inter,Arial,sans-serif;color:#3f3f46;">Thank you for contacting SpeedStar.</p>
          <p style="margin:0 0 12px;font:15px/24px Inter,Arial,sans-serif;color:#3f3f46;">We've received your message successfully.</p>
          <p style="margin:0 0 12px;font:15px/24px Inter,Arial,sans-serif;color:#3f3f46;">Our team usually responds within one business day.</p>
          <p style="margin:0 0 24px;font:15px/24px Inter,Arial,sans-serif;color:#3f3f46;">We appreciate your patience and look forward to helping you.</p>
          <p style="margin:0;font:15px/24px Inter,Arial,sans-serif;color:#18181b;">Best regards,</p>
          <p style="margin:4px 0 0;font:600 15px/24px Inter,Arial,sans-serif;color:#18181b;">Team SpeedStar</p>
        </div>
      </div>
    `,
    text: [
      `Hi ${firstName},`,
      "",
      "Thank you for contacting SpeedStar.",
      "",
      "We've received your message successfully.",
      "",
      "Our team usually responds within one business day.",
      "",
      "We appreciate your patience and look forward to helping you.",
      "",
      "Best regards,",
      "Team SpeedStar",
    ].join("\n"),
  })

  if (error) {
    throw new Error(error.message)
  }
}
