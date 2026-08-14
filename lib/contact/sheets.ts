import { getVercelOidcToken } from "@vercel/oidc"
import { Common, google } from "googleapis"

import { isContactSheetsConfigured } from "@/lib/contact/config"
import type { ContactSubmission } from "@/lib/contact/types"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

type SheetsAppendResult = {
  skipped: boolean
}

function readEnv(name: string) {
  return process.env[name]?.trim() || ""
}

/**
 * STS audience must be the WIF provider resource name (`//iam.googleapis.com/...`).
 * GCP Console "default audience" includes an `https:` prefix — strip it for STS.
 */
function getStsAudience() {
  const explicit = readEnv("GCP_AUDIENCE")
  if (explicit) {
    return explicit.replace(/^https?:/, "")
  }

  const projectNumber = readEnv("GCP_PROJECT_NUMBER")
  const poolId = readEnv("GCP_WORKLOAD_IDENTITY_POOL_ID")
  const providerId = readEnv("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID")

  if (!projectNumber || !poolId || !providerId) {
    return ""
  }

  return `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`
}

function getServiceAccountEmail() {
  return (
    readEnv("GCP_SERVICE_ACCOUNT_EMAIL") ||
    readEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
  )
}

function createWorkloadIdentityClient() {
  const audience = getStsAudience()
  const serviceAccountEmail = getServiceAccountEmail()

  if (!audience || !serviceAccountEmail) {
    return null
  }

  const oidcAudience = readEnv("GCP_AUDIENCE")

  const { ExternalAccountClient } = Common

  return ExternalAccountClient.fromJSON({
    type: "external_account",
    audience,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
    scopes: [SHEETS_SCOPE],
    subject_token_supplier: {
      getSubjectToken: () =>
        oidcAudience
          ? getVercelOidcToken({ audience: oidcAudience })
          : getVercelOidcToken(),
    },
  })
}

/**
 * Appends one contact submission row to Google Sheets.
 * Columns: Timestamp | Name | Email | Subject | Message
 * Uses values.append (never overwrites existing rows).
 *
 * Auth: Vercel OIDC → Google STS → impersonate the configured service account.
 * No service-account private key is used.
 */
export async function appendContactToSheet(
  submission: ContactSubmission
): Promise<SheetsAppendResult> {
  const spreadsheetId = readEnv("GOOGLE_SHEETS_SPREADSHEET_ID")

  if (!isContactSheetsConfigured() || !spreadsheetId) {
    console.warn(
      "[contact] Google Sheets is not configured; skipping spreadsheet append."
    )
    return { skipped: true }
  }

  const auth = createWorkloadIdentityClient()

  if (!auth) {
    console.warn(
      "[contact] Google Sheets Workload Identity client could not be created; skipping spreadsheet append."
    )
    return { skipped: true }
  }

  const sheets = google.sheets({ version: "v4", auth })
  const range = readEnv("GOOGLE_SHEETS_RANGE") || "Sheet1!A:E"

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          submission.timestamp,
          submission.name,
          submission.email,
          submission.subject,
          submission.message,
        ],
      ],
    },
  })

  return { skipped: false }
}
