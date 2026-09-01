/**
 * Presence/shape inspector for contact env vars.
 * Never prints secret values.
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const envPath = path.join(root, ".env.local")

if (!fs.existsSync(envPath)) {
  console.log(JSON.stringify({ exists: false }, null, 2))
  process.exit(0)
}

const raw = fs.readFileSync(envPath, "utf8")
const lines = raw.split(/\r?\n/)
const parsed = {}
const issues = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const n = i + 1
  if (!line.trim() || line.trim().startsWith("#")) continue

  // Detect export prefix / leading spaces on key
  if (/^\s*export\s+/.test(line)) {
    issues.push({ line: n, issue: "uses_export_prefix" })
  }

  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
  if (!m) {
    issues.push({
      line: n,
      issue: "unparseable_line",
      startsWith: line.slice(0, 24).replace(/[^\x20-\x7E]/g, "?"),
    })
    continue
  }

  const key = m[1]
  let val = m[2]
  let quoted = null

  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    quoted = val[0]
    val = val.slice(1, -1)
  }

  // Inline comments for unquoted values (dotenv behavior)
  if (!quoted && val.includes(" #")) {
    issues.push({ line: n, key, issue: "possible_inline_comment" })
  }

  parsed[key] = {
    present: true,
    empty: val.trim().length === 0,
    length: val.length,
    quoted: Boolean(quoted),
    hasAngleBrackets: /[<>]/.test(val),
    hasAt: val.includes("@"),
    looksLikeBareEmail: /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(val.trim()),
    looksLikeFromHeader: /.+<[^>]+@[^>]+>/.test(val.trim()),
    startsWithRe:
      key === "RESEND_API_KEY" ? val.trim().startsWith("re_") : undefined,
    containsContactAtSpeedstar: /contact@speedstar\.xyz/i.test(val),
    looksLikePlaceholder: /your_|changeme|example|paste|TODO|\bxxx\b|<my email>/i.test(
      val
    ),
    hasSurroundingWhitespace: val !== val.trim(),
  }
}

const required = ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "CONTACT_TO_EMAIL"]

const report = {
  exists: true,
  byteLength: Buffer.byteLength(raw),
  hasBOM: raw.charCodeAt(0) === 0xfeff,
  lineCount: lines.length,
  keysFound: Object.keys(parsed),
  required: Object.fromEntries(
    required.map((k) => [k, parsed[k] || { present: false }])
  ),
  issues,
  wouldPassEmailConfigured: Boolean(
    parsed.RESEND_API_KEY &&
      !parsed.RESEND_API_KEY.empty &&
      ((parsed.CONTACT_TO_EMAIL && !parsed.CONTACT_TO_EMAIL.empty) ||
        (parsed.SUPPORT_EMAIL && !parsed.SUPPORT_EMAIL.empty))
  ),
}

console.log(JSON.stringify(report, null, 2))
