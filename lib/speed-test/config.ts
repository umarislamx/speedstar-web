/**
 * LibreSpeed-inspired measurement parameters.
 * Port of SpeedStar Android `SpeedTestConfig` (engine 2.2.0-mobile).
 *
 * Scoring and orchestration must read only from this config.
 */
export const SPEED_TEST_CONFIG = {
  downloadDurationMs: 7_000,
  uploadDurationMs: 5_500,
  downloadGraceMs: 800,
  uploadGraceMs: 800,
  graphSettleMs: 120,
  sampleIntervalMs: 250,
  downloadStreams: 4,
  uploadStreams: 4,
  downloadStreamsRetry: 3,
  uploadStreamsRetry: 3,
  streamStaggerMs: 200,
  downloadStartTimeoutMs: 8_000,
  pingWarmupCount: 2,
  pingSampleCount: 6,
  pingIntervalMs: 40,
  pingTimeoutMs: 800,
  loadedLatencySampleCount: 6,
  loadedLatencyIntervalMs: 900,
  connectTimeoutMs: 8_000,
  readTimeoutMs: 45_000,
  callTimeoutMs: 60_000,
  uploadPostBytes: 262_144,
  downloadRequestBytes: 10_000_000,
  downloadRequestBytesRetry: 2_000_000,
  scorerTrimFraction: 0.1,
  downloadMaxRetries: 1,
  metaTimeoutMs: 2_500,
  minConnectingMs: 400,
  connectingWatchdogMs: 10_000,
  overallTestTimeoutMs: 90_000,
  offlineWaitMs: 1_200,
  minPhaseBytes: 500_000,
  minPostGraceSamples: 3,
  candidateCacheMs: 5_000,
  coloFetchTimeoutMs: 800,
  liveCumulativeMinMs: 500,
  engineVersion: "2.2.0-web",
} as const

export type SpeedTestConfig = typeof SPEED_TEST_CONFIG

export function loadedLatencySpacingMs(
  durationMs: number,
  graceMs: number,
  config: SpeedTestConfig = SPEED_TEST_CONFIG
): number {
  const target = Math.max(config.loadedLatencySampleCount, 1)
  const usable = Math.max(durationMs - graceMs, target)
  return Math.max(Math.floor(usable / target), 400)
}
