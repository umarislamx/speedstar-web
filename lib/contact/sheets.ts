import { google } from "googleapis"

import type { ContactSubmission } from "@/lib/contact/types"

type SheetsAppendResult = {
  skipped: boolean
}

function getServiceAccountCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  )
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  if (!email || !privateKey || !spreadsheetId) {
    return null
  }

  return { email, privateKey, spreadsheetId }
}

/**
 * Appends a contact submission row to Google Sheets.
 * Columns: Timestamp | Name | Email | Subject | Message | Status
 */
export async function appendContactToSheet(
  submission: ContactSubmission
): Promise<SheetsAppendResult> {
  const credentials = getServiceAccountCredentials()

  if (!credentials) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] Skipping Google Sheets append (missing env).")
      return { skipped: true }
    }
    throw new Error("Google Sheets configuration missing")
  }

  const auth = new google.auth.JWT({
    email: credentials.email,
    key: credentials.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  const range = process.env.GOOGLE_SHEETS_RANGE ?? "Sheet1!A:F"

  await sheets.spreadsheets.values.append({
    spreadsheetId: credentials.spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          submission.timestamp,
          submission.name,
          submission.email,
          submission.subject,
          submission.message,
          submission.status,
        ],
      ],
    },
  })

  return { skipped: false }
}
