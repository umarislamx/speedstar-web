import {
  delay,
  isAbortError,
  SpeedTestRunException,
} from "@/lib/speed-test/async"
import { withDownloadBytes } from "@/lib/speed-test/cloudflare"
import { SPEED_TEST_CONFIG, type SpeedTestConfig } from "@/lib/speed-test/config"
import { logSpeedTestSession } from "@/lib/speed-test/debug"
import { runDownload, runUpload } from "@/lib/speed-test/engines"
import { LatencyEngine } from "@/lib/speed-test/latency-engine"
import { fromMbpsSamples } from "@/lib/speed-test/measurements"
import { fetchClientMeta } from "@/lib/speed-test/meta"
import { PauseGate } from "@/lib/speed-test/pause-gate"
import type { OrchestratedResult } from "@/lib/speed-test/result-builder"
import { resolveCloudflareEndpoint } from "@/lib/speed-test/server"
import { FetchTransport } from "@/lib/speed-test/transport"
import {
  EMPTY_CLIENT_META,
  type ClientMeta,
  type ServerEndpoint,
  type TestingPhase,
} from "@/lib/speed-test/types"
import {
  validateDownload,
  validateLatency,
  validateUpload,
} from "@/lib/speed-test/validation"

export type OrchestratorCallbacks = {
  onPhase: (phase: TestingPhase, isp: string, server: string) => void
  onPing: (ping: number) => void
  onLatencyStats: (
    pingMs: number,
    jitterMs: number,
    packetLossPercent: number
  ) => void
  onDownload: (mbps: number) => void
  onUpload: (mbps: number) => void
}

export class SpeedTestOrchestrator {
  private readonly config: SpeedTestConfig
  private readonly signal?: AbortSignal
  readonly sessionId: string
  readonly pauseGate = new PauseGate()
  readonly transport: FetchTransport

  constructor(
    config: SpeedTestConfig = SPEED_TEST_CONFIG,
    signal?: AbortSignal,
    sessionId = ""
  ) {
    this.config = config
    this.signal = signal
    this.sessionId = sessionId
    this.transport = new FetchTransport(config, sessionId)
  }

  get isPaused() {
    return this.pauseGate.paused
  }

  pause() {
    this.pauseGate.pause()
  }

  resume() {
    this.pauseGate.resume()
  }

  abort() {
    this.pauseGate.reset()
    this.transport.cancelAll()
  }

  close() {
    this.abort()
    this.transport.close()
  }

  async run(callbacks: OrchestratorCallbacks): Promise<OrchestratedResult> {
    this.abort()
    const latencyEngine = new LatencyEngine(
      this.transport,
      this.pauseGate,
      this.config,
      this.signal,
      this.sessionId
    )

    logSpeedTestSession(this.sessionId, "connecting")
    callbacks.onPhase("connecting", "Detecting...", "Connecting...")

    let meta: ClientMeta = EMPTY_CLIENT_META
    const metaPromise = fetchClientMeta(this.config.metaTimeoutMs)
      .then((value) => {
        meta = value
        return value
      })
      .catch(() => EMPTY_CLIENT_META)

    try {
      const endpoint = await resolveCloudflareEndpoint(this.signal)
      const connectStartedAt = performance.now()
      logSpeedTestSession(this.sessionId, "latency", {
        endpoint: endpoint.pingUrl,
        colo: endpoint.regionTag,
      })
      const latency = await latencyEngine.measureUnloaded(
        endpoint,
        callbacks.onPing
      )
      const pingCheck = validateLatency(latency, this.config)
      if (!pingCheck.ok) {
        throw new SpeedTestRunException("ping", pingCheck.reason, pingCheck.reason)
      }

      callbacks.onLatencyStats(
        Math.round(latency.minMs),
        Math.round(latency.jitterMs),
        latency.failedProbePercent
      )

      const connectingMs = performance.now() - connectStartedAt
      if (connectingMs < this.config.minConnectingMs) {
        await delay(this.config.minConnectingMs - connectingMs, this.signal)
      }

      let isp = meta.isp || "Unknown ISP"
      logSpeedTestSession(this.sessionId, "download")
      callbacks.onPhase("preparing_download", isp, endpoint.displayName)

      const download = await this.runDownloadWithRetry(
        endpoint,
        latencyEngine,
        callbacks.onDownload,
        () => callbacks.onPhase("download", isp, endpoint.displayName)
      )
      const dlCheck = validateDownload(download, this.config)
      if (!dlCheck.ok) {
        throw new SpeedTestRunException(
          "download",
          dlCheck.reason,
          dlCheck.reason
        )
      }

      logSpeedTestSession(this.sessionId, "upload")
      callbacks.onPhase("preparing_upload", isp, endpoint.displayName)
      const upload = await runUpload({
        endpoint,
        streams: this.config.uploadStreams,
        transport: this.transport,
        pauseGate: this.pauseGate,
        latencyEngine,
        onLiveMbps: callbacks.onUpload,
        onWarmupComplete: () =>
          callbacks.onPhase("upload", isp, endpoint.displayName),
        config: this.config,
        signal: this.signal,
      })
      const ulCheck = validateUpload(upload, this.config)
      if (!ulCheck.ok) {
        throw new SpeedTestRunException("upload", ulCheck.reason, ulCheck.reason)
      }

      meta = await metaPromise
      isp = meta.isp || isp
      logSpeedTestSession(this.sessionId, "completed", {
        pingMs: Math.round(latency.minMs),
        downloadMbps: download.scoredMbps,
        uploadMbps: upload.scoredMbps,
      })

      return {
        meta,
        endpoint,
        colo: endpoint.regionTag,
        latency,
        download,
        upload,
        downloadMeasurements: fromMbpsSamples(
          download.samples.map((sample) => sample.mbps),
          "download"
        ),
        uploadMeasurements: fromMbpsSamples(
          upload.samples.map((sample) => sample.mbps),
          "upload"
        ),
      }
    } catch (error) {
      logSpeedTestSession(this.sessionId, "failed", {
        ...(error instanceof SpeedTestRunException
          ? { phase: error.phase, failureReason: error.failureReason }
          : {}),
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
      })
      this.transport.cancelAll()
      throw error
    }
  }

  private async runDownloadWithRetry(
    endpoint: ServerEndpoint,
    latencyEngine: LatencyEngine,
    onDownload: (mbps: number) => void,
    onWarmupComplete: () => void
  ) {
    let lastError: unknown
    for (let attempt = 0; attempt <= this.config.downloadMaxRetries; attempt += 1) {
      if (attempt > 0) {
        this.transport.cancelAll()
        await delay(500, this.signal)
      }
      const streams =
        attempt === 0
          ? this.config.downloadStreams
          : this.config.downloadStreamsRetry
      const runEndpoint =
        attempt === 0
          ? endpoint
          : withDownloadBytes(endpoint, this.config.downloadRequestBytesRetry)
      try {
        return await runDownload({
          endpoint: runEndpoint,
          streams,
          transport: this.transport,
          pauseGate: this.pauseGate,
          latencyEngine,
          onLiveMbps: onDownload,
          onWarmupComplete,
          config: this.config,
          signal: this.signal,
        })
      } catch (error) {
        if (isAbortError(error)) {
          throw error
        }
        lastError = error
        if (attempt >= this.config.downloadMaxRetries) {
          throw error
        }
      }
    }
    throw (
      lastError ??
      new SpeedTestRunException("download", "Download failed", "download_failed")
    )
  }
}
