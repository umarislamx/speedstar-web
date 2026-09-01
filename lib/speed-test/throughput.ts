import { delay, nowMs, SpeedTestRunException } from "@/lib/speed-test/async"
import { SPEED_TEST_CONFIG, type SpeedTestConfig } from "@/lib/speed-test/config"
import type { PauseGate } from "@/lib/speed-test/pause-gate"
import {
  cumulativeMbps,
  instantaneousMbps,
} from "@/lib/speed-test/scoring"
import type { ThroughputSample } from "@/lib/speed-test/types"

export type SamplePass = {
  samples: ThroughputSample[]
  bytesAtGrace: number
}

export async function waitForFirstBytes(
  total: { get(): number },
  timeoutMs: number,
  phase: "download" | "upload",
  signal?: AbortSignal
): Promise<void> {
  const deadline = nowMs() + timeoutMs
  while (nowMs() < deadline) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException("Aborted", "AbortError")
    }
    if (total.get() > 0) {
      return
    }
    await delay(50, signal)
  }
  if (total.get() === 0) {
    const message =
      phase === "download"
        ? `Download never started — no bytes received within ${timeoutMs}ms`
        : `Upload never started — no confirmed bytes within ${timeoutMs}ms`
    throw new SpeedTestRunException(phase, message, `${phase}_start_timeout`)
  }
}

export async function sampleThroughput({
  startMs,
  durationMs,
  graceMs,
  total,
  pauseGate,
  onLiveMbps,
  onWarmupComplete,
  config = SPEED_TEST_CONFIG,
  signal,
}: {
  startMs: number
  durationMs: number
  graceMs: number
  total: { get(): number }
  pauseGate: PauseGate
  onLiveMbps: (mbps: number) => void
  onWarmupComplete: () => void
  config?: SpeedTestConfig
  signal?: AbortSignal
}): Promise<SamplePass> {
  const samples: ThroughputSample[] = []
  let lastActiveMs = 0
  let lastBytes = 0
  let bytesAtGrace = 0
  let graceCaptured = false
  let warmupNotified = false

  while (pauseGate.activeMs(startMs) < durationMs) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException("Aborted", "AbortError")
    }
    await delay(config.sampleIntervalMs, signal)
    if (await pauseGate.awaitIfPaused(signal)) {
      lastActiveMs = pauseGate.activeMs(startMs)
      lastBytes = total.get()
      continue
    }

    const activeMs = pauseGate.activeMs(startMs)
    const bytes = total.get()

    if (!graceCaptured && activeMs >= graceMs) {
      bytesAtGrace = bytes
      graceCaptured = true
      if (!warmupNotified) {
        warmupNotified = true
        onWarmupComplete()
      }
    }

    if (graceCaptured) {
      const liveMbps = cumulativeMbps(
        bytes - bytesAtGrace,
        activeMs - graceMs,
        config.graphSettleMs
      )
      if (liveMbps > 0) {
        onLiveMbps(liveMbps)
      }

      const deltaMs = activeMs - lastActiveMs
      const deltaBytes = bytes - lastBytes
      if (deltaMs >= 50 && deltaBytes > 0) {
        samples.push({
          mbps: instantaneousMbps(deltaBytes, deltaMs),
          activeElapsedMs: activeMs,
        })
        lastActiveMs = activeMs
        lastBytes = bytes
      }
    } else {
      lastActiveMs = activeMs
      lastBytes = bytes
    }
  }

  return {
    samples,
    bytesAtGrace: graceCaptured ? bytesAtGrace : total.get(),
  }
}

export function createCounter() {
  let value = 0
  return {
    add(amount: number) {
      value += amount
    },
    get() {
      return value
    },
  }
}
