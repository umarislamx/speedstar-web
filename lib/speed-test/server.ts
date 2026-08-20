import { combineSignals } from "@/lib/speed-test/async"
import {
  CLOUDFLARE_ENDPOINTS,
  createCloudflareEndpoint,
} from "@/lib/speed-test/cloudflare"
import { SPEED_TEST_CONFIG } from "@/lib/speed-test/config"
import type { ServerEndpoint } from "@/lib/speed-test/types"

export async function resolveCloudflareEndpoint(
  signal?: AbortSignal
): Promise<ServerEndpoint> {
  const colo = await fetchColo(signal)
  return createCloudflareEndpoint(colo)
}

async function fetchColo(signal?: AbortSignal): Promise<string> {
  try {
    const response = await fetch(CLOUDFLARE_ENDPOINTS.traceUrl, {
      cache: "no-store",
      credentials: "omit",
      signal: combineSignals(
        signal
          ? [signal, AbortSignal.timeout(SPEED_TEST_CONFIG.coloFetchTimeoutMs)]
          : [AbortSignal.timeout(SPEED_TEST_CONFIG.coloFetchTimeoutMs)]
      ),
    })
    if (!response.ok) {
      return ""
    }
    const body = await response.text()
    const line = body.split("\n").find((entry) => entry.startsWith("colo="))
    return line?.slice("colo=".length).trim().toUpperCase() ?? ""
  } catch {
    return ""
  }
}
