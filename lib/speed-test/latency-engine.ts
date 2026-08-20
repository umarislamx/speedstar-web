import { delay, isAbortError } from "@/lib/speed-test/async"
import { SPEED_TEST_CONFIG, type SpeedTestConfig } from "@/lib/speed-test/config"
import { describeError, logSpeedTestSession } from "@/lib/speed-test/debug"
import { summarizeUnloadedLatency } from "@/lib/speed-test/latency"
import type { PauseGate } from "@/lib/speed-test/pause-gate"
import type { FetchTransport } from "@/lib/speed-test/transport"
import type { LatencyResult, ServerEndpoint } from "@/lib/speed-test/types"

export class LatencyEngine {
  constructor(
    private readonly transport: FetchTransport,
    private readonly pauseGate: PauseGate,
    private readonly config: SpeedTestConfig = SPEED_TEST_CONFIG,
    private readonly signal?: AbortSignal,
    private readonly sessionId = ""
  ) {}

  async measureUnloaded(
    endpoint: ServerEndpoint,
    onSample: (ms: number) => void = () => undefined
  ): Promise<LatencyResult> {
    for (let index = 0; index < this.config.pingWarmupCount; index += 1) {
      this.ensureActive()
      try {
        await this.transport.measureRttMs(endpoint.pingUrl, this.signal)
      } catch (error) {
        if (isAbortError(error)) {
          throw error
        }
      }
      await delay(this.config.pingIntervalMs, this.signal)
    }

    const samples: number[] = []
    let failures = 0
    const attempts = this.config.pingSampleCount
    let firstError: unknown

    for (let index = 0; index < attempts; index += 1) {
      this.ensureActive()
      await this.pauseGate.awaitIfPaused(this.signal)
      try {
        const ms = await this.transport.measureRttMs(endpoint.pingUrl, this.signal)
        if (ms > this.config.pingTimeoutMs) {
          failures += 1
        } else {
          samples.push(ms)
          onSample(Math.round(ms))
        }
      } catch (error) {
        if (isAbortError(error)) {
          throw error
        }
        firstError ??= error
        failures += 1
      }
      await delay(this.config.pingIntervalMs, this.signal)
    }

    logSpeedTestSession(this.sessionId, "latency", {
      endpoint: endpoint.pingUrl,
      samples: samples.length,
      failures,
      attempts,
      ...(firstError ? describeError(firstError) : {}),
    })

    return summarizeUnloadedLatency({
      samplesMs: samples,
      failures,
      attempts,
    })
  }

  async probeOnce(endpoint: ServerEndpoint): Promise<number | null> {
    try {
      return await this.transport.measureRttMs(endpoint.pingUrl, this.signal)
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }
      return null
    }
  }

  private ensureActive() {
    if (this.signal?.aborted) {
      throw this.signal.reason ?? new DOMException("Aborted", "AbortError")
    }
  }
}
