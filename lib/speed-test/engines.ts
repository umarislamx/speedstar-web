import { delay, isAbortError, nowMs } from "@/lib/speed-test/async"
import {
  loadedLatencySpacingMs,
  SPEED_TEST_CONFIG,
  type SpeedTestConfig,
} from "@/lib/speed-test/config"
import type { LatencyEngine } from "@/lib/speed-test/latency-engine"
import type { PauseGate } from "@/lib/speed-test/pause-gate"
import { scoreThroughput } from "@/lib/speed-test/scoring"
import type { FetchTransport } from "@/lib/speed-test/transport"
import {
  createCounter,
  sampleThroughput,
  waitForFirstBytes,
} from "@/lib/speed-test/throughput"
import type { ServerEndpoint, ThroughputResult } from "@/lib/speed-test/types"

export async function runDownload(options: {
  endpoint: ServerEndpoint
  streams: number
  transport: FetchTransport
  pauseGate: PauseGate
  latencyEngine: LatencyEngine
  onLiveMbps: (mbps: number) => void
  onWarmupComplete?: () => void
  config?: SpeedTestConfig
  signal?: AbortSignal
}): Promise<ThroughputResult> {
  const {
    endpoint,
    streams,
    transport,
    pauseGate,
    latencyEngine,
    onLiveMbps,
    onWarmupComplete = () => undefined,
    config = SPEED_TEST_CONFIG,
    signal,
  } = options

  const durationMs = config.downloadDurationMs
  const graceMs = config.downloadGraceMs
  const startMs = nowMs()
  const total = createCounter()
  const loaded: number[] = []
  const workers: Promise<void>[] = []

  for (let index = 1; index <= streams; index += 1) {
    workers.push(
      (async () => {
        await delay(index * config.streamStaggerMs, signal)
        while (pauseGate.activeMs(startMs) < durationMs) {
          if (signal?.aborted) {
            return
          }
          await pauseGate.awaitIfPaused(signal)
          try {
            await transport.download(
              endpoint.downloadUrl,
              (bytes) => total.add(bytes),
              () =>
                !signal?.aborted && pauseGate.activeMs(startMs) < durationMs,
              signal
            )
          } catch (error) {
            if (isAbortError(error)) {
              return
            }
            await delay(200, signal)
          }
        }
      })()
    )
  }

  const loadedTarget = Math.max(config.loadedLatencySampleCount, 1)
  const loadedSpacingMs = loadedLatencySpacingMs(durationMs, graceMs, config)
  const loadedJob = (async () => {
    await delay(graceMs, signal)
    while (
      loaded.length < loadedTarget &&
      pauseGate.activeMs(startMs) < durationMs
    ) {
      if (signal?.aborted) {
        return
      }
      await pauseGate.awaitIfPaused(signal)
      const sample = await latencyEngine.probeOnce(endpoint)
      if (sample != null) {
        loaded.push(sample)
      }
      if (
        loaded.length < loadedTarget &&
        pauseGate.activeMs(startMs) < durationMs
      ) {
        await delay(loadedSpacingMs, signal)
      }
    }
  })()

  await waitForFirstBytes(
    total,
    config.downloadStartTimeoutMs,
    "download",
    signal
  )

  const pass = await sampleThroughput({
    startMs,
    durationMs,
    graceMs,
    total,
    pauseGate,
    onLiveMbps,
    onWarmupComplete,
    config,
    signal,
  })

  await Promise.allSettled([...workers, loadedJob])

  const activeMs = pauseGate.activeMs(startMs)
  const bytes = total.get()

  return {
    scoredMbps: scoreThroughput({
      samples: pass.samples,
      totalBytesConfirmed: bytes,
      bytesAtGrace: pass.bytesAtGrace,
      activeDurationMs: activeMs,
      graceMs,
      config,
    }),
    samples: pass.samples,
    totalBytesConfirmed: bytes,
    activeDurationMs: activeMs,
    streamsUsed: streams,
    loadedLatencyMs: loaded,
    bytesAtGrace: pass.bytesAtGrace,
  }
}

export function randomPayload(bytes: number): Uint8Array {
  const payload = new Uint8Array(bytes)
  const chunk = 65_536
  for (let offset = 0; offset < bytes; offset += chunk) {
    crypto.getRandomValues(payload.subarray(offset, Math.min(offset + chunk, bytes)))
  }
  return payload
}

export async function runUpload(options: {
  endpoint: ServerEndpoint
  streams: number
  transport: FetchTransport
  pauseGate: PauseGate
  latencyEngine: LatencyEngine
  onLiveMbps: (mbps: number) => void
  onWarmupComplete?: () => void
  config?: SpeedTestConfig
  signal?: AbortSignal
}): Promise<ThroughputResult> {
  const {
    endpoint,
    streams,
    transport,
    pauseGate,
    latencyEngine,
    onLiveMbps,
    onWarmupComplete = () => undefined,
    config = SPEED_TEST_CONFIG,
    signal,
  } = options

  const durationMs = config.uploadDurationMs
  const graceMs = config.uploadGraceMs
  const startMs = nowMs()
  const total = createCounter()
  const loaded: number[] = []
  const payload = randomPayload(config.uploadPostBytes)
  const workers: Promise<void>[] = []

  for (let index = 1; index <= streams; index += 1) {
    workers.push(
      (async () => {
        await delay(index * config.streamStaggerMs, signal)
        while (pauseGate.activeMs(startMs) < durationMs) {
          if (signal?.aborted) {
            return
          }
          await pauseGate.awaitIfPaused(signal)
          try {
            const result = await transport.uploadConfirmed(
              endpoint.uploadUrl,
              payload,
              signal
            )
            if (result.success) {
              total.add(result.bytesTransferred)
            } else {
              await delay(200, signal)
            }
          } catch (error) {
            if (isAbortError(error)) {
              return
            }
            await delay(200, signal)
          }
        }
      })()
    )
  }

  const loadedTarget = Math.max(config.loadedLatencySampleCount, 1)
  const loadedSpacingMs = loadedLatencySpacingMs(durationMs, graceMs, config)
  const loadedJob = (async () => {
    await delay(graceMs, signal)
    while (
      loaded.length < loadedTarget &&
      pauseGate.activeMs(startMs) < durationMs
    ) {
      if (signal?.aborted) {
        return
      }
      await pauseGate.awaitIfPaused(signal)
      const sample = await latencyEngine.probeOnce(endpoint)
      if (sample != null) {
        loaded.push(sample)
      }
      if (
        loaded.length < loadedTarget &&
        pauseGate.activeMs(startMs) < durationMs
      ) {
        await delay(loadedSpacingMs, signal)
      }
    }
  })()

  await waitForFirstBytes(
    total,
    config.downloadStartTimeoutMs,
    "upload",
    signal
  )

  const pass = await sampleThroughput({
    startMs,
    durationMs,
    graceMs,
    total,
    pauseGate,
    onLiveMbps,
    onWarmupComplete,
    config,
    signal,
  })

  await Promise.allSettled([...workers, loadedJob])

  const activeMs = pauseGate.activeMs(startMs)
  const bytes = total.get()

  return {
    scoredMbps: scoreThroughput({
      samples: pass.samples,
      totalBytesConfirmed: bytes,
      bytesAtGrace: pass.bytesAtGrace,
      activeDurationMs: activeMs,
      graceMs,
      config,
    }),
    samples: pass.samples,
    totalBytesConfirmed: bytes,
    activeDurationMs: activeMs,
    streamsUsed: streams,
    loadedLatencyMs: loaded,
    bytesAtGrace: pass.bytesAtGrace,
  }
}
