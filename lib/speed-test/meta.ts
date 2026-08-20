import { EMPTY_CLIENT_META, type ClientMeta } from "@/lib/speed-test/types"

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function parseIpWho(body: unknown): ClientMeta | null {
  if (!body || typeof body !== "object") {
    return null
  }
  const json = body as Record<string, unknown>
  if (json.success !== true) {
    return null
  }
  const conn =
    json.connection && typeof json.connection === "object"
      ? (json.connection as Record<string, unknown>)
      : {}
  const isp = asString(conn.isp) || asString(conn.org)
  const org = asString(conn.org) || asString(conn.isp)
  return {
    ip: asString(json.ip),
    isp,
    org,
    asn: String(conn.asn ?? ""),
    city: asString(json.city),
    country: asString(json.country),
    latitude: asNumber(json.latitude),
    longitude: asNumber(json.longitude),
  }
}

function parseIpApi(body: unknown): ClientMeta | null {
  if (!body || typeof body !== "object") {
    return null
  }
  const json = body as Record<string, unknown>
  if ("error" in json) {
    return null
  }
  return {
    ip: asString(json.ip),
    isp: asString(json.org),
    org: asString(json.org),
    asn: asString(json.asn),
    city: asString(json.city),
    country: asString(json.country_name),
    latitude: asNumber(json.latitude),
    longitude: asNumber(json.longitude),
  }
}

async function getJson(url: string, timeoutMs: number): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchClientMeta(timeoutMs: number): Promise<ClientMeta> {
  const ipWho = parseIpWho(await getJson("https://ipwho.is/", timeoutMs))
  if (ipWho) {
    return ipWho
  }
  return parseIpApi(await getJson("https://ipapi.co/json/", timeoutMs)) ?? EMPTY_CLIENT_META
}
