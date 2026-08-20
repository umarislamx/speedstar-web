import { combineSignals, isAbortError } from "@/lib/speed-test/async"
import { SPEED_TEST_CONFIG, type SpeedTestConfig } from "@/lib/speed-test/config"
import { describeError, logSpeedTestSession } from "@/lib/speed-test/debug"

export type TransportResult = {
  success: boolean
  httpCode: number
  bytesTransferred: number
  error?: string
}

const USER_AGENT = "SpeedStar/2.2 (Web; LibreSpeed-method)"

/**
 * Android OkHttp sets Cache-Control, Pragma, Accept-Encoding, Connection,
 * and User-Agent. Those are valid on native sockets.
 *
 * Browsers cannot send them to Cloudflare's speed endpoints:
 *   Access-Control-Allow-Origin: *
 *   Access-Control-Allow-Headers: content-type
 *   Access-Control-Allow-Methods: GET, POST, OPTIONS
 *
 * Cache-Control / Pragma are not CORS-safelisted, so the browser preflights.
 * Cloudflare does not echo those headers, so the GET never runs and fetch()
 * throws TypeError: Failed to fetch. Use cache: "no-store" instead.
 *
 * Node (verify scripts, no CORS) keeps the Android-aligned headers.
 */
function requestHeaders(method: "GET" | "POST"): HeadersInit {
  const inBrowser = typeof window !== "undefined"
  if (inBrowser) {
    return method === "POST"
      ? { "Content-Type": "application/octet-stream" }
      : {}
  }
  return {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Accept-Encoding": "identity",
    "User-Agent": USER_AGENT,
    ...(method === "POST" ? { "Content-Type": "application/octet-stream" } : {}),
  }
}

/**
 * Browser/Node fetch transport.
 * Ping uses a short timeout so probes never queue behind throughput.
 */
export class FetchTransport {
  private readonly config: SpeedTestConfig
  private readonly controllers = new Set<AbortController>()
  private readonly sessionId: string

  constructor(
    config: SpeedTestConfig = SPEED_TEST_CONFIG,
    sessionId = ""
  ) {
    this.config = config
    this.sessionId = sessionId
  }

  async download(
    url: string,
    onBytesRead: (bytes: number) => void,
    shouldContinue: () => boolean,
    signal?: AbortSignal
  ): Promise<TransportResult> {
    const request = this.beginRequest(this.config.callTimeoutMs, signal)
    const started = performance.now()
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        headers: requestHeaders("GET"),
        signal: request.signal,
      })
      if (!response.ok) {
        this.logFailure("download", url, started, undefined, response.status)
        return {
          success: false,
          httpCode: response.status,
          bytesTransferred: 0,
          error: `HTTP ${response.status}`,
        }
      }
      if (!response.body) {
        this.logFailure("download", url, started, new Error("empty body"), response.status)
        return {
          success: false,
          httpCode: response.status,
          bytesTransferred: 0,
          error: "empty body",
        }
      }

      const reader = response.body.getReader()
      let total = 0
      try {
        while (shouldContinue()) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          if (value && value.byteLength > 0) {
            total += value.byteLength
            onBytesRead(value.byteLength)
          }
        }
      } finally {
        await reader.cancel().catch(() => undefined)
      }

      return {
        success: true,
        httpCode: response.status,
        bytesTransferred: total,
      }
    } catch (error) {
      this.logFailure("download", url, started, error)
      if (isAbortError(error) || !shouldContinue()) {
        return { success: true, httpCode: 0, bytesTransferred: 0 }
      }
      throw error
    } finally {
      this.endRequest(request.controller)
    }
  }

  async uploadConfirmed(
    url: string,
    body: Uint8Array,
    signal?: AbortSignal
  ): Promise<TransportResult> {
    const request = this.beginRequest(this.config.callTimeoutMs, signal)
    const started = performance.now()
    try {
      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
        credentials: "omit",
        headers: requestHeaders("POST"),
        body: body as BodyInit,
        signal: request.signal,
      })
      if (response.ok) {
        await response.arrayBuffer().catch(() => undefined)
        return {
          success: true,
          httpCode: response.status,
          bytesTransferred: body.byteLength,
        }
      }
      this.logFailure("upload", url, started, undefined, response.status)
      return {
        success: false,
        httpCode: response.status,
        bytesTransferred: 0,
        error: `HTTP ${response.status}`,
      }
    } catch (error) {
      this.logFailure("upload", url, started, error)
      throw error
    } finally {
      this.endRequest(request.controller)
    }
  }

  /**
   * HTTP RTT: fetch() resolves when response headers arrive (TTFB).
   * Warmups in LatencyEngine discard cold TLS/TCP setup.
   */
  async measureRttMs(url: string, signal?: AbortSignal): Promise<number> {
    const request = this.beginRequest(this.config.pingTimeoutMs, signal)
    const started = performance.now()
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        headers: requestHeaders("GET"),
        signal: request.signal,
      })
      const rtt = performance.now() - started
      await response.body?.cancel().catch(() => undefined)
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        this.logFailure("latency", url, started, error, response.status)
        throw error
      }
      return rtt
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith("HTTP "))) {
        this.logFailure("latency", url, started, error)
      }
      throw error
    } finally {
      this.endRequest(request.controller)
    }
  }

  cancelAll() {
    for (const controller of this.controllers) {
      controller.abort()
    }
    this.controllers.clear()
  }

  close() {
    this.cancelAll()
  }

  private beginRequest(timeoutMs: number, external?: AbortSignal) {
    const controller = new AbortController()
    this.controllers.add(controller)
    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = combineSignals(
      external ? [controller.signal, timeout, external] : [controller.signal, timeout]
    )
    return { controller, signal }
  }

  private endRequest(controller: AbortController) {
    this.controllers.delete(controller)
  }

  private logFailure(
    operation: string,
    endpoint: string,
    started: number,
    error?: unknown,
    httpStatus?: number
  ) {
    const abortReason =
      error instanceof DOMException && error.name === "AbortError"
        ? String(error.message)
        : undefined
    logSpeedTestSession(this.sessionId, `${operation} request failed`, {
      operation,
      endpoint,
      httpStatus,
      elapsedMs: Math.round(performance.now() - started),
      abortReason,
      ...(error ? describeError(error) : {}),
    })
  }
}
