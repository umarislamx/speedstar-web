export { SPEED_TEST_CONFIG, loadedLatencySpacingMs } from "@/lib/speed-test/config"
export {
  CLOUDFLARE_ENDPOINTS,
  cloudflareDownloadUrl,
  coloCoordinates,
  coloDisplayName,
  createCloudflareEndpoint,
  withDownloadBytes,
} from "@/lib/speed-test/cloudflare"
export { SPEED_TEST_ERROR, speedTestErrorCopy } from "@/lib/speed-test/errors"
export {
  filterOutliers,
  jitter,
  median,
  summarizeUnloadedLatency,
} from "@/lib/speed-test/latency"
export {
  isRunningPhase,
  testingStatusLabel,
  toVisualPhase,
} from "@/lib/speed-test/phase"
export { deriveQuality, qualityRatingLabel } from "@/lib/speed-test/quality"
export {
  cumulativeMbps,
  instantaneousMbps,
  scoreThroughput,
  trimmedMean,
} from "@/lib/speed-test/scoring"
export {
  EMPTY_CLIENT_META,
  EMPTY_NETWORK_DETAILS,
  EMPTY_NETWORK_QUALITY,
  INITIAL_SPEED_TEST_STATE,
  NETWORK_UNKNOWN,
} from "@/lib/speed-test/types"
export {
  validateDownload,
  validateLatency,
  validateUpload,
} from "@/lib/speed-test/validation"

export type { SpeedTestConfig } from "@/lib/speed-test/config"
export type { SpeedTestErrorCopy, SpeedTestErrorMessage } from "@/lib/speed-test/errors"
export type { PhaseValidation } from "@/lib/speed-test/validation"
export type {
  ClientMeta,
  LatencyResult,
  Measurement,
  NetworkDetails,
  NetworkQuality,
  PacketLossStat,
  QualityRating,
  ServerEndpoint,
  SpeedTestResult,
  SpeedTestState,
  SpeedTestVisualPhase,
  TestingPhase,
  ThroughputResult,
  ThroughputSample,
} from "@/lib/speed-test/types"
