const HONEYPOT_KEYS = [
  "hpWebsite",
  "hp_website",
  "company",
  "fax",
  "url",
  "homepage",
  "website",
] as const

/**
 * True when a bot-oriented field is populated.
 * The public form only sends `hpWebsite` as an empty string.
 */
export function isHoneypotFilled(payload: Record<string, unknown>): boolean {
  return HONEYPOT_KEYS.some((key) => {
    const value = payload[key]
    return typeof value === "string" && value.trim().length > 0
  })
}
