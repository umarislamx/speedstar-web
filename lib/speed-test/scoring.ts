import { SPEED_TEST_CONFIG, type SpeedTestConfig } from "@/lib/speed-test/config"
import type { ThroughputSample } from "@/lib/speed-test/types"

/**
 * Port of Android `ThroughputScorer`.
 *
 * Primary score = confirmed bytes transferred AFTER grace / post-grace seconds.
 * Decimal megabits: bytes × 8 / seconds / 1_000_000 (not 1_048_576).
 */
export function scoreThroughput({
  samples,
  totalBytesConfirmed,
  bytesAtGrace,
  activeDurationMs,
  graceMs,
  config = SPEED_TEST_CONFIG,
}: {
  samples: ThroughputSample[]
  totalBytesConfirmed: number
  bytesAtGrace: number
  activeDurationMs: number
  graceMs: number
  config?: SpeedTestConfig
}): number {
  const measuredMs = Math.max(activeDurationMs - graceMs, 1)
  const measuredBytes = Math.max(totalBytesConfirmed - bytesAtGrace, 0)
  if (measuredBytes <= 0) {
    return 0
  }

  const seconds = measuredMs / 1_000
  const fromBytes = (measuredBytes * 8) / 1_000_000 / seconds

  const postGrace = samples.filter(
    (sample) => sample.activeElapsedMs >= graceMs && sample.mbps > 0
  )
  const fromSamples = trimmedMean(
    postGrace.map((sample) => sample.mbps),
    config.scorerTrimFraction
  )

  if (
    fromSamples > 0 &&
    fromSamples >= fromBytes * 0.7 &&
    fromSamples <= fromBytes * 1.1
  ) {
    return fromBytes * 0.85 + fromSamples * 0.15
  }

  return fromBytes
}

/** Mbps = (bytes × 8) / seconds / 1_000_000 */
export function instantaneousMbps(bytesDelta: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || bytesDelta <= 0) {
    return 0
  }

  const seconds = elapsedMs / 1_000
  return (bytesDelta * 8) / 1_000_000 / seconds
}

/**
 * Live cumulative rate over the measured (post-grace) window only.
 * Returns 0 until `minLiveMs` of post-grace data exists.
 */
export function cumulativeMbps(
  measuredBytes: number,
  measuredMs: number,
  minLiveMs: number = SPEED_TEST_CONFIG.liveCumulativeMinMs
): number {
  if (measuredBytes <= 0 || measuredMs < minLiveMs) {
    return 0
  }

  const seconds = measuredMs / 1_000
  return (measuredBytes * 8) / 1_000_000 / seconds
}

export function trimmedMean(values: number[], trimFraction: number): number {
  if (values.length === 0) {
    return 0
  }
  if (values.length < 4) {
    return average(values)
  }

  const sorted = [...values].sort((a, b) => a - b)
  const trim = Math.max(Math.floor(sorted.length * trimFraction), 0)
  const end = Math.max(sorted.length - trim, trim + 1)
  if (trim >= end) {
    return average(sorted)
  }

  return average(sorted.slice(trim, end))
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}
