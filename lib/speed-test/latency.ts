import { SPEED_TEST_CONFIG } from "@/lib/speed-test/config"
import type { LatencyResult } from "@/lib/speed-test/types"

/**
 * Drop probes skewed by TCP/TLS setup or contention.
 * Port of Android `LatencyEngine.filterOutliers`.
 */
export function filterOutliers(samples: number[]): number[] {
  if (samples.length < 3) {
    return samples
  }

  const min = Math.min(...samples)
  const ceiling = min * 3 + 50
  return samples.filter((sample) => sample <= ceiling)
}

export function median(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

/**
 * Mean consecutive absolute delta.
 * Port of Android `LatencyEngine.jitter`.
 */
export function jitter(values: number[]): number {
  if (values.length < 2) {
    return 0
  }

  let sum = 0
  for (let index = 1; index < values.length; index += 1) {
    sum += Math.abs((values[index] ?? 0) - (values[index - 1] ?? 0))
  }

  return sum / (values.length - 1)
}

/**
 * Summarize unloaded HTTP probes into the Android LatencyResult shape.
 * Headline ping = minimum RTT on outlier-filtered samples.
 */
export function summarizeUnloadedLatency({
  samplesMs,
  failures,
  attempts = SPEED_TEST_CONFIG.pingSampleCount,
}: {
  samplesMs: number[]
  failures: number
  attempts?: number
}): LatencyResult {
  const filtered = filterOutliers(samplesMs)
  const scoreSource = filtered.length > 0 ? filtered : samplesMs
  const jitterSource = filtered.length >= 2 ? filtered : samplesMs
  const lossAttempts = Math.max(attempts, 1)
  const lossPercent = Math.min(
    100,
    Math.max(0, (failures / lossAttempts) * 100)
  )

  return {
    samplesMs,
    minMs: scoreSource.length > 0 ? Math.min(...scoreSource) : 0,
    medianMs: median(scoreSource),
    jitterMs: jitter(jitterSource),
    failedProbePercent: lossPercent,
    probeAttempts: attempts,
    probeSuccesses: samplesMs.length,
  }
}
