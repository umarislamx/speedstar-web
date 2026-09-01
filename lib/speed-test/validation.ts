import { SPEED_TEST_CONFIG, type SpeedTestConfig } from "@/lib/speed-test/config"
import type { LatencyResult, ThroughputResult } from "@/lib/speed-test/types"

export type PhaseValidation = {
  ok: boolean
  reason: string
}

function ok(): PhaseValidation {
  return { ok: true, reason: "" }
}

function fail(reason: string): PhaseValidation {
  return { ok: false, reason }
}

/**
 * Port of Android `ResultValidator`.
 */
export function validateLatency(
  latency: LatencyResult,
  config: SpeedTestConfig = SPEED_TEST_CONFIG
): PhaseValidation {
  if (latency.samplesMs.length < config.pingSampleCount / 2) {
    return fail(`Too few latency samples (${latency.samplesMs.length})`)
  }
  if (latency.minMs <= 0) {
    return fail("Latency measurement returned 0 ms")
  }
  return ok()
}

export function validateDownload(
  result: ThroughputResult,
  config: SpeedTestConfig = SPEED_TEST_CONFIG
): PhaseValidation {
  return validateThroughput(result, config.downloadGraceMs, "Download", config)
}

export function validateUpload(
  result: ThroughputResult,
  config: SpeedTestConfig = SPEED_TEST_CONFIG
): PhaseValidation {
  return validateThroughput(result, config.uploadGraceMs, "Upload", config)
}

function validateThroughput(
  result: ThroughputResult,
  graceMs: number,
  label: "Download" | "Upload",
  config: SpeedTestConfig
): PhaseValidation {
  if (result.totalBytesConfirmed < config.minPhaseBytes) {
    return fail(
      `${label} transferred ${result.totalBytesConfirmed} bytes (min ${config.minPhaseBytes})`
    )
  }

  const postGrace = result.samples.filter(
    (sample) => sample.activeElapsedMs >= graceMs && sample.mbps > 0
  ).length

  if (postGrace < config.minPostGraceSamples) {
    return fail(
      `${label} had ${postGrace} post-grace samples (min ${config.minPostGraceSamples})`
    )
  }

  if (result.scoredMbps <= 0) {
    return fail(`${label} scored 0 Mbps`)
  }

  return ok()
}
