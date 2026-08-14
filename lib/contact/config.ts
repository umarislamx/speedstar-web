/** Shared checks for whether contact delivery backends are configured. */

export function isContactEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
      (process.env.CONTACT_TO_EMAIL || process.env.SUPPORT_EMAIL)
  )
}

export function isContactSheetsConfigured() {
  return Boolean(
    process.env.GCP_PROJECT_NUMBER &&
      process.env.GCP_WORKLOAD_IDENTITY_POOL_ID &&
      process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID &&
      process.env.GCP_AUDIENCE &&
      (process.env.GCP_SERVICE_ACCOUNT_EMAIL ||
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  )
}

/**
 * Email delivery is required for a successful submit.
 * Google Sheets is optional and appended best-effort when configured.
 */
export function isContactBackendReady() {
  return isContactEmailConfigured()
}
