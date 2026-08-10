/** Shared checks for whether contact delivery backends are configured. */

export function isContactEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
      (process.env.CONTACT_TO_EMAIL || process.env.SUPPORT_EMAIL)
  )
}

export function isContactSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  )
}

/** Both email delivery and Google Sheets must be configured for a real submit. */
export function isContactBackendReady() {
  return isContactEmailConfigured() && isContactSheetsConfigured()
}
